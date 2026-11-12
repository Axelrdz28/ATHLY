import type { AnimId } from '../data/types';

/* Figuras esquemáticas propias (SVG generado con código). Ángulos en grados:
   0 = arriba, 90 = adelante (derecha), 180 = abajo. */

type Pt = [number, number];
type Pose = Record<string, number>;
const D = Math.PI / 180;
const v = (a: number): Pt => [Math.sin(a * D), -Math.cos(a * D)];
const mv = (p: Pt, a: number, l: number): Pt => {
  const d = v(a);
  return [p[0] + d[0] * l, p[1] + d[1] * l];
};
const f = (n: number) => n.toFixed(1);
const L = { torso: 46, thigh: 40, shin: 40, ua: 26, fa: 24, foot: 14, neck: 15 };
const seg = (a: Pt, b: Pt, c = '') => `<line class="seg ${c}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
const ln = (a: Pt, b: Pt, c: string) => `<line class="${c}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
const circ = (p: Pt, r: number, c: string) => `<circle class="${c}" cx="${f(p[0])}" cy="${f(p[1])}" r="${r}"/>`;
const quad = (c: Pt, a: number, l: number, w: number, cls: string) => {
  const d = v(a), n = v(a + 90);
  const pts = [[-l / 2, -w / 2], [l / 2, -w / 2], [l / 2, w / 2], [-l / 2, w / 2]]
    .map(([x, y]) => `${f(c[0] + d[0] * x + n[0] * y)},${f(c[1] + d[1] * x + n[1] * y)}`).join(' ');
  return `<polygon class="${cls}" points="${pts}"/>`;
};

function ik(a: Pt, b: Pt, l1: number, l2: number, side: number): Pt {
  const dx = b[0] - a[0], dy = b[1] - a[1], dd = Math.hypot(dx, dy) || 1;
  const d = Math.min(dd, l1 + l2 - 0.01);
  const x = (d * d + l1 * l1 - l2 * l2) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const ux = dx / dd, uy = dy / dd;
  return [a[0] + ux * x - side * uy * h, a[1] + uy * x + side * ux * h];
}

interface Body { ankle: Pt; knee: Pt; hip: Pt; shoulder: Pt; elbow: Pt; hand: Pt; head: Pt; toe: Pt }

function fkAnkle(p: Pose): Body {
  const ankle: Pt = [p.x, p.y];
  const knee = mv(ankle, p.sh + 180, L.shin), hip = mv(knee, p.th + 180, L.thigh), shoulder = mv(hip, p.t, L.torso);
  const elbow = mv(shoulder, p.ua, L.ua);
  return { ankle, knee, hip, shoulder, elbow, hand: mv(elbow, p.fa, L.fa), head: mv(shoulder, p.t + (p.hd || 0), L.neck), toe: mv(ankle, p.f, L.foot) };
}

type Muscle = { on: 'thigh' | 'shin' | 'ua' | 'fa' | 'torso' | 'glute'; s?: number; k?: 's' };
const SEGS: Record<string, [keyof Body, keyof Body]> = {
  thigh: ['hip', 'knee'], shin: ['knee', 'ankle'], ua: ['shoulder', 'elbow'], fa: ['elbow', 'hand'], torso: ['hip', 'shoulder'],
};

function mus(a: Pt, b: Pt, sd: number, cls: string, t0 = 0.16, t1 = 0.84) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * sd * 2.3, ny = (dx / l) * sd * 2.3;
  return `<line class="mus ${cls}" x1="${f(a[0] + dx * t0 + nx)}" y1="${f(a[1] + dy * t0 + ny)}" x2="${f(a[0] + dx * t1 + nx)}" y2="${f(a[1] + dy * t1 + ny)}"/>`;
}

