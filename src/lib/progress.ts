import { getEx } from '../data/exercises';
import type { Prescription } from '../data/types';
import { mondayOf, todayKey, addDays } from './dates';
import type { SetLog, State, WorkoutLog } from './store';

export const e1rm = (w: number, r: number) => (r <= 1 ? w : w * (1 + Math.min(r, 12) / 30));

const round = (x: number, step: number) => Math.round(x / step) * step;

export function fmtKg(w: number): string {
  return Number.isInteger(w) ? String(w) : w.toFixed(w * 4 === Math.round(w * 4) ? 2 : 1).replace(/0$/, '');
}

/** Series de la última sesión registrada de ese ejercicio (excluye la sesión en curso) */
export function lastSets(exId: string, workouts: WorkoutLog[], excludeId?: string): { date: string; sets: SetLog[] } | null {
  for (let i = workouts.length - 1; i >= 0; i--) {
    const w = workouts[i];
    if (w.id === excludeId) continue;
    const sets = w.sets.filter((x) => x.exId === exId);
    if (sets.length) return { date: w.date, sets };
  }
  return null;
}

export interface Suggestion {
  weight: number | null;
  reps: number;
  text: string;
}

export function suggest(exId: string, p: Prescription, workouts: WorkoutLog[], excludeId?: string): Suggestion {
  const ex = getEx(exId);
  const [lo, hi] = p.reps;
  const last = lastSets(exId, workouts, excludeId);
  const unit = ex.unit === 's' ? 's' : ex.unit === 'm' ? 'm' : 'reps';
  if (!last) {
    if (ex.bodyweight) return { weight: null, reps: lo, text: `Primera vez: ${lo} ${unit} con técnica perfecta.` };
    return { weight: null, reps: lo, text: `Primera vez: elige un peso con el que llegues a ${hi} ${unit}${p.rpe ? ` a RPE ${p.rpe}` : ''}.` };
  }
  const worked = last.sets.filter((s) => s.reps != null);
  const topW = Math.max(0, ...worked.map((s) => s.weight ?? 0));
  const allTop = worked.length >= p.sets && worked.every((s) => (s.reps ?? 0) >= hi);

  if (ex.bodyweight || ex.progression === 'plyo') {
    if (ex.progression === 'plyo') return { weight: topW || null, reps: lo, text: 'Misma dosis. Busca saltos más altos o contactos más cortos que la última vez.' };
    const best = Math.max(...worked.map((s) => s.reps ?? 0));
    const target = Math.min(hi, best + 1);
    return { weight: topW || null, reps: target, text: allTop ? `Llegaste al tope: agrega dificultad (lastre o variante más difícil).` : `Intenta ${target} ${unit} por serie (+1).` };
  }
  const inc = ex.increment ?? 2.5;
  if (allTop) {
    const w = round(topW + inc, inc < 1.25 ? 0.5 : 0.25);
    return { weight: w, reps: lo, text: `Completaste ${hi} ${unit} en todas las series: sube a ${fmtKg(w)} kg y vuelve a ${lo} ${unit}.` };
  }
  const lastTotal = worked.filter((s) => s.weight === topW).map((s) => s.reps).join(', ');
  return { weight: topW, reps: Math.min(hi, Math.max(lo, ...worked.map((s) => s.reps ?? 0))), text: `Mismo peso (${fmtKg(topW)} kg). La última vez: ${lastTotal}. Suma 1 rep donde puedas.` };
}

/* ───────────── Récords personales ───────────── */

export type PRKind = 'peso' | '1RM' | 'reps';
export interface PR {
  workoutId: string;
  date: string;
  exId: string;
  kind: PRKind;
  weight: number | null;
  reps: number;
  value: number;
  label: string;
}

