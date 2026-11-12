import { SESSIONS, BLOCKS, defaultWeek } from '../data/program';
import type { Prescription, RunPlan, SessionId } from '../data/types';
import { getEx } from '../data/exercises';
import { daysBetween, dow, mondayOf } from './dates';
import type { State } from './store';

export interface WeekInfo {
  index: number; // semanas desde el inicio (0 = semana 1)
  block: number; // 1..3, luego se repite el ciclo
  blockName: string;
  weekInBlock: number; // 1..4
  deload: boolean;
  intro: boolean;
  thursday: 'hills' | 'fartlek';
}

export function weekInfo(date: string, s: State): WeekInfo {
  const start = mondayOf(s.settings.startDate);
  const index = Math.max(0, Math.floor(daysBetween(start, mondayOf(date)) / 7));
  const blockIdx = Math.floor(index / 4) % BLOCKS.length;
  const weekInBlock = (index % 4) + 1;
  const other = s.settings.thursdayFirst === 'hills' ? 'fartlek' : 'hills';
  return {
    index,
    block: blockIdx + 1,
    blockName: BLOCKS[blockIdx].name,
    weekInBlock,
    deload: weekInBlock === 4,
    intro: index === 0,
    thursday: index % 2 === 0 ? s.settings.thursdayFirst : other,
  };
}

export interface DayPlan {
  date: string;
  run: RunPlan;
  runFromCoach: boolean;
  gym: SessionId | null;
}

export function dayPlan(date: string, s: State): DayPlan {
  const w = weekInfo(date, s);
  const t = defaultWeek(w.thursday)[dow(date)];
  const coach = s.coach[date];
  return { date, run: coach ?? t.run, runFromCoach: !!coach, gym: t.gym };
}

const isPlyo = (p: Prescription) => getEx(p.ex).progression === 'plyo';

/** Prescripción final del día: aplica fartlek/cuestas, semana de introducción, descarga y ajuste del check-in */
export function sessionItems(id: SessionId, date: string, s: State, adjust: 'normal' | 'reduced' = 'normal'): Prescription[] {
  const w = weekInfo(date, s);
  return SESSIONS[id].items
    .filter((p) => !p.onlyFartlek || w.thursday === 'fartlek')
    .filter((p) => adjust === 'normal' || !isPlyo(p))
    .map((p) => {
      let sets = p.sets;
      let rpe = p.rpe;
      if (w.deload) {
        sets = Math.ceil(sets / 2);
        rpe = rpe ? '6' : rpe;
      } else if (w.intro && sets >= 3) {
        sets -= 1;
      }
      if (adjust === 'reduced') {
        sets = Math.max(1, sets - 1);
        if (rpe) rpe = rpe.split('-').map((x) => String(Math.max(5, Number(x) - 1))).join('-');
      }
      return { ...p, sets, rpe };
    });
}

export function weekNote(w: WeekInfo): string | null {
  if (w.deload) return 'Semana de descarga: la mitad de las series y RPE 6. Recuperar también es entrenar.';
  if (w.intro) return 'Semana de introducción: una serie menos en los ejercicios principales para adaptarte sin afectar tus sesiones de calidad.';
  return null;
}