function side(P: Body, M: Muscle[], o: { off?: Pt; after?: (P: Body) => string } = {}) {
  const off = o.off || [-5, -3];
  const F = Object.fromEntries(Object.entries(P).map(([k, p]) => [k, [p[0] + off[0], p[1] + off[1]]])) as unknown as Body;
  const drawM = (Q: Body, names: string[], far = false) =>
    M.filter((m) => names.includes(m.on)).map((m) => {
      const c = (m.k === 's' ? 'sec' : '') + (far ? ' far' : '');
      if (m.on === 'glute') {
        const dx = Q.shoulder[0] - Q.hip[0], dy = Q.shoulder[1] - Q.hip[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
        return circ([Q.hip[0] + uy * 5 - ux * 1.5, Q.hip[1] - ux * 5 - uy * 1.5], 6.5, 'musb ' + c);
      }
      const [a, b] = SEGS[m.on];
      return mus(Q[a], Q[b], m.s || 0, c);
    }).join('');
  let out = seg(F.hip, F.knee, 'far') + seg(F.knee, F.ankle, 'far') + seg(F.ankle, F.toe, 'far foot') + drawM(F, ['thigh', 'shin'], true);
  out += seg(F.shoulder, F.elbow, 'far') + seg(F.elbow, F.hand, 'far');
  out += seg(P.shoulder, P.head, 'neck') + seg(P.hip, P.shoulder, 'torso') + drawM(P, ['torso']);
  out += seg(P.hip, P.knee) + seg(P.knee, P.ankle) + seg(P.ankle, P.toe, 'foot') + drawM(P, ['thigh', 'shin', 'glute']);
  out += circ(P.head, 10, 'head');
  out += seg(P.shoulder, P.elbow) + seg(P.elbow, P.hand) + drawM(P, ['ua', 'fa']);
  return out + (o.after ? o.after(P) : '');
}

function angleMark(K: Pt, A1: Pt, A2: Pt, dist = 27) {
  const u1 = [A1[0] - K[0], A1[1] - K[1]], u2 = [A2[0] - K[0], A2[1] - K[1]];
  const l1 = Math.hypot(u1[0], u1[1]), l2 = Math.hypot(u2[0], u2[1]);
  const a = [u1[0] / l1, u1[1] / l1], b = [u2[0] / l2, u2[1] / l2], r = 13;
  const deg = Math.round((Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]))) * 180) / Math.PI);
  const sweep = a[0] * b[1] - a[1] * b[0] > 0 ? 1 : 0, bx = a[0] + b[0], by = a[1] + b[1], bl = Math.hypot(bx, by) || 1;
  return `<path class="angle" d="M${f(K[0] + a[0] * r)} ${f(K[1] + a[1] * r)} A${r} ${r} 0 0 ${sweep} ${f(K[0] + b[0] * r)} ${f(K[1] + b[1] * r)}"/>` +
    `<text class="angt" text-anchor="middle" x="${f(K[0] + (bx / bl) * dist)}" y="${f(K[1] + (by / bl) * dist + 4)}">${deg}°</text>`;
}

const GROUND = ln([6, 205], [214, 205], 'ground');

export interface Frame { bg: string; fig: string; fg?: string }
export interface AnimDef {
  view: string;
  fade?: boolean;
  ghost: Pose; // posición objetivo
  ghostLabel: string;
  tl: { p: Pose; d: number; l: string }[];
  render: (p: Pose) => Frame;
}

/* ── Sentadilla ── */
const squatStand = { x: 100, y: 205, t: 4, th: 182, sh: 178, f: 90, ua: 219, fa: 24, hd: 0 };
const squatBottom = { x: 100, y: 205, t: 42, th: 92, sh: 210, f: 90, ua: 257, fa: 62, hd: -15 };
const squatFig = (p: Pose) => {
  const B = fkAnkle(p);
  const fig = side(B, [{ on: 'thigh', s: -1 }, { on: 'glute' }, { on: 'torso', s: -1, k: 's' }], {
    after: (P) => { const b = mv(P.shoulder, p.t - 90, 5); return circ(b, 13, 'plate') + circ(b, 3.5, 'head') + circ(P.head, 10, 'head'); },
  });
  return { B, fig };
};