export function computePRs(workouts: WorkoutLog[]): PR[] {
  const best: Record<string, { w: number; e: number; repsAt: { w: number; r: number }[]; bwReps: number; seen: boolean }> = {};
  const out: PR[] = [];
  for (const wk of workouts) {
    const perEx: Record<string, PR[]> = {};
    const seenBefore = new Set(Object.keys(best).filter((k) => best[k].seen));
    for (const s of wk.sets) {
      if (s.reps == null || s.reps <= 0) continue;
      const ex = getEx(s.exId);
      if (ex.progression === 'plyo') continue;
      const b = (best[s.exId] ??= { w: 0, e: 0, repsAt: [], bwReps: 0, seen: false });
      const first = !seenBefore.has(s.exId);
      const unit = ex.unit === 's' ? 's' : ex.unit === 'm' ? 'm' : '';
      const push = (kind: PRKind, value: number, label: string) => {
        if (first) return;
        (perEx[s.exId] ??= []).push({ workoutId: wk.id, date: wk.date, exId: s.exId, kind, weight: s.weight, reps: s.reps!, value, label });
      };
      const w = s.weight ?? 0;
      if (w > 0) {
        const e = e1rm(w, s.reps);
        const prevRepsAtOrAbove = Math.max(0, ...b.repsAt.filter((x) => x.w >= w).map((x) => x.r));
        if (w > b.w) push('peso', w, `${fmtKg(w)} kg × ${s.reps}`);
        else if (e > b.e + 0.01) push('1RM', e, `1RM est. ${fmtKg(Math.round(e * 2) / 2)} kg (${fmtKg(w)} × ${s.reps})`);
        else if (s.reps > prevRepsAtOrAbove && prevRepsAtOrAbove > 0) push('reps', s.reps, `${s.reps} reps con ${fmtKg(w)} kg`);
        b.w = Math.max(b.w, w);
        b.e = Math.max(b.e, e);
        b.repsAt.push({ w, r: s.reps });
      } else {
        if (s.reps > b.bwReps && b.bwReps > 0) push('reps', s.reps, `${s.reps}${unit ? ' ' + unit : ' reps'}`);
        b.bwReps = Math.max(b.bwReps, s.reps);
      }
    }
    for (const id of new Set(wk.sets.map((s) => s.exId))) if (best[id]) best[id].seen = true;
    // Un récord por tipo y ejercicio en cada sesión: el mejor
    for (const list of Object.values(perEx)) {
      const byKind: Record<string, PR> = {};
      for (const pr of list) if (!byKind[pr.kind] || pr.value > byKind[pr.kind].value) byKind[pr.kind] = pr;
      // si hay PR de peso, el de 1RM de ese mismo día sobra
      if (byKind.peso) delete byKind['1RM'];
      out.push(...Object.values(byKind));
    }
  }
  return out;
}

/* ───────────── Semanas, racha y métricas ───────────── */

export const WEEK_TARGET = 4; // sesiones de gym para "semana cumplida" (de 5 planeadas)

export function gymByWeek(workouts: WorkoutLog[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const w of workouts) if (w.endedAt) m[mondayOf(w.date)] = (m[mondayOf(w.date)] ?? 0) + 1;
  return m;
}

export function streakWeeks(s: State): number {
  const m = gymByWeek(s.workouts);
  let wk = mondayOf(todayKey());
  let n = (m[wk] ?? 0) >= WEEK_TARGET ? 1 : 0; // la semana actual suma solo si ya se cumplió
  wk = addDays(wk, -7);
  while ((m[wk] ?? 0) >= WEEK_TARGET) {
    n++;
    wk = addDays(wk, -7);
  }
  return n;
}

export function activeWeeks(s: State): number {
  const weeks = new Set<string>();
  s.workouts.forEach((w) => w.endedAt && weeks.add(mondayOf(w.date)));
  Object.keys(s.runs).forEach((d) => weeks.add(mondayOf(d)));
  return weeks.size;
}

export function volume(sets: SetLog[]): number {
  return sets.reduce((a, s) => a + (s.weight ?? 0) * (s.reps ?? 0), 0);
}

export function timing(w: WorkoutLog) {
  const work = w.sets.reduce((a, s) => a + Math.max(0, (s.endedAt - s.startedAt) / 1000), 0);
  const rests = w.sets.map((s) => s.restSec).filter((x): x is number => x != null && x < 900);
  const rest = rests.reduce((a, b) => a + b, 0);
  const total = w.endedAt ? (w.endedAt - w.startedAt) / 1000 : work + rest;
  return {
    total,
    work,
    rest,
    avgSet: w.sets.length ? work / w.sets.length : 0,
    avgRest: rests.length ? rest / rests.length : 0,
    density: total > 0 ? volume(w.sets) / (total / 60) : 0,
  };
}
