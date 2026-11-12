// The eustoma is built once, in full bloom, as a single indexed mesh: four
// stems, their leaves, and four blossoms with two rings of petals, sepals and
// stamens each.

export type Vec3 = [number, number, number];

type Sample = { point: Vec3; rib?: number };
type SurfaceFn = (u: number, v: number) => Sample;

type Blossom = {
  lean: number;
  p: Vec3;
  s: number;
  seed: number;
  tilt: number;
};

// Floats per vertex: position (3), normal (3), uv (2) and meta (material,
// seed, rib).
export const STRIDE = 11;
export const TAU = Math.PI * 2;

// Material ids, read by the mesh shader from meta.x.
const STEM = 0;
const LEAF = 1;
const PETAL = 2;
const INNER_PETAL = 3;
const STAMEN = 4;

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const add = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

export const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const unit = (a: Vec3): Vec3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};

const blossoms: Blossom[] = [
  { lean: -0.1, p: [0.16, 1.51, 0], s: 0.91, seed: 1, tilt: 0.42 },
  { lean: 0.28, p: [-0.62, 0.67, 0.29], s: 0.58, seed: 9, tilt: 0.48 },
  { lean: -0.14, p: [0.89, 0.3, -0.02], s: 0.29, seed: 17, tilt: 0.32 },
  { lean: 0.13, p: [-0.69, -0.31, 0.24], s: 0.25, seed: 25, tilt: 0.35 },
];

function orient(p: Vec3, b: Blossom): Vec3 {
  const cy = Math.cos(b.tilt);
  const sy = Math.sin(b.tilt);
  const cz = Math.cos(b.lean);
  const sz = Math.sin(b.lean);
  const q: Vec3 = [p[0], p[1] * cy - p[2] * sy, p[1] * sy + p[2] * cy];
  return add(b.p, [q[0] * cz - q[1] * sz, q[0] * sz + q[1] * cz, q[2]]);
}