/* ── Dominadas (vista frontal) ── */
const pullHang = { sy: 84, ex: 81, ey: 62, hy: 67, hip: 140, knee: 179, ank: 216 };
const pullTop = { sy: 46, ex: 75, ey: 62, hy: 28, hip: 102, knee: 141, ank: 178 };
function pullFig(p: Pose) {
  const lS: Pt = [94, p.sy], rS: Pt = [126, p.sy], lE: Pt = [p.ex, p.ey], rE: Pt = [220 - p.ex, p.ey], lH: Pt = [68, 40], rH: Pt = [152, 40];
  let s = seg([110, p.sy], [110, p.hy], 'neck');
  s += `<polygon class="tfill" points="${f(lS[0])},${f(lS[1])} ${f(rS[0])},${f(rS[1])} 119,${f(p.hip)} 101,${f(p.hip)}"/>`;
  const lat = (mirror: boolean) => `<polygon class="lat" points="${[[94.6, p.sy + 4], [103, p.sy + 13], [104, p.hip - 14], [100.6, p.hip - 5]].map((q) => f(mirror ? 220 - q[0] : q[0]) + ',' + f(q[1])).join(' ')}"/>`;
  s += lat(false) + lat(true);
  s += seg([104, p.hip], [105, p.knee]) + seg([105, p.knee], [106, p.ank]) + seg([116, p.hip], [115, p.knee]) + seg([115, p.knee], [114, p.ank]);
  s += circ([110, p.hy], 11, 'head');
  s += seg(lS, lE) + seg(lE, lH) + seg(rS, rE) + seg(rE, rH) + mus(lS, lE, 0, 'sec') + mus(rS, rE, 0, 'sec');
  return s;
}

/* ── Salto al cajón ── */
const bj = {
  stand: { x: 70, y: 205, t: 4, th: 180, sh: 180, f: 90, ua: 182, fa: 182, hd: 0 },
  load: { x: 70, y: 205, t: 40, th: 120, sh: 205, f: 90, ua: 250, fa: 250, hd: -20 },
  take: { x: 78, y: 193, t: 10, th: 185, sh: 185, f: 150, ua: 20, fa: 15, hd: 0 },
  tuck: { x: 130, y: 150, t: 25, th: 95, sh: 200, f: 110, ua: 60, fa: 60, hd: -10 },
  land: { x: 150, y: 165, t: 40, th: 110, sh: 210, f: 90, ua: 120, fa: 100, hd: -15 },
  top: { x: 150, y: 165, t: 4, th: 180, sh: 180, f: 90, ua: 182, fa: 182, hd: 0 },
};
const bjFig = (p: Pose) => side(fkAnkle(p), [{ on: 'thigh', s: -1 }, { on: 'glute' }, { on: 'shin', s: 1 }]);

/* ── Prensa 45° ── */
function pressParts(p: Pose) {
  const H: Pt = [62, 182], A = mv(H, 45, p.s), K = ik(H, A, 40, 40, -1), S = mv(H, -55, 46);
  const hand: Pt = [H[0] - 2, H[1] + 4], E = ik(S, hand, 26, 24, 1);
  const P: Body = { hip: H, ankle: A, knee: K, shoulder: S, head: mv(S, -25, 15), hand, elbow: E, toe: mv(A, -45, 14) };
  return { H, A, K, P, hand };
}
function pressMachine(p: Pose) {
  const { H, A, hand } = pressParts(p);
  const FL = 211;
  const g0 = mv(mv(H, 45, 34), 135, 24), g1 = mv(mv(H, 45, 128), 135, 24);
  let m = ln([8, FL], [212, FL], 'ground');
  m += ln(g0, g1, 'mach') + ln(mv(g0, 135, 7), mv(g1, 135, 7), 'mach thin');
  m += ln(g1, [g1[0], FL], 'mach') + ln(mv(g0, 45, 10), [mv(g0, 45, 10)[0], FL], 'mach thin');
  const post = mv(H, 165, 22);
  m += ln(post, [post[0], FL], 'mach') + ln([post[0] - 22, FL], [post[0] + 30, FL], 'mach');
  m += quad(mv(H, 160, 14), 70, 34, 10, 'cushion');
  m += quad(mv(mv(H, -55, 28), -145, 13), -55, 68, 12, 'cushion');
  const car = mv(A, 135, 15);
  m += quad(car, 45, 36, 14, 'carriage') + ln(mv(car, 135, 6), mv(mv(car, 135, 6), 45, -22), 'mach');
  const pc = mv(mv(car, 135, 12), 45, -14);
  m += circ(pc, 14, 'plate') + circ(pc, 3, 'head');
  m += quad(mv(A, -45, 7), -45, 42, 6, 'platform');
  m += ln(hand, mv(hand, 90, 10), 'mach thin');
  return m;
}
const pressFig = (p: Pose) => {
  const { P, hand } = pressParts(p);
  return side(P, [{ on: 'thigh', s: -1 }, { on: 'glute', k: 's' }], { off: [-5, -4] }) + circ(hand, 4, 'head');
};

