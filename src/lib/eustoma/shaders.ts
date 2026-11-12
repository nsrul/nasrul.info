// Four passes: the mesh is lit into an offscreen scene, the scene is sampled
// into a grid of glyphs, the glyphs are blurred into a glow, and the composite
// lays light (dark theme) or pigment (light theme) onto the page's paper.

const header = '#version 300 es\nprecision highp float;\n';

// a_meta holds the material id, a noise seed and the leaf rib distance.
export const meshVertex = `${header}
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;
layout(location = 3) in vec3 a_meta;
uniform mat4 u_camera;
uniform float u_time, u_angle, u_aspect;
uniform vec2 u_bend;
uniform vec4 u_breath;
out vec3 v_normal, v_position;
out vec2 v_uv;
out vec3 v_meta;
void main() {
  vec3 p = a_position;
  float sway = smoothstep(-2.0, 1.5, p.y);
  p.x += sin(u_time * 0.42 + p.y * 0.8) * 0.022 * sway;
  p.z += cos(u_time * 0.31 + p.y * 0.6) * 0.025 * sway;
  mat3 rotation = mat3(
    cos(u_angle), 0.0, -sin(u_angle),
    0.0, 1.0, 0.0,
    sin(u_angle), 0.0, cos(u_angle)
  );
  vec3 q = rotation * p;

  // Wind bends the plant from its root, so the blossoms travel farthest.
  float lever = clamp((p.y + 2.0) / 4.2, 0.0, 1.0);
  q.xz += u_bend * lever * lever;

  // The pointer breathes on the plant: surfaces near it part and fall back.
  vec4 clip = u_camera * vec4(q, 1.0);
  vec2 d = (clip.xy / clip.w - u_breath.xy) * vec2(u_aspect, 1.0);
  float push = exp(-dot(d, d) / (u_breath.z * u_breath.z)) * u_breath.w * sway;
  q.xy += d / (length(d) + 0.04) * push * 0.17;
  q.z -= push * 0.12;

  v_position = p;
  v_normal = rotation * a_normal;
  v_uv = a_uv;
  v_meta = a_meta;
  gl_Position = u_camera * vec4(q, 1.0);
}
`;

export const meshFragment = `${header}
in vec3 v_normal, v_position;
in vec2 v_uv;
in vec3 v_meta;
out vec4 frag;
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
void main() {
  float material = v_meta.x;
  vec3 n = normalize(v_normal);
  float light = abs(dot(n, normalize(vec3(-0.4, 0.7, 1.1))));
  float rim = pow(1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0))), 2.0);
  float textureNoise = hash(floor(v_position * 105.0) + v_meta.y);
  float vein = pow(0.5 + 0.5 * cos(v_uv.y * 91.0 + sin(v_uv.x * 7.0) * 1.5), 16.0);
  vec3 color;
  if (material < 1.5) {
    color = mix(vec3(0.055, 0.26, 0.21), vec3(0.46, 0.78, 0.66), light * 0.6 + rim * 0.35);
    if (material > 0.5) color *= 0.64 + 0.32 * (1.0 - smoothstep(0.0, 0.4, v_meta.z));
    color *= 0.6 + textureNoise * 0.8;
  } else if (material < 3.5) {
    color = mix(vec3(0.22, 0.085, 0.38), vec3(0.82, 0.66, 1.0), pow(light, 1.5) * 0.75 + rim * 0.3);
    color *= gl_FrontFacing ? 1.0 : 0.68;
    color *= 0.66 + 0.34 * smoothstep(0.1, 0.9, v_uv.x);
    float edge = smoothstep(0.91, 1.0, v_uv.x) + pow(abs(v_uv.y * 2.0 - 1.0), 20.0);
    color += vec3(0.28, 0.24, 0.3) * min(edge, 1.0);
    color *= 0.7 + textureNoise * 0.6;
    color *= 1.0 - vein * 0.28;
    if (material > 2.5) color *= 0.77;
  } else {
    color = vec3(0.48, 0.5, 0.24) * (0.5 + 0.5 * light);
  }
  frag = vec4(color, 1.0);
}
`;

