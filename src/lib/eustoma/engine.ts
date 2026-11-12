import {
  STRIDE,
  TAU,
  buildFlower,
  clamp,
  cross,
  dot,
  smooth,
  sub,
  unit,
  type Vec3,
} from './geometry';
import {
  RIPPLES,
  asciiFragment,
  blurFragment,
  compositeFragment,
  meshFragment,
  meshVertex,
  quadVertex,
} from './shaders';

export type Eustoma = {
  destroy: () => void;
  refreshTheme: () => void;
  ripple: () => void;
  tilt: (radians: number) => void;
  turn: (radians: number) => void;
};

type Options = {
  // An element drawn over the stage, such as the section links, that the
  // annotations should keep clear of.
  avoid?: () => Element | null;
  onMessage: (message: string | null) => void;
  reducedMotion: boolean;
  stage: HTMLElement;
};

type Program = {
  program: WebGLProgram;
  u: (name: string) => WebGLUniformLocation | null;
};

type Target = {
  buffer: WebGLRenderbuffer | null;
  framebuffer: WebGLFramebuffer;
  h: number;
  texture: WebGLTexture;
  w: number;
};

type Rect = { bottom: number; left: number; right: number; top: number };
type Rgba = [number, number, number, number];

const SWAY = 0.34; // radians either side of the composed view while at rest
const FOLLOW = 0.32; // how far the flower turns toward the pointer
const TURN = 0.0085; // radians per pixel of horizontal drag
const TILT = 0.004; // radians per pixel of vertical drag
const PITCH = 0.17; // the composed camera elevation
const PITCH_MIN = -0.25;
const PITCH_MAX = 0.8;
const ZOOM = 1.6; // the blossoms fill the frame and the stems run off below
const DISTANCE = 9.4;
const GUST = 0.003; // bend velocity per pixel of pointer travel
const SPRING = 14;
const DAMPING = 1.7;
const BREATH_RADIUS = 0.3;
const RIPPLE_LIFE = 1.7; // seconds
const RIPPLE_SPEED = 520; // pixels per second
const SETTLE = 4000; // ms a paused flower keeps animating after input
const PIXEL_BUDGET = 2_200_000;
const MONO =
  'ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Consolas, monospace';
const GLYPHS = ' .:·-=+*0123456789ABCDEF<>/|()[]';

// Annotations hang from a point on the plant and sit beside the part they
// describe: `around` is its center and `reach` its radius, in plant units.
type Label = {
  around: Vec3;
  dy: number;
  point: Vec3;
  reach: number;
  side: number;
};

const BLOOM: Vec3 = [0.51, 2.14, 0.25];
const SIDE_BLOOM: Vec3 = [-0.6, 0.8, 0.58];
const ROOT: Vec3 = [0.05, -1.77, 0.03];

const createLabels = (): Label[] => [
  { around: [0.16, 1.51, 0], dy: -27, point: BLOOM, reach: 1.15, side: 1 },
  { around: [-0.62, 0.67, 0.29], dy: 4, point: SIDE_BLOOM, reach: 0.85, side: -1 },
  { around: [0.05, -1.77, 0.03], dy: 8, point: ROOT, reach: 0.12, side: 1 },
];

const INK: Record<'dark' | 'light', { line: Rgba; text: Rgba }> = {
  dark: { line: [153, 146, 171, 0.38], text: [193, 188, 200, 0.68] },
  light: { line: [105, 89, 123, 0.45], text: [84, 71, 103, 0.82] },
};

const rgba = ([r, g, b, a]: Rgba, fade: number) =>
  `rgba(${r},${g},${b},${a * fade})`;

const ease = (dt: number, seconds: number) => 1 - Math.exp(-dt / seconds);

const degrees = (radians: number) => {
  const d = (radians * 180) / Math.PI;
  return ((((d + 180) % 360) + 360) % 360) - 180;
};

function parseColor(value: string): Vec3 | null {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim());
  if (hex) {
    const digits =
      hex[1].length === 3
        ? [...hex[1]].map((digit) => digit + digit).join('')
        : hex[1];
    const n = Number.parseInt(digits, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const channels = value.match(/[\d.]+/g);
  if (value.trim().startsWith('rgb') && channels && channels.length >= 3) {
    return [Number(channels[0]), Number(channels[1]), Number(channels[2])];
  }
  return null;
}

// The canvas paints its own paper, so it reads the page's to stay seamless.
function readTheme(element: Element) {
  const dark = document.documentElement.classList.contains('dark');
  const paper =
    parseColor(getComputedStyle(element).getPropertyValue('--paper')) ??
    (dark ? [36, 34, 32] : [246, 246, 246]);
  return { dark, paper };
}

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    }
  }
  return out;
}