export const ANIMS: Record<AnimId, AnimDef> = {
  squat: {
    view: 'Vista lateral', ghost: squatBottom, ghostLabel: 'Profundidad objetivo',
    tl: [
      { p: squatStand, d: 600, l: 'Posición inicial: abdomen firme, toma aire' },
      { p: squatBottom, d: 1800, l: 'Baja controlado (2 s)' },
      { p: squatBottom, d: 350, l: 'Muslo al menos paralelo al suelo' },
      { p: squatStand, d: 1100, l: 'Empuja el suelo y sube' },
    ],
    render: (p) => { const { B, fig } = squatFig(p); return { bg: GROUND, fig, fg: angleMark(B.knee, B.hip, B.ankle, 28) }; },
  },
  pullup: {
    view: 'Vista frontal', ghost: pullTop, ghostLabel: 'Posición final',
    tl: [
      { p: pullHang, d: 500, l: 'Cuelga activo: hombros lejos de las orejas' },
      { p: pullTop, d: 1100, l: 'Tira de los codos hacia las costillas' },
      { p: pullTop, d: 400, l: 'Barbilla por encima de la barra' },
      { p: pullHang, d: 1800, l: 'Baja controlado (2 s) hasta estirar los brazos' },
    ],
    render: (p) => ({ bg: ln([22, 40], [198, 40], 'mach') + ln([26, 40], [26, 225], 'mach thin') + ln([194, 40], [194, 225], 'mach thin'), fig: pullFig(p) }),
  },
  boxjump: {
    view: 'Vista lateral', fade: true, ghost: bj.land, ghostLabel: 'Aterrizaje objetivo',
    tl: [
      { p: bj.stand, d: 600, l: 'Pies a la anchura de la cadera' },
      { p: bj.load, d: 550, l: 'Contramovimiento: cadera y brazos atrás' },
      { p: bj.take, d: 200, l: 'Despega: extiende cadera, rodilla y tobillo' },
      { p: bj.tuck, d: 320, l: 'Recoge las rodillas' },
      { p: bj.land, d: 280, l: 'Aterriza suave en media sentadilla' },
      { p: bj.top, d: 600, l: 'Ponte de pie sobre el cajón' },
      { p: bj.top, d: 900, l: 'Baja caminando, no saltando' },
    ],
    render: (p) => ({ bg: GROUND + `<rect class="box" x="130" y="165" width="56" height="40" rx="3"/>`, fig: bjFig(p) }),
  },
  legpress: {
    view: 'Vista lateral', ghost: { s: 56 }, ghostLabel: 'Rodilla a ~90°',
    tl: [
      { p: { s: 76 }, d: 400, l: 'Arriba: rodillas sin bloquear' },
      { p: { s: 56 }, d: 1800, l: 'Baja controlado (2 s) hasta ~90° de rodilla' },
      { p: { s: 56 }, d: 250, l: 'Lumbar y glúteo pegados al respaldo' },
      { p: { s: 76 }, d: 1000, l: 'Empuja con todo el pie' },
    ],
    render: (p) => { const { H, A, K } = pressParts(p); return { bg: pressMachine(p), fig: pressFig(p), fg: angleMark(K, H, A) }; },
  },
};

export const ease = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;
export const lerp = (a: Pose, b: Pose, k: number): Pose => {
  const o: Pose = {};
  for (const key in b) o[key] = a[key] + (b[key] - a[key]) * k;
  return o;
};