export const quadVertex = `${header}
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const RIPPLES = 4;

// u_ripples holds rings sent out by clicks (x, y, radius in target pixels,
// strength). u_halo is the pointer (x, y in target pixels, strength). Both
// scramble the glyphs they cross and raise a latent character field from the
// bare paper, so the empty canvas answers too.
export const asciiFragment = `${header}
in vec2 v_uv;
uniform sampler2D u_scene, u_atlas;
uniform vec2 u_size, u_cell;
uniform float u_time;
uniform vec4 u_ripples[${RIPPLES}];
uniform vec3 u_halo;
out vec4 frag;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 cells = v_uv * u_size / u_cell;
  vec2 grid = floor(cells), local = fract(cells);
  vec2 center = (grid + 0.5) * u_cell;
  vec3 c = texture(u_scene, center / u_size).rgb;
  float l = max(c.r, max(c.g, c.b));
  float noise = hash(grid);

  float ring = 0.0;
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec4 r = u_ripples[i];
    float d = (length(center - r.xy) - r.z) / (u_cell.x * 6.0);
    ring += r.w * exp(-d * d);
  }
  ring = min(ring, 1.0);
  vec2 h = (center - u_halo.xy) / (u_cell.x * 22.0);
  float halo = u_halo.z * exp(-dot(h, h));

  float index;
  if (l < 0.026) {
    float reveal = ring * 0.9 + halo * 0.4;
    if (noise < 0.5 || reveal < 0.02) {
      frag = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    c = vec3(0.3, 0.22, 0.42) * reveal;
    // Rings raise full characters; the pointer's halo only stirs up dust.
    float churn = fract(noise * 7.31 + floor(u_time * 6.0) * 0.113);
    index = ring > halo ? 7.0 + floor(churn * 23.0) : 1.0 + floor(churn * 6.0);
  } else {
    if (l < 0.16) index = 1.0 + floor(noise * 6.0);
    else index = 7.0 + floor(noise * 23.0);
    if (c.g > c.r * 1.4 && noise > 0.68) index = 28.0;
    if (ring > 0.08) index = 7.0 + floor(fract(noise * 13.7 + floor(u_time * 20.0) * 0.171) * 23.0);
    c = mix(c, c * 1.75 + vec3(0.05, 0.025, 0.075), smoothstep(0.15, 0.6, l));
    c *= 1.0 + ring * 0.9;
  }
  vec2 tile = vec2(mod(index, 8.0), 3.0 - floor(index / 8.0));
  vec2 atlasUV = (tile + vec2(local.x * 0.68 + 0.16, local.y * 0.8 + 0.1)) / vec2(8.0, 4.0);
  float glyph = texture(u_atlas, atlasUV).r;
  float flicker = 0.92 + 0.08 * sin(u_time * 1.4 + noise * 60.0);
  frag = vec4(c * glyph * flicker, 1.0);
}
`;

export const blurFragment = `${header}
in vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_step;
out vec4 frag;
void main() {
  vec3 c = texture(u_image, v_uv).rgb * 0.227027;
  c += (texture(u_image, v_uv + u_step * 1.384615).rgb + texture(u_image, v_uv - u_step * 1.384615).rgb) * 0.316216;
  c += (texture(u_image, v_uv + u_step * 3.230769).rgb + texture(u_image, v_uv - u_step * 3.230769).rgb) * 0.07027;
  frag = vec4(c, 1.0);
}
`;

export const compositeFragment = `${header}
in vec2 v_uv;
uniform sampler2D u_image, u_glow;
uniform float u_lightMode;
uniform vec2 u_size;
uniform vec3 u_paper;
out vec4 frag;
void main() {
  vec3 letters = texture(u_image, v_uv).rgb;
  vec3 glow = texture(u_glow, v_uv).rgb;
  // The stems dissolve into the paper before they reach the bottom edge.
  float ground = smoothstep(0.0, 0.16, v_uv.y);
  vec3 c = (letters + glow * 1.8) * ground;
  c *= 0.96 + 0.04 * sin(v_uv.y * u_size.y * 3.14159265);
  vec3 dark = 1.0 - (1.0 - u_paper) * (1.0 - clamp(c, 0.0, 1.0));

  vec3 chroma = letters + glow * 0.15;
  bool green = chroma.g > chroma.r * 1.25 && chroma.g > chroma.b * 0.9;
  vec3 pigment = green ? vec3(0.06, 0.31, 0.24) : vec3(0.36, 0.18, 0.53);
  float coverage = clamp(
    max(letters.r, max(letters.g, letters.b)) * 1.75 + max(glow.r, max(glow.g, glow.b)) * 0.18,
    0.0,
    1.0
  );
  vec3 light = mix(u_paper, pigment, coverage * ground);
  frag = vec4(mix(dark, light, u_lightMode), 1.0);
}
`;
