/* Figuras esquemáticas propias (SVG generado con código).
   Ángulos en grados: 0 = arriba, 90 = adelante (derecha), 180 = abajo, -90 = atrás.
   Vista lateral: la figura mira a la derecha. Suelo en y = 205. */

type Pt = [number, number];
export type Pose = Record<string, number>;
const D = Math.PI / 180;
const v = (a: number): Pt => [Math.sin(a * D), -Math.cos(a * D)];
const mv = (p: Pt, a: number, l: number): Pt => {
  const d = v(a);
  return [p[0] + d[0] * l, p[1] + d[1] * l];
};
const add = (p: Pt, d: Pt): Pt => [p[0] + d[0], p[1] + d[1]];
const f = (n: number) => n.toFixed(1);
const L = { torso: 46, thigh: 40, shin: 40, ua: 26, fa: 24, foot: 14, neck: 15 };
const seg = (a: Pt, b: Pt, c = '') => `<line class="seg ${c}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
const ln = (a: Pt, b: Pt, c: string) => `<line class="${c}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
const circ = (p: Pt, r: number, c: string) => `<circle class="${c}" cx="${f(p[0])}" cy="${f(p[1])}" r="${r}"/>`;
const rect = (x: number, y: number, w: number, h: number, c: string, rx = 3) => `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const poly = (pts: Pt[], c: string) => `<polygon class="${c}" points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`;
const quad = (c: Pt, a: number, l: number, w: number, cls: string) => {
  const d = v(a), n = v(a + 90);
  return poly([[-l / 2, -w / 2], [l / 2, -w / 2], [l / 2, w / 2], [-l / 2, w / 2]].map(([x, y]) => [c[0] + d[0] * x + n[0] * y, c[1] + d[1] * x + n[1] * y] as Pt), cls);
};

function ik(a: Pt, b: Pt, l1: number, l2: number, side: number): Pt {
  const dx = b[0] - a[0], dy = b[1] - a[1], dd = Math.hypot(dx, dy) || 1;
  const d = Math.min(dd, l1 + l2 - 0.01);
  const x = (d * d + l1 * l1 - l2 * l2) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const ux = dx / dd, uy = dy / dd;
  return [a[0] + ux * x - side * uy * h, a[1] + uy * x + side * ux * h];
}

/* ───────── Equipo ───────── */
const GROUND = ln([6, 205], [214, 205], 'ground');
const plate = (p: Pt, r = 13) => circ(p, r, 'plate') + circ(p, 3.5, 'head');
const db = (p: Pt) => circ(p, 6.5, 'plate') + circ(p, 2.5, 'head');
const dbV = (p: Pt) => ln([p[0], p[1] - 9], [p[0], p[1] + 9], 'mach') + circ([p[0], p[1] - 9], 4.5, 'plate') + circ([p[0], p[1] + 9], 4.5, 'plate');
const cable = (from: Pt, to: Pt) => ln(from, to, 'cable') + circ(from, 5, 'pulley');

function angleMark(K: Pt, A1: Pt, A2: Pt, dist = 27) {
  const u1 = [A1[0] - K[0], A1[1] - K[1]], u2 = [A2[0] - K[0], A2[1] - K[1]];
  const l1 = Math.hypot(u1[0], u1[1]), l2 = Math.hypot(u2[0], u2[1]);
  const a = [u1[0] / l1, u1[1] / l1], b = [u2[0] / l2, u2[1] / l2], r = 13;
  const deg = Math.round((Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]))) * 180) / Math.PI);
  const sweep = a[0] * b[1] - a[1] * b[0] > 0 ? 1 : 0, bx = a[0] + b[0], by = a[1] + b[1], bl = Math.hypot(bx, by) || 1;
  return `<path class="angle" d="M${f(K[0] + a[0] * r)} ${f(K[1] + a[1] * r)} A${r} ${r} 0 0 ${sweep} ${f(K[0] + b[0] * r)} ${f(K[1] + b[1] * r)}"/>` +
    `<text class="angt" text-anchor="middle" x="${f(K[0] + (bx / bl) * dist)}" y="${f(K[1] + (by / bl) * dist + 4)}">${deg}°</text>`;
}

/* ───────── Cuerpo en vista lateral ───────── */
type Anchor = 'ankle' | 'toe' | 'hip' | 'hand' | 'knee' | 'elbow' | 'shoulder';
interface Body {
  hip: Pt; knee: Pt; ankle: Pt; toe: Pt; shoulder: Pt; elbow: Pt; hand: Pt; head: Pt;
  knee2: Pt; ankle2: Pt; toe2: Pt; elbow2: Pt; hand2: Pt;
}

/** Cinemática directa desde la cadera; luego se traslada para que el ancla quede en (x, y). Sufijo 2 = extremidades del lado lejano. */
function fk(p: Pose, anchor: Anchor = 'ankle'): Body {
  const hip: Pt = [0, 0];
  const knee = mv(hip, p.th, L.thigh), ankle = mv(knee, p.sh, L.shin), toe = mv(ankle, p.f, L.foot);
  const shoulder = mv(hip, p.t, L.torso), elbow = mv(shoulder, p.ua, L.ua), hand = mv(elbow, p.fa, L.fa);
  const head = mv(shoulder, p.t + (p.hd || 0), L.neck);
  const knee2 = mv(hip, p.th2 ?? p.th, L.thigh), ankle2 = mv(knee2, p.sh2 ?? p.sh, L.shin), toe2 = mv(ankle2, p.f2 ?? p.f, L.foot);
  const elbow2 = mv(shoulder, p.ua2 ?? p.ua, L.ua), hand2 = mv(elbow2, p.fa2 ?? p.fa, L.fa);
  const B: Body = { hip, knee, ankle, toe, shoulder, elbow, hand, head, knee2, ankle2, toe2, elbow2, hand2 };
  const a = B[anchor];
  const d: Pt = [p.x - a[0], p.y - a[1]];
  for (const k of Object.keys(B) as (keyof Body)[]) B[k] = add(B[k], d);
  return B;
}

function mus(a: Pt, b: Pt, sd: number, cls: string, t0 = 0.16, t1 = 0.84) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * sd * 2.3, ny = (dx / l) * sd * 2.3;
  return `<line class="mus ${cls}" x1="${f(a[0] + dx * t0 + nx)}" y1="${f(a[1] + dy * t0 + ny)}" x2="${f(a[0] + dx * t1 + nx)}" y2="${f(a[1] + dy * t1 + ny)}"/>`;
}

/* Músculos por nombre. Prefijo "~" = secundario. */
type MusDef = { seg: [keyof Body, keyof Body]; far?: [keyof Body, keyof Body]; sd: number; t0?: number; t1?: number };
const SIDE_MUS: Record<string, MusDef> = {
  quad: { seg: ['hip', 'knee'], far: ['hip', 'knee2'], sd: -1 },
  ham: { seg: ['hip', 'knee'], far: ['hip', 'knee2'], sd: 1 },
  calf: { seg: ['knee', 'ankle'], far: ['knee2', 'ankle2'], sd: 1, t0: 0.1, t1: 0.6 },
  tib: { seg: ['knee', 'ankle'], far: ['knee2', 'ankle2'], sd: -1, t0: 0.1, t1: 0.75 },
  biceps: { seg: ['shoulder', 'elbow'], far: ['shoulder', 'elbow2'], sd: -1, t0: 0.25, t1: 0.85 },
  triceps: { seg: ['shoulder', 'elbow'], far: ['shoulder', 'elbow2'], sd: 1, t0: 0.15, t1: 0.85 },
  forearm: { seg: ['elbow', 'hand'], far: ['elbow2', 'hand2'], sd: -1, t0: 0.1, t1: 0.6 },
  chest: { seg: ['hip', 'shoulder'], sd: 1, t0: 0.6, t1: 0.92 },
  abs: { seg: ['hip', 'shoulder'], sd: 1, t0: 0.12, t1: 0.55 },
  back: { seg: ['hip', 'shoulder'], sd: -1, t0: 0.5, t1: 0.92 },
  lumbar: { seg: ['hip', 'shoulder'], sd: -1, t0: 0.08, t1: 0.42 },
};

function side(P: Body, M: string[], o: { off?: Pt; after?: string; between?: string } = {}) {
  const off = o.off || [-5, -3];
  const F = Object.fromEntries(Object.entries(P).map(([k, p]) => [k, add(p, off)])) as unknown as Body;
  const list = M.map((m) => ({ k: m.replace('~', ''), sec: m.startsWith('~') }));
  const draw = (names: string[], far: boolean) =>
    list.filter((m) => names.includes(m.k)).map((m) => {
      const c = (m.sec ? 'sec' : '') + (far ? ' far' : '');
      const Q = far ? F : P;
      if (m.k === 'glute') {
        const dx = Q.shoulder[0] - Q.hip[0], dy = Q.shoulder[1] - Q.hip[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
        return circ([Q.hip[0] + uy * 5 - ux * 1.5, Q.hip[1] - ux * 5 - uy * 1.5], 6.5, 'musb ' + c);
      }
      if (m.k === 'delt') return circ(Q.shoulder, 6, 'musb ' + c);
      const d = SIDE_MUS[m.k];
      const [a, b] = far && d.far ? d.far : d.seg;
      return mus(Q[a], Q[b], d.sd, c, d.t0, d.t1);
    }).join('');
  const LEGS = ['quad', 'ham', 'calf', 'tib'], ARMS = ['biceps', 'triceps', 'forearm'];
  let out = seg(F.hip, F.knee2, 'far') + seg(F.knee2, F.ankle2, 'far') + seg(F.ankle2, F.toe2, 'far foot') + draw(LEGS, true);
  out += seg(F.shoulder, F.elbow2, 'far') + seg(F.elbow2, F.hand2, 'far') + draw(ARMS, true);
  out += o.between ?? '';
  out += seg(P.shoulder, P.head, 'neck') + seg(P.hip, P.shoulder, 'torso') + draw(['chest', 'abs', 'back', 'lumbar'], false);
  out += seg(P.hip, P.knee) + seg(P.knee, P.ankle) + seg(P.ankle, P.toe, 'foot') + draw([...LEGS, 'glute'], false);
  out += circ(P.head, 10, 'head');
  out += seg(P.shoulder, P.elbow) + seg(P.elbow, P.hand) + draw([...ARMS, 'delt'], false);
  return out + (o.after ?? '');
}

/* ───────── Cuerpo en vista frontal ───────── */
interface FBody { cx: number; sy: number; hy: number; lS: Pt; rS: Pt; lE: Pt; rE: Pt; lHd: Pt; rHd: Pt; lH: Pt; rH: Pt; lK: Pt; rK: Pt; lA: Pt; rA: Pt; head: Pt; tk: number }
function frontBody(p: Pose): FBody {
  const cx = p.cx, hy = p.hy, tk = p.tk ?? 1, ak = p.ak ?? 1, sy = hy - 46 * tk;
  const s = (a: number) => Math.sin(a * D), c = (a: number) => Math.cos(a * D);
  const lS: Pt = [cx - 16, sy], rS: Pt = [cx + 16, sy], lH: Pt = [cx - 10, hy], rH: Pt = [cx + 10, hy];
  const lE: Pt = [lS[0] - 26 * ak * s(p.aL), sy + 26 * ak * c(p.aL)], rE: Pt = [rS[0] + 26 * ak * s(p.aR), sy + 26 * ak * c(p.aR)];
  const lHd: Pt = [lE[0] - 24 * ak * s(p.bL), lE[1] + 24 * ak * c(p.bL)], rHd: Pt = [rE[0] + 24 * ak * s(p.bR), rE[1] + 24 * ak * c(p.bR)];
  const lA: Pt = [p.fxL, p.fyL], rA: Pt = [p.fxR, p.fyR];
  return { cx, sy, hy, tk, lS, rS, lE, rE, lHd, rHd, lH, rH, lA, rA, lK: ik(lH, lA, 40, 40, 1), rK: ik(rH, rA, 40, 40, -1), head: [cx, sy + (p.ho ?? -17)] };
}
function front(B: FBody, M: string[], o: { after?: string; between?: string } = {}) {
  const { cx, sy, hy, tk } = B;
  const has = (k: string) => M.includes(k) || M.includes('~' + k);
  const cl = (k: string) => (M.includes(k) ? '' : 'sec');
  const mir = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [2 * cx - x, y]);
  let s = seg(B.lH, B.lK) + seg(B.lK, B.lA) + seg(B.rH, B.rK) + seg(B.rK, B.rA);
  s += seg(B.lA, [B.lA[0] - 7, B.lA[1] + 1], 'foot') + seg(B.rA, [B.rA[0] + 7, B.rA[1] + 1], 'foot');
  if (has('quads')) s += mus(B.lH, B.lK, 0, cl('quads')) + mus(B.rH, B.rK, 0, cl('quads'));
  if (has('adductors')) s += mus(B.lH, B.lK, -1, cl('adductors'), 0.1, 0.7) + mus(B.rH, B.rK, 1, cl('adductors'), 0.1, 0.7);
  s += o.between ?? '';
  s += seg([cx, sy], B.head, 'neck');
  s += poly([B.lS, B.rS, B.rH, B.lH], 'tfill');
  if (has('traps')) s += poly([[cx - 13, sy + 1], [cx, sy - 8], [cx + 13, sy + 1]], 'lat ' + cl('traps'));
  if (has('pecs')) { const pec: Pt[] = [[cx - 14, sy + 3], [cx - 1.5, sy + 3], [cx - 1.5, sy + 3 + 13 * tk], [cx - 13, sy + 3 + 10 * tk]]; s += poly(pec, 'lat ' + cl('pecs')) + poly(mir(pec), 'lat ' + cl('pecs')); }
  if (has('lats')) { const lat: Pt[] = [[cx - 15.4, sy + 4], [cx - 7, sy + 13 * tk], [cx - 6, hy - 14 * tk], [cx - 9.4, hy - 5 * tk]]; s += poly(lat, 'lat ' + cl('lats')) + poly(mir(lat), 'lat ' + cl('lats')); }
  if (has('abs')) s += rect(cx - 5.5, sy + 20 * tk, 11, Math.max(4, hy - 4 - (sy + 20 * tk)), 'lat ' + cl('abs'), 2);
  if (has('obliques')) { const ob: Pt[] = [[cx - 13, sy + 24 * tk], [cx - 8, sy + 26 * tk], [cx - 8, hy - 2], [cx - 10.5, hy - 2]]; s += poly(ob, 'lat ' + cl('obliques')) + poly(mir(ob), 'lat ' + cl('obliques')); }
  if (has('gmed')) s += circ([cx - 13, hy + 2], 5.5, 'musb ' + cl('gmed')) + circ([cx + 13, hy + 2], 5.5, 'musb ' + cl('gmed'));
  s += circ(B.head, 11, 'head');
  s += seg(B.lS, B.lE) + seg(B.lE, B.lHd) + seg(B.rS, B.rE) + seg(B.rE, B.rHd);
  if (has('biceps')) s += mus(B.lS, B.lE, 0, cl('biceps')) + mus(B.rS, B.rE, 0, cl('biceps'));
  if (has('delts')) s += circ(B.lS, 6.5, 'musb ' + cl('delts')) + circ(B.rS, 6.5, 'musb ' + cl('delts'));
  return s + (o.after ?? '');
}

/* ───────── Definiciones ───────── */
export interface Frame { bg: string; fig: string; fg?: string }
export interface AnimDef {
  view: string;
  fade?: boolean;
  ghost: Pose;
  ghostLabel: string;
  tl: { p: Pose; d: number; l: string }[];
  render: (p: Pose) => Frame;
}

const S: Pose = { x: 100, y: 205, t: 0, th: 180, sh: 180, f: 90, ua: 180, fa: 180, hd: 0 };
const P = (base: Pose, over: Pose): Pose => ({ ...base, ...over });
type Step = [Pose, number, string];
const tl = (steps: Step[]) => steps.map(([p, d, l]) => ({ p, d, l }));

/** Atajo para animaciones de vista lateral */
function sideAnim(o: {
  view?: string; anchor?: Anchor; mus: string[]; steps: Step[]; ghost: Pose; ghostLabel: string; fade?: boolean;
  bg?: (B: Body, p: Pose) => string; after?: (B: Body, p: Pose) => string; between?: (B: Body, p: Pose) => string; fg?: (B: Body, p: Pose) => string; ground?: boolean;
}): AnimDef {
  return {
    view: o.view ?? 'Vista lateral', fade: o.fade, ghost: o.ghost, ghostLabel: o.ghostLabel, tl: tl(o.steps),
    render: (p) => {
      const B = fk(p, o.anchor);
      return {
        bg: (o.ground === false ? '' : GROUND) + (o.bg?.(B, p) ?? ''),
        fig: side(B, o.mus, { after: o.after?.(B, p), between: o.between?.(B, p) }),
        fg: o.fg?.(B, p),
      };
    },
  };
}
function frontAnim(o: { mus: string[]; steps: Step[]; ghost: Pose; ghostLabel: string; fade?: boolean; bg?: (B: FBody) => string; after?: (B: FBody) => string; between?: (B: FBody) => string; view?: string }): AnimDef {
  return {
    view: o.view ?? 'Vista frontal', fade: o.fade, ghost: o.ghost, ghostLabel: o.ghostLabel, tl: tl(o.steps),
    render: (p) => { const B = frontBody(p); return { bg: GROUND + (o.bg?.(B) ?? ''), fig: front(B, o.mus, { after: o.after?.(B), between: o.between?.(B) }) }; },
  };
}
const FS: Pose = { cx: 110, hy: 125, fxL: 98, fyL: 205, fxR: 122, fyR: 205, aL: 10, bL: 8, aR: 10, bR: 8 };

/* ── Sentadilla ── */
const squatStand = { x: 100, y: 205, t: 4, th: 182, sh: 178, f: 90, ua: 219, fa: 24, hd: 0 };
const squatBottom = { x: 100, y: 205, t: 42, th: 92, sh: 210, f: 90, ua: 257, fa: 62, hd: -15 };
const squat = sideAnim({
  mus: ['quad', 'glute', '~lumbar'], ghost: squatBottom, ghostLabel: 'Profundidad objetivo',
  steps: [[squatStand, 600, 'Posición inicial: abdomen firme, toma aire'], [squatBottom, 1800, 'Baja controlado (2 s)'], [squatBottom, 350, 'Muslo al menos paralelo al suelo'], [squatStand, 1100, 'Empuja el suelo y sube']],
  after: (B, p) => { const b = mv(B.shoulder, p.t - 90, 5); return plate(b) + circ(B.head, 10, 'head'); },
  fg: (B) => angleMark(B.knee, B.hip, B.ankle, 28),
});

/* ── Dominadas (frontal) ── */
const pullHang = { sy: 84, ex: 81, ey: 62, hy: 67, hip: 140, knee: 179, ank: 216 };
const pullTop = { sy: 46, ex: 75, ey: 62, hy: 28, hip: 102, knee: 141, ank: 178 };
function pullFig(p: Pose) {
  const lS: Pt = [94, p.sy], rS: Pt = [126, p.sy], lE: Pt = [p.ex, p.ey], rE: Pt = [220 - p.ex, p.ey], lH: Pt = [68, 40], rH: Pt = [152, 40];
  let s = seg([110, p.sy], [110, p.hy], 'neck');
  s += poly([lS, rS, [119, p.hip], [101, p.hip]], 'tfill');
  const lat = (m: boolean) => poly(([[94.6, p.sy + 4], [103, p.sy + 13], [104, p.hip - 14], [100.6, p.hip - 5]] as Pt[]).map(([x, y]) => [m ? 220 - x : x, y] as Pt), 'lat');
  s += lat(false) + lat(true);
  s += seg([104, p.hip], [105, p.knee]) + seg([105, p.knee], [106, p.ank]) + seg([116, p.hip], [115, p.knee]) + seg([115, p.knee], [114, p.ank]);
  s += circ([110, p.hy], 11, 'head');
  s += seg(lS, lE) + seg(lE, lH) + seg(rS, rE) + seg(rE, rH) + mus(lS, lE, 0, 'sec') + mus(rS, rE, 0, 'sec');
  return s;
}
const pullup: AnimDef = {
  view: 'Vista frontal', ghost: pullTop, ghostLabel: 'Posición final',
  tl: tl([[pullHang, 500, 'Cuelga activo: hombros lejos de las orejas'], [pullTop, 1100, 'Tira de los codos hacia las costillas'], [pullTop, 400, 'Barbilla por encima de la barra'], [pullHang, 1800, 'Baja controlado (2 s) hasta estirar los brazos']]),
  render: (p) => ({ bg: ln([22, 40], [198, 40], 'mach') + ln([26, 40], [26, 225], 'mach thin') + ln([194, 40], [194, 225], 'mach thin'), fig: pullFig(p) }),
};

/* ── Salto al cajón ── */
const bj = {
  stand: { x: 70, y: 205, t: 4, th: 180, sh: 180, f: 90, ua: 182, fa: 182, hd: 0 },
  load: { x: 70, y: 205, t: 40, th: 120, sh: 205, f: 90, ua: 250, fa: 250, hd: -20 },
  take: { x: 78, y: 193, t: 10, th: 185, sh: 185, f: 150, ua: 20, fa: 15, hd: 0 },
  tuck: { x: 130, y: 150, t: 25, th: 95, sh: 200, f: 110, ua: 60, fa: 60, hd: -10 },
  land: { x: 150, y: 165, t: 40, th: 110, sh: 210, f: 90, ua: 120, fa: 100, hd: -15 },
  top: { x: 150, y: 165, t: 4, th: 180, sh: 180, f: 90, ua: 182, fa: 182, hd: 0 },
};
const boxjump = sideAnim({
  mus: ['quad', 'glute', 'calf'], fade: true, ghost: bj.land, ghostLabel: 'Aterrizaje objetivo',
  steps: [[bj.stand, 600, 'Pies a la anchura de la cadera'], [bj.load, 550, 'Contramovimiento: cadera y brazos atrás'], [bj.take, 200, 'Despega: extiende cadera, rodilla y tobillo'], [bj.tuck, 320, 'Recoge las rodillas'], [bj.land, 280, 'Aterriza suave en media sentadilla'], [bj.top, 600, 'Ponte de pie sobre el cajón'], [bj.top, 900, 'Baja caminando, no saltando']],
  bg: () => rect(130, 165, 56, 40, 'box'),
});

/* ── Prensa 45° ── */
function pressParts(p: Pose) {
  const H: Pt = [62, 182], A = mv(H, 45, p.s), K = ik(H, A, 40, 40, -1), Sh = mv(H, -55, 46);
  const hand: Pt = [H[0] - 2, H[1] + 4], E = ik(Sh, hand, 26, 24, 1), toe = mv(A, -45, 14);
  const B: Body = { hip: H, ankle: A, knee: K, shoulder: Sh, head: mv(Sh, -25, 15), hand, elbow: E, toe, knee2: K, ankle2: A, toe2: toe, elbow2: E, hand2: hand };
  return { H, A, K, B, hand };
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
  m += quad(mv(H, 160, 14), 70, 34, 10, 'cushion') + quad(mv(mv(H, -55, 28), -145, 13), -55, 68, 12, 'cushion');
  const car = mv(A, 135, 15);
  m += quad(car, 45, 36, 14, 'carriage') + ln(mv(car, 135, 6), mv(mv(car, 135, 6), 45, -22), 'mach');
  const pc = mv(mv(car, 135, 12), 45, -14);
  m += circ(pc, 14, 'plate') + circ(pc, 3, 'head') + quad(mv(A, -45, 7), -45, 42, 6, 'platform') + ln(hand, mv(hand, 90, 10), 'mach thin');
  return m;
}
const legpress: AnimDef = {
  view: 'Vista lateral', ghost: { s: 56 }, ghostLabel: 'Rodilla a ~90°',
  tl: tl([[{ s: 76 }, 400, 'Arriba: rodillas sin bloquear'], [{ s: 56 }, 1800, 'Baja controlado (2 s) hasta ~90° de rodilla'], [{ s: 56 }, 250, 'Lumbar y glúteo pegados al respaldo'], [{ s: 76 }, 1000, 'Empuja con todo el pie']]),
  render: (p) => { const { H, A, K, B, hand } = pressParts(p); return { bg: pressMachine(p), fig: side(B, ['quad', '~glute'], { off: [-5, -4] }) + circ(hand, 4, 'head'), fg: angleMark(K, H, A) }; },
};

/* ── Press banca / press cerrado ── */
const BENCH = rect(36, 150, 114, 9, 'cushion', 3) + ln([52, 159], [52, 205], 'mach') + ln([136, 159], [136, 205], 'mach');
const benchTop = { x: 120, y: 143, t: -90, th: 120, sh: 180, f: 90, ua: 10, fa: 5, hd: 0 };
const bench = (close: boolean) => sideAnim({
  anchor: 'hip', mus: close ? ['triceps', '~chest'] : ['chest', '~triceps', '~delt'], ghost: P(benchTop, { ua: close ? 150 : 130, fa: close ? -15 : -5 }), ghostLabel: 'Barra en el pecho',
  steps: [[benchTop, 500, close ? 'Manos a la anchura de los hombros' : 'Escápulas juntas, pies firmes'], [P(benchTop, { ua: close ? 150 : 130, fa: close ? -15 : -5 }), 1800, close ? 'Baja con los codos pegados al cuerpo' : 'Baja controlado a la parte baja del pecho'], [P(benchTop, { ua: close ? 150 : 130, fa: close ? -15 : -5 }), 300, 'Toca sin rebotar'], [benchTop, 1000, 'Empuja hacia arriba']],
  bg: () => BENCH, after: (B) => plate(B.hand),
});

/* ── Press inclinado ── */
const inclTop = { x: 115, y: 165, t: -60, th: 85, sh: 180, f: 90, ua: 5, fa: 0, hd: 0 };
const inclBot = P(inclTop, { ua: 160, fa: 25 });
const inclineBench = (H: Pt) => quad(mv(mv(H, -60, 26), -150, 11), -60, 70, 10, 'cushion') + quad(mv(H, 180, 9), 90, 34, 8, 'cushion') + ln(mv(H, 180, 14), [H[0], 205], 'mach') + ln(mv(mv(H, -60, 0), -150, 16), [mv(H, -150, 16)[0] - 4, 205], 'mach thin');
const incline = sideAnim({
  anchor: 'hip', mus: ['chest', '~delt', '~triceps'], ghost: inclBot, ghostLabel: 'Bajada objetivo',
  steps: [[inclTop, 500, 'Banco a 30°, mancuernas arriba'], [inclBot, 1800, 'Baja hasta sentir el estiramiento del pecho'], [inclBot, 250, 'Antebrazos verticales'], [inclTop, 1000, 'Sube en línea recta sobre el pecho']],
  bg: (B) => inclineBench(B.hip), after: (B) => db(B.hand),
  fg: (B) => { const k = mv(B.hip, -150, 16); return angleMark(k, add(k, [-30, 0]), mv(k, -60, 30), 34); },
});

/* ── Fondos ── */
const dipTop = { x: 110, y: 112, t: 15, th: 170, sh: 240, f: 200, ua: 180, fa: 180, hd: 0 };
const dipBot = P(dipTop, { t: 30, ua: 280, fa: 170, hd: -10 });
const dips = sideAnim({
  anchor: 'hand', ground: false, mus: ['chest', 'triceps', '~delt'], ghost: dipBot, ghostLabel: 'Profundidad objetivo',
  steps: [[dipTop, 500, 'Brazos extendidos, torso un poco al frente'], [dipBot, 1600, 'Baja hasta que el hombro llegue al codo'], [dipBot, 250, 'Sin forzar el hombro'], [dipTop, 1000, 'Empuja hasta arriba']],
  bg: () => GROUND + ln([66, 114], [154, 114], 'mach') + ln([76, 114], [76, 205], 'mach thin') + ln([144, 114], [144, 205], 'mach thin'),
});

/* ── Aperturas en polea (frontal) ── */
const flyOpen = P(FS, { aL: 100, bL: 110, aR: 100, bR: 110 });
const flyClose = P(FS, { aL: -35, bL: -10, aR: -35, bR: -10 });
const fly = frontAnim({
  mus: ['pecs', '~delts'], ghost: flyClose, ghostLabel: 'Cierre objetivo',
  steps: [[flyOpen, 500, 'Codos semiflexionados y fijos'], [flyClose, 1100, 'Junta las manos al frente'], [flyClose, 500, 'Aprieta 1 s'], [flyOpen, 1600, 'Vuelve despacio hasta estirar']],
  bg: () => ln([18, 30], [18, 205], 'mach thin') + ln([202, 30], [202, 205], 'mach thin'),
  between: (B) => cable([20, 34], B.lHd) + cable([200, 34], B.rHd),
});

/* ── Extensión de tríceps en polea ── */
const pdTop = P(S, { x: 85, t: 10, ua: 175, fa: 35 });
const pushdown = sideAnim({
  mus: ['triceps'], ghost: P(pdTop, { fa: 178 }), ghostLabel: 'Extensión completa',
  steps: [[pdTop, 400, 'Codos pegados al cuerpo'], [P(pdTop, { fa: 178 }), 900, 'Extiende por completo'], [P(pdTop, { fa: 178 }), 400, 'Aprieta abajo'], [pdTop, 1300, 'Sube controlado sin mover los codos']],
  bg: () => ln([190, 22], [190, 205], 'mach thin'), between: (B) => cable([186, 26], B.hand),
});

/* ── Extensión sobre la cabeza ── */
const oheTop = { x: 120, y: 205, t: 30, th: 165, sh: 185, f: 90, th2: 200, sh2: 190, f2: 110, ua: 40, fa: 40, hd: 0 };
const oheBot = P(oheTop, { fa: -130 });
const overhead = sideAnim({
  mus: ['triceps'], ghost: oheTop, ghostLabel: 'Extensión completa',
  steps: [[oheTop, 400, 'De espaldas a la polea, codos al frente'], [oheBot, 1600, 'Baja detrás de la cabeza'], [oheBot, 300, 'Siente el estiramiento del tríceps'], [oheTop, 1000, 'Extiende sin abrir los codos']],
  bg: () => ln([16, 40], [16, 205], 'mach thin'), between: (B) => cable([20, 44], B.hand),
});

/* ── Rueda abdominal ── */
const abIn = { x: 70, y: 197, t: 75, th: 160, sh: 270, f: 250, ua: 170, fa: 170, hd: 10 };
const abOut = P(abIn, { t: 100, th: 240, ua: 100, fa: 100, hd: -10 });
const abwheel = sideAnim({
  anchor: 'knee', mus: ['abs', '~back'], ghost: abOut, ghostLabel: 'Hasta donde mantengas la espalda',
  steps: [[abIn, 400, 'Abdomen y glúteos apretados'], [abOut, 1600, 'Rueda al frente con la espalda neutra'], [abOut, 300, 'Sin hundir la espalda baja'], [abIn, 1200, 'Regresa tirando con el abdomen']],
  after: (B) => circ([B.hand[0] + 2, 196], 9, 'plate') + circ([B.hand[0] + 2, 196], 3, 'head'),
});

/* ── Pogo jumps ── */
const pogoC = { x: 100, y: 198, t: 2, th: 182, sh: 178, f: 120, ua: 200, fa: 120, hd: 0 };
const pogoA = P(pogoC, { y: 176, th: 180, sh: 180, f: 140, ua: 195, fa: 115 });
const pogo = sideAnim({
  mus: ['calf', '~quad'], ghost: pogoC, ghostLabel: 'Contacto',
  steps: [[pogoC, 110, 'Contacto corto en la parte delantera del pie'], [pogoA, 200, 'Rebota desde el tobillo'], [pogoC, 200, 'Rodillas casi rígidas']],
});

/* ── Salto horizontal a una pierna ── */
const sl = {
  stand: { x: 45, y: 205, t: 5, th: 180, sh: 180, f: 90, th2: 190, sh2: 225, f2: 200, ua: 180, fa: 180, hd: 0 },
  load: { x: 45, y: 205, t: 45, th: 125, sh: 205, f: 90, th2: 205, sh2: 235, f2: 200, ua: 250, fa: 250, hd: -20 },
  air: { x: 95, y: 178, t: 30, th: 150, sh: 170, f: 130, th2: 220, sh2: 240, f2: 200, ua: 40, fa: 30, hd: -10 },
  land: { x: 140, y: 205, t: 40, th: 125, sh: 205, f: 90, th2: 205, sh2: 235, f2: 200, ua: 120, fa: 100, hd: -15 },
};
const slbroad = sideAnim({
  mus: ['quad', 'glute'], fade: true, ghost: sl.land, ghostLabel: 'Aterrizaje estable',
  steps: [[sl.stand, 500, 'Sobre una pierna'], [sl.load, 500, 'Impulso con brazos y cadera'], [sl.air, 260, 'Salta hacia adelante'], [sl.land, 260, 'Aterriza en la misma pierna'], [sl.land, 1200, 'Aguanta 2 s, rodilla alineada']],
});

/* ── Peso muerto rumano ── */
const rdlTop = { x: 100, y: 205, t: 0, th: 182, sh: 178, f: 90, ua: 180, fa: 180, hd: 0 };
const rdlBot = P(rdlTop, { t: 65, th: 134, sh: 176, hd: -20 });
const rdl = sideAnim({
  mus: ['ham', 'glute', '~lumbar'], ghost: rdlBot, ghostLabel: 'Bisagra de cadera',
  steps: [[rdlTop, 500, 'Rodillas un poco flexionadas y fijas'], [rdlBot, 1800, 'Cadera atrás, barra pegada a las piernas'], [rdlBot, 300, 'Estiramiento de isquios, espalda neutra'], [rdlTop, 1100, 'Extiende la cadera y aprieta glúteos']],
  after: (B) => plate(B.hand),
});

/* ── Gemelo de pie ── */
const calfLo = { x: 112, y: 186, t: 0, th: 180, sh: 180, f: 70, ua: 200, fa: 160, hd: 0 };
const calfHi = P(calfLo, { f: 125 });
const calf = sideAnim({
  anchor: 'toe', mus: ['calf'], ghost: calfHi, ghostLabel: 'Punta máxima',
  steps: [[calfLo, 900, 'Pausa abajo con el talón estirado'], [calfHi, 800, 'Sube a la punta máxima'], [calfHi, 400, 'Aprieta'], [calfLo, 1100, 'Baja controlado sin rebotar']],
  bg: () => rect(100, 186, 60, 19, 'box') + ln([178, 26], [178, 205], 'mach'),
  after: (B) => ln(add(B.shoulder, [-14, -6]), add(B.shoulder, [14, -6]), 'pad') + ln(add(B.shoulder, [14, -6]), [178, B.shoulder[1] - 6], 'mach'),
});

/* ── Pallof press (frontal) ── */
const pallIn = P(FS, { fxL: 90, fxR: 130, aL: 20, bL: -110, aR: 20, bR: -110 });
const pallOut = P(pallIn, { ak: 0.35, aL: -40, bL: -40, aR: -40, bR: -40 });
const pallof = frontAnim({
  mus: ['abs', 'obliques'], ghost: pallOut, ghostLabel: 'Brazos extendidos',
  steps: [[pallIn, 500, 'De lado a la polea, agarre al pecho'], [pallOut, 900, 'Extiende los brazos al frente'], [pallOut, 1200, 'Aguanta 2 s sin girar el torso'], [pallIn, 900, 'Regresa al pecho']],
  bg: () => ln([14, 60], [14, 205], 'mach thin'),
  after: (B) => cable([18, 92], [(B.lHd[0] + B.rHd[0]) / 2, (B.lHd[1] + B.rHd[1]) / 2]),
});

/* ── Remo con barra ── */
const rowBot = { x: 100, y: 205, t: 50, th: 150, sh: 195, f: 90, ua: 180, fa: 180, hd: -25 };
const rowTop = P(rowBot, { ua: 245 });
const bbrow = sideAnim({
  mus: ['back', '~biceps', '~lumbar'], ghost: rowTop, ghostLabel: 'Barra al ombligo',
  steps: [[rowBot, 500, 'Torso a unos 45°, espalda neutra'], [rowTop, 900, 'Tira con los codos hacia la cadera'], [rowTop, 350, 'Junta las escápulas'], [rowBot, 1300, 'Baja controlado']],
  after: (B) => plate(B.hand),
});

/* ── Remo sentado en polea ── */
const crOut = { x: 70, y: 178, t: 20, th: 80, sh: 105, f: 0, ua: 88, fa: 88, hd: 0 };
const crIn = P(crOut, { t: -5, ua: 235, fa: 90 });
const cablerow = sideAnim({
  anchor: 'hip', mus: ['back', '~biceps'], ghost: crIn, ghostLabel: 'Agarre al abdomen',
  steps: [[crOut, 500, 'Brazos estirados, pecho arriba'], [crIn, 1000, 'Tira hacia el abdomen'], [crIn, 400, 'Junta las escápulas'], [crOut, 1400, 'Estira sin redondear la espalda']],
  bg: () => quad([66, 190], 90, 40, 9, 'cushion') + ln([66, 194], [66, 205], 'mach') + ln([156, 150], [156, 205], 'mach') + ln([206, 160], [206, 205], 'mach thin'),
  between: (B) => cable([202, 168], B.hand),
});

/* ── Face pull ── */
const fpOut = P(S, { x: 80, t: -5, ua: 80, fa: 80 });
const fpIn = P(fpOut, { ua: 290, fa: 60 });
const facepull = sideAnim({
  mus: ['delt', '~back'], ghost: fpIn, ghostLabel: 'Manos a la frente',
  steps: [[fpOut, 400, 'Polea a la altura de la cara'], [fpIn, 900, 'Tira hacia la frente separando las manos'], [fpIn, 400, 'Pulgares apuntando atrás'], [fpOut, 1200, 'Regresa controlado']],
  bg: () => ln([198, 30], [198, 205], 'mach thin'), between: (B) => cable([194, 66], B.hand),
});

/* ── Curl con barra / martillo / inclinado ── */
const curlDown = P(S, { x: 95, ua: 180, fa: 180 });
const curlUp = P(curlDown, { ua: 172, fa: 25 });
const curl = (hammer: boolean) => sideAnim({
  mus: hammer ? ['forearm', '~biceps'] : ['biceps', '~forearm'], ghost: curlUp, ghostLabel: 'Arriba',
  steps: [[curlDown, 400, 'Codos pegados al cuerpo'], [curlUp, 900, hammer ? 'Palmas mirándose, sube sin balancear' : 'Sube sin balancear'], [curlUp, 300, 'Aprieta arriba'], [curlDown, 1700, 'Baja en 2 s']],
  after: (B) => (hammer ? dbV(B.hand) : plate(B.hand, 11)),
});
const icDown = { x: 115, y: 165, t: -40, th: 85, sh: 180, f: 90, ua: 195, fa: 195, hd: 15 };
const icUp = P(icDown, { fa: 40 });
const inclinecurl = sideAnim({
  anchor: 'hip', mus: ['biceps'], ghost: icUp, ghostLabel: 'Arriba',
  steps: [[icDown, 500, 'Brazos colgando detrás del torso'], [icUp, 900, 'Sube sin adelantar los codos'], [icUp, 300, 'Aprieta'], [icDown, 1700, 'Baja hasta estirar el bíceps']],
  bg: (B) => quad(mv(mv(B.hip, -40, 26), -130, 11), -40, 70, 10, 'cushion') + quad(mv(B.hip, 180, 9), 90, 34, 8, 'cushion') + ln(mv(B.hip, 180, 14), [B.hip[0], 205], 'mach'),
  after: (B) => db(B.hand),
});

/* ── Elevación de piernas colgado ── */
const hlrDown = { x: 110, y: 28, t: 0, th: 180, sh: 180, f: 150, ua: 0, fa: 0, hd: 0 };
const hlrUp = P(hlrDown, { t: -12, th: 85, sh: 85, f: 60, hd: 5 });
const hangingraise = sideAnim({
  anchor: 'hand', ground: false, mus: ['abs'], ghost: hlrUp, ghostLabel: 'Piernas a 90°',
  steps: [[hlrDown, 500, 'Sin balanceo, abdomen activo'], [hlrUp, 1000, 'Sube enrollando la pelvis'], [hlrUp, 300, 'Arriba'], [hlrDown, 1500, 'Baja controlado']],
  bg: () => ln([40, 28], [180, 28], 'mach'),
});

/* ── Saltos laterales a una pierna (frontal) ── */
const lhA = P(FS, { cx: 88, hy: 127, fxL: 82, fyL: 205, fxR: 102, fyR: 182, aL: 25, bL: 20, aR: 25, bR: 20 });
const lhAir = P(lhA, { cx: 110, hy: 112, fxL: 104, fyL: 190, fxR: 124, fyR: 172 });
const lhB = P(lhA, { cx: 132, fxL: 126, fxR: 146 });
const lateralhop = frontAnim({
  mus: ['gmed', '~quads'], ghost: lhB, ghostLabel: 'Aterrizaje estable',
  steps: [[lhA, 300, 'Sobre una pierna, rodilla alineada'], [lhAir, 170, 'Salta de lado'], [lhB, 170, 'Aterriza estable'], [lhB, 260, 'Contacto corto y reactivo'], [lhAir, 170, 'Regresa'], [lhA, 170, 'Aterriza']],
});

/* ── Drop jump ── */
const dj = {
  box: { x: 50, y: 180, t: 0, th: 180, sh: 180, f: 90, ua: 180, fa: 180, hd: 0 },
  off: { x: 82, y: 190, t: 5, th: 175, sh: 185, f: 120, ua: 200, fa: 180, hd: 0 },
  hit: { x: 96, y: 199, t: 15, th: 150, sh: 200, f: 115, ua: 220, fa: 200, hd: -5 },
  up: { x: 100, y: 160, t: 0, th: 180, sh: 180, f: 150, ua: 10, fa: 10, hd: 0 },
  land: { x: 104, y: 205, t: 20, th: 150, sh: 200, f: 90, ua: 150, fa: 150, hd: -5 },
};
const dropjump = sideAnim({
  mus: ['calf', 'quad'], fade: true, ghost: dj.hit, ghostLabel: 'Contacto mínimo',
  steps: [[dj.box, 500, 'Sobre un cajón bajo'], [dj.off, 260, 'Da un paso fuera, no saltes'], [dj.hit, 150, 'Contacto mínimo con el suelo'], [dj.up, 260, 'Rebota hacia arriba de inmediato'], [dj.land, 320, 'Aterriza suave'], [dj.land, 600, 'Reinicia y repite']],
  bg: () => rect(20, 180, 52, 25, 'box'),
});

/* ── Step-up ── */
const suLo = { x: 125, y: 175, t: 20, th: 97, sh: 180, f: 90, th2: 177, sh2: 177, f2: 120, ua: 180, fa: 180, hd: -10 };
const suHi = P(suLo, { t: 0, th: 180, sh: 180, th2: 140, sh2: 190, f2: 140, hd: 0 });
const stepup = sideAnim({
  mus: ['quad', 'glute'], ghost: suLo, ghostLabel: 'Rodilla a ~90°',
  steps: [[suLo, 500, 'Todo el pie sobre el cajón'], [suHi, 1100, 'Sube empujando con la pierna de arriba'], [suHi, 400, 'Rodilla al frente, cadera extendida'], [suLo, 1500, 'Baja controlado']],
  bg: () => rect(112, 175, 64, 30, 'box'), after: (B) => db(B.hand),
  fg: (B) => angleMark(B.knee, B.hip, B.ankle, 26),
});

/* ── Hip thrust ── */
const htLo = { x: 150, y: 205, t: -65, th: 60, sh: 165, f: 90, ua: 125, fa: 95, hd: 20 };
const htHi = P(htLo, { t: -90, th: 90, sh: 180, ua: 100, fa: 80, hd: 30 });
const hipthrust = sideAnim({
  mus: ['glute', '~ham'], ghost: htHi, ghostLabel: 'Torso paralelo al suelo',
  steps: [[htLo, 500, 'Espalda alta en el banco, barra en la cadera'], [htHi, 1000, 'Sube extendiendo la cadera'], [htHi, 500, 'Aprieta 1 s, mentón recogido'], [htLo, 1400, 'Baja controlado']],
  bg: () => rect(18, 168, 54, 37, 'cushion', 4),
  after: (B) => plate(add(B.hip, [0, -12])),
  fg: (B) => angleMark(B.knee, B.hip, B.ankle, 24),
});

/* ── Curl nórdico ── */
const nhTop = { x: 85, y: 198, t: 0, th: 180, sh: 270, f: 250, ua: 175, fa: 20, hd: 0 };
const nhBot = P(nhTop, { t: 70, th: 250, ua: 140, fa: 140, hd: -20 });
const nordic = sideAnim({
  anchor: 'knee', mus: ['ham', '~glute'], ghost: nhBot, ghostLabel: 'Bajada completa',
  steps: [[nhTop, 600, 'Rodillas en el cojín, tobillos sujetos'], [nhBot, 2600, 'Baja lo más lento posible, cadera extendida'], [nhBot, 400, 'Apóyate con las manos'], [nhTop, 1100, 'Vuelve arriba']],
  after: (B) => circ(add(B.ankle, [2, -9]), 6, 'cushion'),
});

/* ── Sóleo sentado ── */
const solLo = { x: 78, y: 150, t: 0, th: 92.7, sh: 180, f: 65, ua: 160, fa: 95, hd: 0 };
const solHi = P(solLo, { th: 72.5, f: 125 });
const soleus = sideAnim({
  anchor: 'hip', mus: ['calf'], ghost: solHi, ghostLabel: 'Punta máxima',
  steps: [[solLo, 800, 'Rodillas a 90°, talón abajo'], [solHi, 800, 'Sube a la punta máxima'], [solHi, 400, 'Aprieta'], [solLo, 1100, 'Baja con pausa abajo']],
  bg: () => rect(118, 186, 44, 19, 'box') + quad([72, 162], 90, 40, 9, 'cushion') + ln([72, 166], [72, 205], 'mach'),
  after: (B) => quad(add(B.knee, [-4, -10]), 90, 22, 8, 'cushion') + ln(add(B.knee, [8, -10]), [170, B.knee[1] - 10], 'mach'),
});

/* ── Elevación de tibial ── */
const tibDown = { x: 112, y: 205, t: -14, th: 166, sh: 166, f: 100, ua: 185, fa: 185, hd: 5 };
const tibUp = P(tibDown, { f: 45 });
const tibialis = sideAnim({
  mus: ['tib'], ghost: tibUp, ghostLabel: 'Puntas arriba',
  steps: [[tibDown, 500, 'Espalda en la pared, talones adelante'], [tibUp, 700, 'Sube las puntas lo más alto posible'], [tibUp, 300, 'Aguanta'], [tibDown, 1000, 'Baja despacio']],
  bg: () => ln([68, 18], [68, 205], 'mach'),
});

/* ── Monster walk (frontal) ── */
const mwA = P(FS, { hy: 140, fxL: 86, fxR: 134, aL: 30, bL: -60, aR: 30, bR: -60 });
const mwB = P(mwA, { cx: 116, fxR: 156, fyR: 196 });
const mwC = P(mwB, { fyR: 205 });
const monster = frontAnim({
  mus: ['gmed', '~quads'], ghost: mwC, ghostLabel: 'Paso lateral',
  steps: [[mwA, 400, 'Media sentadilla, banda tensa'], [mwB, 450, 'Paso lateral sin juntar los pies'], [mwC, 250, 'Rodillas hacia fuera'], [mwC, 300, 'Mantén la tensión'], [mwA, 600, 'Regresa controlado']],
  after: (B) => ln(add(B.lK, [1, 8]), add(B.rK, [-1, 8]), 'band'),
});

/* ── Plancha Copenhague ── */
const cpLo = { x: 48, y: 203, t: -68, th: 57, sh: 57, f: 160, ua: 180, fa: 270, th2: 95, sh2: 100, f2: 180, ua2: 100, fa2: 150, hd: -10 };
const cpHi = P(cpLo, { t: -105, th: 75, sh: 75, th2: 95, sh2: 130 });
const copenhagen = sideAnim({
  anchor: 'elbow', view: 'Vista lateral (de frente al cuerpo)', mus: ['ham', '~abs'], ghost: cpHi, ghostLabel: 'Cuerpo en línea recta',
  steps: [[cpLo, 500, 'Pierna de arriba sobre el banco'], [cpHi, 900, 'Sube la cadera'], [cpHi, 1800, 'Cuerpo en línea recta: aguanta'], [cpLo, 900, 'Baja controlado']],
  bg: () => rect(150, 150, 56, 55, 'cushion', 4),
});

/* ── Dead bug ── */
const dbTab = { x: 125, y: 192, t: -90, th: 0, sh: 90, f: 0, ua: 0, fa: 0, hd: 10, th2: 0, sh2: 90, f2: 0, ua2: 0, fa2: 0 };
const dbExt = P(dbTab, { ua: -80, fa: -80, th2: 80, sh2: 82, f2: 150 });
const deadbug = sideAnim({
  anchor: 'hip', mus: ['abs'], ghost: dbExt, ghostLabel: 'Brazo y pierna contrarios',
  steps: [[dbTab, 500, 'Espalda baja pegada al suelo'], [dbExt, 1300, 'Extiende brazo y pierna contrarios'], [dbExt, 400, 'Sin arquear la espalda'], [dbTab, 1000, 'Regresa y cambia de lado']],
});

/* ── Press militar ── */
const ohpBot = P(S, { ua: 150, fa: -10, hd: -8 });
const ohpTop = P(S, { ua: 5, fa: 0, hd: 0 });
const ohp = sideAnim({
  mus: ['delt', '~triceps', '~abs'], ghost: ohpTop, ghostLabel: 'Barra sobre el medio pie',
  steps: [[ohpBot, 500, 'Glúteos y abdomen apretados'], [ohpTop, 1000, 'Empuja y saca la cabeza hacia atrás'], [ohpTop, 300, 'Termina con la barra sobre el medio pie'], [ohpBot, 1700, 'Baja controlado a la clavícula']],
  after: (B) => plate(B.hand),
});

/* ── Elevaciones laterales (frontal) ── */
const lrDown = P(FS, { aL: 12, bL: 8, aR: 12, bR: 8 });
const lrUp = P(FS, { aL: 88, bL: 82, aR: 88, bR: 82 });
const lateralraise = frontAnim({
  mus: ['delts', '~traps'], ghost: lrUp, ghostLabel: 'Altura de los hombros',
  steps: [[lrDown, 400, 'Codos ligeramente flexionados'], [lrUp, 900, 'Sube guiando con los codos'], [lrUp, 300, 'Hasta la altura de los hombros'], [lrDown, 1700, 'Baja en 2 s']],
  after: (B) => db(B.lHd) + db(B.rHd),
});

/* ── Pájaros (frontal, inclinado) ── */
const rfDown = P(FS, { hy: 128, tk: 0.55, ho: -8, aL: 6, bL: 4, aR: 6, bR: 4, fxL: 96, fxR: 124 });
const rfUp = P(rfDown, { aL: 86, bL: 84, aR: 86, bR: 84 });
const reversefly = frontAnim({
  view: 'Vista frontal (torso inclinado)', mus: ['delts', '~traps'], ghost: rfUp, ghostLabel: 'Brazos en cruz',
  steps: [[rfDown, 400, 'Torso casi paralelo al suelo'], [rfUp, 900, 'Abre los brazos hacia los lados'], [rfUp, 300, 'Junta las escápulas'], [rfDown, 1500, 'Baja controlado']],
  after: (B) => db(B.lHd) + db(B.rHd),
});

/* ── Farmer carry ── */
const fcA = { x: 100, y: 128, t: 0, th: 160, sh: 175, f: 90, th2: 200, sh2: 190, f2: 120, ua: 180, fa: 180, hd: 0 };
const fcB = P(fcA, { y: 125, th: 182, sh: 178, f: 90, th2: 170, sh2: 210, f2: 150 });
const fcC = P(fcA, { th: 200, sh: 190, f: 120, th2: 160, sh2: 175, f2: 90 });
const fcD = P(fcA, { y: 125, th: 170, sh: 210, f: 150, th2: 182, sh2: 178, f2: 90 });
const farmer = sideAnim({
  anchor: 'hip', mus: ['forearm', '~back', '~abs'], ghost: fcB, ghostLabel: 'Torso erguido',
  steps: [[fcA, 300, 'Mancuernas pesadas, hombros atrás'], [fcB, 300, 'Pasos cortos y firmes'], [fcC, 300, 'Torso erguido'], [fcD, 300, 'Sin inclinarte'], [fcA, 300, 'Respira y sigue']],
  after: (B) => dbV(B.hand),
});

/* ── Plancha lateral ── */
const spLo = { x: 48, y: 203, t: -70, th: 93, sh: 93, f: 100, ua: 180, fa: 270, ua2: 100, fa2: 170, hd: -10 };
const spHi = P(spLo, { t: -80, th: 100, sh: 100 });
const sideplank = sideAnim({
  anchor: 'elbow', view: 'Vista lateral (de frente al cuerpo)', mus: ['abs'], ghost: spHi, ghostLabel: 'Cuerpo en línea recta',
  steps: [[spLo, 400, 'Codo bajo el hombro'], [spHi, 700, 'Sube la cadera'], [spHi, 2000, 'Aguanta en línea recta'], [spLo, 700, 'Baja controlado']],
});

export const ANIMS: Record<string, AnimDef> = {
  squat, pullup, boxjump, legpress,
  bench: bench(false), closegrip: bench(true), incline, dips, fly, pushdown, overhead, abwheel,
  pogo, slbroad, rdl, calf, pallof,
  bbrow, cablerow, facepull, curl: curl(false), hammer: curl(true), hangingraise,
  lateralhop, dropjump, stepup, hipthrust, nordic, soleus, tibialis, monster, copenhagen, deadbug,
  ohp, lateralraise, reversefly, inclinecurl, farmer, sideplank,
};

export const ease = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;
const FALLBACK: Record<string, string> = { th2: 'th', sh2: 'sh', f2: 'f', ua2: 'ua', fa2: 'fa' };
export const lerp = (a: Pose, b: Pose, k: number): Pose => {
  const o: Pose = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const av = a[key] ?? a[FALLBACK[key]] ?? b[key] ?? 0;
    const bv = b[key] ?? b[FALLBACK[key]] ?? av;
    o[key] = av + (bv - av) * k;
  }
  return o;
};