function compile(
  gl: WebGL2RenderingContext,
  vertex: string,
  fragment: string,
): Program {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader failed');
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Program failed');
  }
  const locations = new Map<string, WebGLUniformLocation | null>();
  return {
    program,
    u: (name) => {
      if (!locations.has(name)) {
        locations.set(name, gl.getUniformLocation(program, name));
      }
      return locations.get(name) ?? null;
    },
  };
}

function setTextureParameters(gl: WebGL2RenderingContext) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

// A small glyph atlas drawn at startup keeps the artwork free of assets.
function createAtlas(gl: WebGL2RenderingContext) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 256, 160);
  ctx.fillStyle = '#fff';
  ctx.font = `27px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 32; i++) {
    ctx.fillText(GLYPHS[i] || '.', (i % 8) * 32 + 16, Math.floor(i / 8) * 40 + 21);
  }
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  setTextureParameters(gl);
  return texture;
}

function createTarget(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  depth = false,
): Target {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  setTextureParameters(gl);
  const framebuffer = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  let buffer: WebGLRenderbuffer | null = null;
  if (depth) {
    buffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, buffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      buffer,
    );
  }
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('Incomplete framebuffer');
  }
  return { buffer, framebuffer, h, texture, w };
}

function setup(
  gl: WebGL2RenderingContext,
  flower: ReturnType<typeof buildFlower>,
) {
  const mesh = compile(gl, meshVertex, meshFragment);
  const ascii = compile(gl, quadVertex, asciiFragment);
  const blur = compile(gl, quadVertex, blurFragment);
  const composite = compile(gl, quadVertex, compositeFragment);

  const meshVAO = gl.createVertexArray();
  gl.bindVertexArray(meshVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, flower.vertices, gl.STATIC_DRAW);
  let offset = 0;
  for (const [i, size] of [3, 3, 2, 3].entries()) {
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, size, gl.FLOAT, false, STRIDE * 4, offset * 4);
    offset += size;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flower.indices, gl.STATIC_DRAW);

  const quadVAO = gl.createVertexArray();
  gl.bindVertexArray(quadVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  return { ascii, atlas: createAtlas(gl), blur, composite, mesh, meshVAO, quadVAO };
}

export function createEustoma(options: Options): Eustoma | null {
  const { stage } = options;
  const canvas = document.createElement('canvas');
  const overlay = document.createElement('canvas');
  canvas.className = 'eustoma-flower';
  overlay.className = 'eustoma-annotations';
  canvas.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');

  const context = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: true,
    powerPreference: 'low-power',
    preserveDrawingBuffer: false,
  });
  const context2d = overlay.getContext('2d');
  if (!context || !context2d) return null;
  const gl: WebGL2RenderingContext = context;
  const ink: CanvasRenderingContext2D = context2d;

  const flower = buildFlower();
  let gpu: ReturnType<typeof setup>;
  try {
    gpu = setup(gl, flower);
  } catch (error) {
    console.error(error);
    return null;
  }
  stage.append(canvas, overlay);

  const still = options.reducedMotion;
  let width = 1;
  let height = 1;
  let dpr = 1;
  let targets: Target[] = [];
  let theme = readTheme(stage);
  let clock = 0;

  let angle = -0.2;
  let spin = 0;
  let calm = 0; // seconds since the flower was last turned by hand
  let pitch = PITCH;
  const bend = [0, 0];
  const bendVelocity = [0, 0];
  let breath = 0;
  let burst = 0;
  let breathX = 0;
  let breathY = 0;
  let presence = 0;
  let reticleX = 0;
  let reticleY = 0;
  let reticleSize = 14;
  const pointer = {
    down: false,
    id: -1,
    inside: false,
    lastT: 0,
    moved: 0,
    startT: 0,
    vx: 0,
    vy: 0,
    x: 0,
    y: 0,
  };
  const ripples: { age: number; x: number; y: number }[] = [];
  const rippleData = new Float32Array(RIPPLES * 4);
  const labels = createLabels();
  let avoid: Rect | null = null;
  let cameraMatrix = new Float32Array(16);

  let visible = true;
  let lost = false;
  let destroyed = false;
  let request = 0;
  let last: number | null = null;
  let settleUntil = 0;

  const toNdc = (x: number, y: number) => [
    (x / width) * 2 - 1,
    1 - (y / height) * 2,
  ];

  function camera() {
    const aspect = width / height;
    // Narrow canvases pull back so the blossoms still fit side to side.
    const distance = (DISTANCE * Math.max(1, 0.85 / aspect)) / ZOOM;
    // Framed on the blossoms rather than the whole plant.
    const center = 0.13 + (ZOOM - 1) * 1.7;
    const at: Vec3 = [0, center, 0];
    const eye: Vec3 = [
      0,
      center + distance * Math.sin(pitch),
      distance * Math.cos(pitch),
    ];
    const z = unit(sub(eye, at));
    const x = unit(cross([0, 1, 0], z));
    const y = cross(z, x);
    const view = new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
    ]);
    const f = 1 / Math.tan((36 * Math.PI) / 360);
    const near = 0.1;
    const far = 30;
    const projection = new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) / (near - far), -1,
      0, 0, (2 * far * near) / (near - far), 0,
    ]);
    return multiply(projection, view);
  }

  // Where a point on the plant sits after turning and bending, mirroring the
  // mesh shader closely enough for the annotations to stay pinned.
  function place(p: Vec3): Vec3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const lever = clamp((p[1] + 2) / 4.2) ** 2;
    return [
      p[0] * c + p[2] * s + bend[0] * lever,
      p[1],
      -p[0] * s + p[2] * c + bend[1] * lever,
    ];
  }

  const project = (p: Vec3) => toScreen(place(p));

  function toScreen(q: Vec3): [number, number] {
    const m = cameraMatrix;
    const r = [0, 1, 2, 3].map(
      (i) => m[i] * q[0] + m[4 + i] * q[1] + m[8 + i] * q[2] + m[12 + i],
    );
    return [
      ((r[0] / r[3]) * 0.5 + 0.5) * width,
      (0.5 - (r[1] / r[3]) * 0.5) * height,
    ];
  }

  function rebuildTargets() {
    for (const t of targets) {
      gl.deleteTexture(t.texture);
      gl.deleteFramebuffer(t.framebuffer);
      if (t.buffer) gl.deleteRenderbuffer(t.buffer);
    }
    const w = canvas.width;
    const h = canvas.height;
    const hw = Math.ceil(w / 2);
    const hh = Math.ceil(h / 2);
    targets = [
      createTarget(gl, w, h, true),
      createTarget(gl, w, h),
      createTarget(gl, hw, hh),
      createTarget(gl, hw, hh),
    ];
  }

  function measureAvoid() {
    const element = options.avoid?.();
    if (!element) {
      avoid = null;
      return;
    }
    const a = element.getBoundingClientRect();
    const c = stage.getBoundingClientRect();
    const rect = {
      bottom: a.bottom - c.top,
      left: a.left - c.left,
      right: a.right - c.left,
      top: a.top - c.top,
    };
    const overlaps =
      rect.right > 0 && rect.left < width && rect.bottom > 0 && rect.top < height;
    avoid = overlaps ? rect : null;
  }

  function resize() {
    if (lost || destroyed) return;
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(
      window.devicePixelRatio || 1,
      2,
      Math.sqrt(PIXEL_BUDGET / (width * height)),
    );
    const w = Math.max(1, Math.round(width * dpr));
    const h = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== w || canvas.height !== h || targets.length === 0) {
      canvas.width = w;
      canvas.height = h;
      overlay.width = w;
      overlay.height = h;
      rebuildTargets();
    }
    measureAvoid();
    draw();
  }

  function step(dt: number) {
    if (!still) clock += dt;

    // A drag sets the angle directly and a fling coasts to a stop. At rest
    // the flower sways around the view it was composed for and turns a little
    // toward the pointer, like a bloom following the light. Turned away by
    // hand, it comes back round once it has been left alone for a moment.
    if (!pointer.down) {
      calm += dt;
      spin = still ? 0 : spin * Math.exp(-dt / 1.1);
      angle += spin * dt;
      if (!still) {
        const rest =
          Math.sin(clock * 0.11) * SWAY + clamp(breathX, -1, 1) * FOLLOW * presence;
        const target = rest + Math.round((angle - rest) / TAU) * TAU;
        const settle = smooth(0.6, 2.4, calm) * clamp(1 - Math.abs(spin) / 1.5);
        angle += (target - angle) * ease(dt, 2.2) * settle;
      }
      pitch += (PITCH - pitch) * ease(dt, 2.4);
    }

    // The wind is a damped spring rooted at the base of the stems.
    for (let i = 0; i < 2; i++) {
      bendVelocity[i] += (-SPRING * bend[i] - DAMPING * bendVelocity[i]) * dt;
      bend[i] = clamp(bend[i] + bendVelocity[i] * dt, -0.7, 0.7);
    }

    const present = pointer.inside || pointer.down ? 1 : 0;
    presence += (present - presence) * ease(dt, 0.18);
    pointer.vx *= Math.exp(-dt / 0.12);
    pointer.vy *= Math.exp(-dt / 0.12);
    const speed = Math.min(Math.hypot(pointer.vx, pointer.vy) / 1400, 1);
    const wanted = still || pointer.down ? 0 : present * (0.45 + 0.55 * speed);
    breath += (wanted - breath) * ease(dt, wanted > breath ? 0.12 : 0.5);
    burst *= Math.exp(-dt / 0.35);
    const [nx, ny] = toNdc(pointer.x, pointer.y);
    breathX += (nx - breathX) * ease(dt, 0.07);
    breathY += (ny - breathY) * ease(dt, 0.07);
    reticleX += (pointer.x - reticleX) * ease(dt, still ? 0.001 : 0.05);
    reticleY += (pointer.y - reticleY) * ease(dt, still ? 0.001 : 0.05);
    reticleSize += ((pointer.down ? 9 : 14) - reticleSize) * ease(dt, 0.08);

    for (const r of ripples) r.age += dt;
    while (ripples.length > 0 && ripples[0].age > RIPPLE_LIFE) ripples.shift();
  }

  function annotate() {
    ink.setTransform(dpr, 0, 0, dpr, 0, 0);
    ink.clearRect(0, 0, width, height);
    const colors = theme.dark ? INK.dark : INK.light;
    ink.lineWidth = 0.6;

    // The reticle follows the pointer like a viewfinder and tightens on grab.
    if (presence > 0.01) {
      const s = reticleSize;
      ink.strokeStyle = rgba(colors.line, presence * 1.3);
      for (const [a, b] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        ink.beginPath();
        ink.moveTo(reticleX + a * (s - 5), reticleY + b * s);
        ink.lineTo(reticleX + a * s, reticleY + b * s);
        ink.lineTo(reticleX + a * s, reticleY + b * (s - 5));
        ink.stroke();
      }
    }

    ink.font = `9px ${MONO}`;
    // Each label sits beside its blossom on the side away from the stem, so
    // it stays in open paper however the flower is turned. The side only
    // flips once the blossom is clearly across, so labels never flicker.
    const callout = (label: Label, text: string) => {
      const [px, py] = project(label.point);
      if (px < 5 || px > width - 5 || py < 10 || py > height - 50) return;
      const center = place(label.around);
      const [cx] = toScreen(center);
      const [axis] = project([0, label.around[1], 0]);
      if (cx - axis > 12) label.side = 1;
      else if (cx - axis < -12) label.side = -1;
      const left = label.side < 0;
      const [edge] = toScreen([center[0] + label.reach, center[1], center[2]]);
      const span = ink.measureText(text).width;
      const gap = Math.abs(edge - cx) + 14;
      const tx = left ? cx - gap : cx + gap;
      // With no open paper beside the blossom, leave the label out.
      if ((left ? tx - span : tx + span) < 16 || (left ? tx : tx + span) > width - 16) {
        return;
      }
      const x0 = left ? tx - span : tx;
      let ty = clamp(py + label.dy, 60, height - 85);
      if (
        avoid &&
        x0 + span > avoid.left &&
        x0 < avoid.right &&
        ty + 6 > avoid.top &&
        ty - 12 < avoid.bottom
      ) {
        ty = avoid.bottom + 22;
      }
      ink.strokeStyle = rgba(colors.line, 1);
      ink.fillStyle = rgba(colors.text, 1);
      ink.setLineDash([1, 4]);
      ink.beginPath();
      ink.moveTo(px, py);
      ink.lineTo(left ? tx + 6 : tx - 6, ty - 3);
      ink.stroke();
      ink.setLineDash([]);
      ink.fillRect(px - 1, py - 1, 2, 2);
      ink.textAlign = left ? 'right' : 'left';
      ink.fillText(text, tx, ty);
    };
    const [blossomLabel, sideLabel, rootLabel] = labels;
    const where = place(SIDE_BLOOM);
    const lean =
      -2.3 + degrees(Math.atan2(bend[0], 4.2)) + Math.sin(clock * 0.18) * 0.3;
    callout(blossomLabel, `θ ${degrees(angle).toFixed(1)}°`);
    callout(sideLabel, `X ${where[0].toFixed(2)}  Y ${where[1].toFixed(2)}`);
    callout(rootLabel, `∠ ${lean.toFixed(1)}°`);
  }

  function draw() {
    if (lost || destroyed || targets.length === 0) return;
    cameraMatrix = camera();
    const [scene, letters, glowH, glowV] = targets;

    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer);
    gl.viewport(0, 0, scene.w, scene.h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    const { mesh } = gpu;
    gl.useProgram(mesh.program);
    gl.bindVertexArray(gpu.meshVAO);
    gl.uniformMatrix4fv(mesh.u('u_camera'), false, cameraMatrix);
    gl.uniform1f(mesh.u('u_time'), clock);
    gl.uniform1f(mesh.u('u_angle'), angle);
    gl.uniform1f(mesh.u('u_aspect'), width / height);
    gl.uniform2f(mesh.u('u_bend'), bend[0], bend[1]);
    gl.uniform4f(
      mesh.u('u_breath'),
      breathX,
      breathY,
      BREATH_RADIUS,
      Math.max(breath, burst * 1.8),
    );
    gl.drawElements(gl.TRIANGLES, flower.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.DEPTH_TEST);

    const pass = (program: Program, target: Target | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(0, 0, target ? target.w : canvas.width, target ? target.h : canvas.height);
      gl.useProgram(program.program);
      gl.bindVertexArray(gpu.quadVAO);
    };
    const bind = (program: Program, name: string, texture: WebGLTexture, slot: number) => {
      gl.activeTexture(gl.TEXTURE0 + slot);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(program.u(name), slot);
    };
    const quad = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const { ascii, blur, composite } = gpu;
    pass(ascii, letters);
    bind(ascii, 'u_scene', scene.texture, 0);
    bind(ascii, 'u_atlas', gpu.atlas, 1);
    gl.uniform2f(ascii.u('u_size'), scene.w, scene.h);
    gl.uniform2f(ascii.u('u_cell'), 3.8 * dpr, 5.1 * dpr);
    gl.uniform1f(ascii.u('u_time'), clock);
    rippleData.fill(0);
    for (const [i, r] of ripples.entries()) {
      const life = 1 - r.age / RIPPLE_LIFE;
      rippleData.set(
        [r.x * dpr, (height - r.y) * dpr, r.age * RIPPLE_SPEED * dpr, life * life],
        i * 4,
      );
    }
    gl.uniform4fv(ascii.u('u_ripples'), rippleData);
    gl.uniform3f(
      ascii.u('u_halo'),
      reticleX * dpr,
      (height - reticleY) * dpr,
      presence * (pointer.down ? 0.5 : 1),
    );
    quad();

    pass(blur, glowH);
    bind(blur, 'u_image', letters.texture, 0);
    gl.uniform2f(blur.u('u_step'), 2.4 / letters.w, 0);
    quad();
    pass(blur, glowV);
    bind(blur, 'u_image', glowH.texture, 0);
    gl.uniform2f(blur.u('u_step'), 0, 1.5 / glowH.h);
    quad();

    pass(composite, null);
    bind(composite, 'u_image', letters.texture, 0);
    bind(composite, 'u_glow', glowV.texture, 1);
    gl.uniform1f(composite.u('u_lightMode'), theme.dark ? 0 : 1);
    gl.uniform2f(composite.u('u_size'), canvas.width, canvas.height);
    gl.uniform3f(
      composite.u('u_paper'),
      theme.paper[0] / 255,
      theme.paper[1] / 255,
      theme.paper[2] / 255,
    );
    quad();

    annotate();
  }

  function schedule() {
    if (request || lost || destroyed || !visible || document.hidden) return;
    request = requestAnimationFrame(frame);
  }

  function frame(now: number) {
    request = 0;
    const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
    last = now;
    step(dt);
    draw();
    if (!still || now < settleUntil) schedule();
    if (!request) last = null;
  }

  // Input keeps a paused flower animating long enough for flings, springs
  // and ripples to come to rest.
  function wake() {
    settleUntil = Math.max(settleUntil, performance.now() + SETTLE);
    schedule();
  }

  function local(event: PointerEvent) {
    const rect = stage.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  function ripple(x = width / 2, y = height / 2) {
    if (still) return;
    ripples.push({ age: 0, x, y });
    if (ripples.length > RIPPLES) ripples.shift();
    // A tap pokes the plant away from where it landed.
    const [plantX] = project([0, 0.4, 0]);
    const push = clamp((plantX - x) / (width * 0.3), -1, 1);
    const near = Math.exp(-(((x - plantX) / (width * 0.35)) ** 2));
    bendVelocity[0] = clamp(bendVelocity[0] + push * 0.9, -3, 3);
    bendVelocity[1] = clamp(bendVelocity[1] - near * 0.7, -3, 3);
    [breathX, breathY] = toNdc(x, y);
    burst = 1;
    wake();
  }

  function onPointerMove(event: PointerEvent) {
    const [x, y] = local(event);
    const tracking = pointer.inside || pointer.down;
    if (tracking) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const elapsed = Math.max((event.timeStamp - pointer.lastT) / 1000, 1 / 240);
      pointer.vx = pointer.vx * 0.5 + (dx / elapsed) * 0.5;
      pointer.vy = pointer.vy * 0.5 + (dy / elapsed) * 0.5;
      if (pointer.down && event.pointerId === pointer.id) {
        pointer.moved += Math.hypot(dx, dy);
        angle += dx * TURN;
        pitch = clamp(pitch + dy * TILT, PITCH_MIN, PITCH_MAX);
      } else if (!still) {
        // Passing over the plant stirs it, most strongly near the stems.
        const near = Math.exp(-((x / width - 0.5) ** 2) * 6);
        bendVelocity[0] = clamp(bendVelocity[0] + dx * GUST * near, -3, 3);
      }
    } else {
      reticleX = x;
      reticleY = y;
      [breathX, breathY] = toNdc(x, y);
    }
    pointer.x = x;
    pointer.y = y;
    pointer.lastT = event.timeStamp;
    pointer.inside = true;
    wake();
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    onPointerMove(event);
    stage.setPointerCapture(event.pointerId);
    pointer.down = true;
    pointer.id = event.pointerId;
    pointer.moved = 0;
    pointer.startT = event.timeStamp;
    pointer.vx = 0;
    pointer.vy = 0;
    spin = 0;
    calm = 0;
    stage.dataset.dragging = 'true';
  }

  function release(event: PointerEvent, cancelled: boolean) {
    if (!pointer.down || event.pointerId !== pointer.id) return;
    pointer.down = false;
    delete stage.dataset.dragging;
    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
    if (!cancelled) {
      const tap = pointer.moved < 6 && event.timeStamp - pointer.startT < 400;
      if (tap) ripple(pointer.x, pointer.y);
      else if (!still) spin = clamp(pointer.vx * TURN, -6, 6);
      calm = 0;
    }
    // Touch has no hover, so the reticle leaves with the finger.
    if (cancelled || event.pointerType !== 'mouse') pointer.inside = false;
    wake();
  }

  const onPointerUp = (event: PointerEvent) => release(event, false);
  const onPointerCancel = (event: PointerEvent) => release(event, true);

  function onPointerLeave() {
    if (!pointer.down) pointer.inside = false;
    wake();
  }

  function onVisibility() {
    last = null;
    schedule();
  }

  function onContextLost(event: Event) {
    event.preventDefault();
    lost = true;
    if (request) cancelAnimationFrame(request);
    request = 0;
    options.onMessage(
      'Rendering was interrupted. The flower returns when the browser restores it.',
    );
  }

  function onContextRestored() {
    try {
      gpu = setup(gl, flower);
    } catch (error) {
      console.error(error);
      return;
    }
    lost = false;
    targets = [];
    options.onMessage(null);
    resize();
    wake();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    last = null;
    schedule();
  });
  intersection.observe(stage);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerCancel);
  stage.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  resize();
  schedule();

  return {
    destroy() {
      destroyed = true;
      if (request) cancelAnimationFrame(request);
      resizeObserver.disconnect();
      intersection.disconnect();
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerCancel);
      stage.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      delete stage.dataset.dragging;
      // Browsers cap live WebGL contexts, so give this one back right away.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      overlay.remove();
    },
    refreshTheme() {
      theme = readTheme(stage);
      if (!request) draw();
    },
    ripple: () => ripple(),
    tilt(radians) {
      pitch = clamp(pitch + radians, PITCH_MIN, PITCH_MAX);
      wake();
    },
    turn(radians) {
      if (still) angle += radians;
      else spin += radians * 3;
      calm = 0;
      wake();
    },
  };
}