export function buildFlower() {
  const vertices: number[] = [];
  const indices: number[] = [];

  const surface = (
    fn: SurfaceFn,
    rows: number,
    cols: number,
    material: number,
    seed: number,
  ) => {
    const start = vertices.length / STRIDE;
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const u = i / rows;
        const v = j / cols;
        const { point, rib } = fn(u, v);
        const du = fn(clamp(u + 0.0005), v).point;
        const dv = fn(u, clamp(v + 0.0005)).point;
        const bu = fn(clamp(u - 0.0005), v).point;
        const bv = fn(u, clamp(v - 0.0005)).point;
        const normal = unit(cross(sub(du, bu), sub(dv, bv)));
        vertices.push(...point, ...normal, u, v, material, seed, rib ?? 0);
      }
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const a = start + i * (cols + 1) + j;
        const b = a + cols + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  };

  const tube = (
    path: (u: number) => Vec3,
    radius: number,
    material = STEM,
    seed = 0,
  ) => {
    surface(
      (u, v) => {
        const p = path(u);
        const tangent = unit(sub(path(clamp(u + 0.001)), path(clamp(u - 0.001))));
        const side = unit(
          cross(tangent, Math.abs(tangent[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]),
        );
        const up = unit(cross(tangent, side));
        const a = v * TAU;
        const r = radius * (1 - 0.4 * u);
        const point = p.map(
          (n, i) => n + r * (side[i] * Math.cos(a) + up[i] * Math.sin(a)),
        ) as Vec3;
        return { point };
      },
      55,
      9,
      material,
      seed,
    );
  };

  const stem = (end: Vec3, bend: [number, number], radius = 0.023) => {
    const base: Vec3 = [0, -2, 0];
    const path = (u: number): Vec3 => [
      base[0] + (end[0] - base[0]) * u + bend[0] * Math.sin(u * Math.PI),
      base[1] + (end[1] - base[1]) * u,
      base[2] + (end[2] - base[2]) * u + bend[1] * Math.sin(u * Math.PI),
    ];
    tube(path, radius);
    return path;
  };

  // The center vein is drawn by the leaf shader from the rib value.
  const leaf = (base: Vec3, direction: Vec3, size: number, seed: number) => {
    surface(
      (u, v) => {
        const across = v * 2 - 1;
        const w = Math.pow(Math.sin(Math.PI * u), 0.8) * size * 0.2;
        const point: Vec3 = [
          base[0] + direction[0] * u + across * w * direction[1],
          base[1] + direction[1] * u - across * w * direction[0],
          base[2] +
            direction[2] * u +
            size * 0.13 * Math.sin(Math.PI * u) * (1 - across * across),
        ];
        return { point, rib: Math.abs(across) };
      },
      30,
      12,
      LEAF,
      seed,
    );
  };

  const mainStem = stem(blossoms[0].p, [0.1, 0.07], 0.026);
  stem(blossoms[1].p, [-0.22, 0.02], 0.02);
  stem(blossoms[2].p, [0.04, 0.1], 0.016);
  stem(blossoms[3].p, [-0.19, -0.03], 0.015);

  leaf(mainStem(0.27), [-0.61, 0.36, 0.14], 0.68, 3);
  leaf(mainStem(0.31), [0.54, 0.31, -0.13], 0.63, 4);
  leaf(mainStem(0.49), [0.28, 0.65, -0.11], 0.73, 5);
  leaf(mainStem(0.68), [0.42, 0.57, 0.1], 0.65, 6);
  leaf([-0.37, -0.9, 0.17], [-0.36, 0.47, 0.05], 0.54, 7);

  for (const b of blossoms) {
    for (let ring = 0; ring < 2; ring++) {
      for (let petal = 0; petal < 5; petal++) {
        const phase = (petal * TAU) / 5 + ring * 0.57 + 0.15 * b.seed;
        const s = b.s * (ring ? 0.7 : 1);
        surface(
          (u, v) => {
            const side = v * 2 - 1;
            const spread = 0.77 * Math.sin((u * Math.PI) / 2);
            const a = phase + side * spread;
            const round = 0.7 + 0.3 * Math.sqrt(Math.max(0, 1 - side * side));
            const ripple = Math.sin(side * 13 + phase * 2) * 0.038 * Math.pow(u, 5);
            const radius =
              s *
              (0.035 + Math.sin((u * Math.PI) / 2) * (1.07 + 0.06 * Math.sin(phase))) *
              round;
            const elevation =
              s *
                (0.88 * u -
                  0.35 * u * u * u +
                  0.23 * Math.pow(Math.cos((side * Math.PI) / 2), 2) * Math.pow(u, 4) +
                  ripple) +
              ring * b.s * 0.09;
            return {
              point: orient([Math.cos(a) * radius, elevation, Math.sin(a) * radius], b),
            };
          },
          30,
          18,
          ring ? INNER_PETAL : PETAL,
          b.seed + petal + ring * 5,
        );
      }
    }
    // Small sepals clasp each flower where it meets the stem.
    for (let i = 0; i < 5; i++) {
      const a = (i * TAU) / 5;
      leaf(
        add(b.p, [0, -0.055, 0]),
        [Math.cos(a) * b.s * 0.2, b.s * 0.24, Math.sin(a) * b.s * 0.2],
        b.s * 0.28,
        30 + i,
      );
    }
    for (let i = 0; i < 6; i++) {
      const a = (i * TAU) / 6;
      tube(
        (u) =>
          orient(
            [Math.cos(a) * b.s * 0.055, b.s * (0.04 + u * 0.23), Math.sin(a) * b.s * 0.055],
            b,
          ),
        b.s * 0.011,
        STAMEN,
        i,
      );
    }
  }

  if (vertices.length / STRIDE > 65_535) {
    throw new Error('The eustoma mesh no longer fits 16-bit indices.');
  }

  return {
    indices: new Uint16Array(indices),
    vertices: new Float32Array(vertices),
  };
}
