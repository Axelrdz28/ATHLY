import { useSyncExternalStore } from 'react';
import type { RunPlan, RunType, SessionId } from '../data/types';
import { mondayOf, todayKey } from './dates';

export interface SetLog {
  exId: string;
  item: number; // índice del ejercicio en la sesión
  set: number; // 1..n
  weight: number | null;
  reps: number | null;
  startedAt: number;
  endedAt: number;
  restSec?: number; // descanso real ANTES de esta serie
}

export interface Readiness {
  legs: number;
  sleep: number;
  energy: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  sessionId: SessionId;
  startedAt: number;
  endedAt?: number;
  adjust: 'normal' | 'reduced';
  readiness?: Readiness;
  /** índice del ejercicio → id del ejercicio elegido (principal o alternativa) */
  choices: Record<number, string>;
  sets: SetLog[];
  /** estado del cronómetro mientras la sesión está en curso */
  live?: LiveState;
}

export interface LiveState {
  item: number;
  phase: 'idle' | 'set' | 'rest';
  since: number;
  restFor?: number;
  pendingRest?: number;
}

export interface RunLog {
  date: string;
  type: RunType;
  km?: number;
  minutes?: number;
  notes?: string;
}

export interface State {
  v: 1;
  profile: { name: string; weightKg?: number; heightCm?: number; birthYear?: number };
  settings: {
    startDate: string; // lunes de la semana 1 del bloque 1
    thursdayFirst: 'hills' | 'fartlek'; // qué toca el jueves de la semana 1
    theme: 'system' | 'dark' | 'light';
  };
  workouts: WorkoutLog[];
  runs: Record<string, RunLog>;
  /** plan de running capturado (coach o propio) que sustituye al plan base ese día */
  coach: Record<string, RunPlan>;
  active: WorkoutLog | null;
}

const KEY = 'athly:v1';

function initial(): State {
  return {
    v: 1,
    profile: { name: '' },
    settings: { startDate: mondayOf(todayKey()), thursdayFirst: 'hills', theme: 'dark' },
    workouts: [],
    runs: {},
    coach: {},
    active: null,
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const s = JSON.parse(raw) as State;
    return { ...initial(), ...s, settings: { ...initial().settings, ...s.settings } };
  } catch {
    return initial();
  }
}

let state: State = load();
const subs = new Set<() => void>();

export function getState(): State {
  return state;
}

export function setState(fn: (s: State) => State): void {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sin espacio o almacenamiento bloqueado: la app sigue funcionando en memoria */
  }
  subs.forEach((f) => f());
}

export function replaceState(s: State): void {
  setState(() => ({ ...initial(), ...s, settings: { ...initial().settings, ...s.settings } }));
}

export function resetState(): void {
  setState(() => initial());
}

export function useStore(): State {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => state,
  );
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Pide al navegador que no borre los datos al liberar espacio */
export function requestPersistence(): void {
  try {
    navigator.storage?.persist?.();
  } catch {
    /* no disponible */
  }
}
