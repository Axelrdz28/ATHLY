import type { GymSession, RunPlan, SessionId } from './types';

/* Bloque 1 · Base. Rangos y RPE validados en la planificación. */
export const SESSIONS: Record<SessionId, GymSession> = {
  push: {
    id: 'push', name: 'Pecho + tríceps', focus: 'Empuje + core', minutes: 60,
    items: [
      { ex: 'bench', sets: 4, reps: [5, 8], rpe: '8', rest: 150, tempo: '2-0-1' },
      { ex: 'incline-db', sets: 3, reps: [8, 10], rpe: '8', rest: 120, tempo: '2-0-1' },
      { ex: 'dips', sets: 3, reps: [8, 12], rpe: '8', rest: 90 },
      { ex: 'cable-fly', sets: 3, reps: [12, 15], rpe: '8-9', rest: 60 },
      { ex: 'pushdown', sets: 3, reps: [10, 12], rpe: '9', rest: 60 },
      { ex: 'overhead-ext', sets: 3, reps: [10, 12], rpe: '9', rest: 60 },
      { ex: 'ab-wheel', sets: 3, reps: [8, 12], rest: 60 },
    ],
  },
  legA: {
    id: 'legA', name: 'Pierna A', focus: 'Pliometría + fuerza', minutes: 60,
    items: [
      { ex: 'pogo', sets: 3, reps: [15, 15], rest: 60, note: 'Explosivo, contactos cortos' },
      { ex: 'box-jump', sets: 4, reps: [4, 4], rest: 90, note: 'Máxima intención, baja caminando' },
      { ex: 'sl-broad', sets: 3, reps: [5, 5], rest: 90, note: 'Por pierna, aguanta 2 s al caer' },
      { ex: 'back-squat', sets: 4, reps: [4, 6], rpe: '7-8', rest: 180, tempo: '2-0-1', note: 'Pesado, sin llegar al fallo' },
      { ex: 'rdl', sets: 3, reps: [6, 6], rpe: '7-8', rest: 150, tempo: '2-0-1' },
      { ex: 'standing-calf', sets: 3, reps: [8, 10], rpe: '8', rest: 90, note: 'Pausa de 1 s abajo' },
      { ex: 'pallof', sets: 3, reps: [10, 10], rest: 45, note: 'Por lado' },
    ],
  },
  pull: {
    id: 'pull', name: 'Espalda + bíceps', focus: 'Tracción + core', minutes: 60,
    items: [
      { ex: 'pullup', sets: 4, reps: [6, 10], rpe: '8', rest: 120, tempo: '2-0-1', note: 'Con lastre si haces más de 10' },
      { ex: 'bb-row', sets: 4, reps: [6, 8], rpe: '8', rest: 120 },
      { ex: 'cable-row', sets: 3, reps: [10, 12], rpe: '8', rest: 90 },
      { ex: 'face-pull', sets: 3, reps: [15, 15], rpe: '8', rest: 60 },
      { ex: 'bb-curl', sets: 3, reps: [8, 10], rpe: '9', rest: 60 },
      { ex: 'hammer-curl', sets: 3, reps: [10, 12], rpe: '9', rest: 60 },
      { ex: 'hanging-leg-raise', sets: 3, reps: [10, 12], rest: 60 },
    ],
  },
  legB: {
    id: 'legB', name: 'Pierna B', focus: 'Unilateral + estabilidad', minutes: 50,
    items: [
      { ex: 'lateral-hop', sets: 3, reps: [8, 8], rest: 60, note: 'Por lado', onlyFartlek: true },
      { ex: 'drop-jump', sets: 3, reps: [5, 5], rest: 90, onlyFartlek: true },
      { ex: 'step-up', sets: 3, reps: [6, 6], rpe: '7', rest: 90, note: 'Por pierna' },
      { ex: 'hip-thrust', sets: 3, reps: [8, 8], rpe: '7', rest: 90 },
      { ex: 'nordic', sets: 2, reps: [3, 3], rest: 120, note: 'Bloque 1: solo la bajada (excéntrico)' },
      { ex: 'seated-soleus', sets: 3, reps: [12, 12], rpe: '8', rest: 60 },
      { ex: 'tibialis', sets: 2, reps: [15, 20], rest: 45 },
      { ex: 'monster-walk', sets: 3, reps: [15, 15], rest: 45, note: 'Pasos por lado' },
      { ex: 'copenhagen', sets: 3, reps: [20, 20], rest: 45, note: 'Segundos por lado' },
      { ex: 'dead-bug', sets: 3, reps: [10, 10], rest: 45 },
    ],
  },
  shoulders: {
    id: 'shoulders', name: 'Hombro + brazos', focus: 'Hombro, brazos y core', minutes: 75,
    items: [
      { ex: 'ohp', sets: 4, reps: [5, 8], rpe: '8', rest: 150, tempo: '2-0-1' },
      { ex: 'lateral-raise', sets: 4, reps: [12, 15], rpe: '9', rest: 60 },
      { ex: 'reverse-fly', sets: 3, reps: [15, 15], rpe: '9', rest: 60 },
      { ex: 'close-grip', sets: 3, reps: [8, 8], rpe: '8', rest: 30, note: 'Superserie con curl inclinado' },
      { ex: 'incline-curl', sets: 3, reps: [10, 10], rpe: '8-9', rest: 90, note: 'Superserie con press cerrado' },
      { ex: 'farmer-carry', sets: 3, reps: [40, 40], rest: 60, note: 'Metros' },
      { ex: 'side-plank', sets: 3, reps: [30, 30], rest: 45, note: 'Segundos por lado' },
    ],
  },
};

/** 0 = domingo … 6 = sábado */
export interface DayTemplate {
  run: RunPlan;
  gym: SessionId | null;
}

export const RUN_TYPES: Record<RunPlan['type'], string> = {
  easy: 'Rodaje suave',
  track: 'Pista / intervalos',
  hills: 'Cuestas',
  fartlek: 'Fartlek',
  long: 'Tirada larga',
  rest: 'Descanso',
  other: 'Otro',
};

export function defaultWeek(thursday: 'hills' | 'fartlek'): Record<number, DayTemplate> {
  return {
    1: { run: { type: 'easy', title: 'Easy', detail: 'Rodaje suave', km: [5, 7] }, gym: 'push' },
    2: { run: { type: 'track', title: 'Pista', detail: 'Repeticiones / intervalos' }, gym: 'legA' },
    3: { run: { type: 'easy', title: 'Easy', detail: 'Rodaje suave', km: [8, 10] }, gym: 'pull' },
    4: {
      run: thursday === 'hills'
        ? { type: 'hills', title: 'Cuestas', detail: 'Repeticiones en subida' }
        : { type: 'fartlek', title: 'Fartlek', detail: 'Cambios de ritmo' },
      gym: 'legB',
    },
    5: { run: { type: 'easy', title: 'Easy', detail: 'Rodaje suave', km: [8, 10] }, gym: 'shoulders' },
    6: { run: { type: 'long', title: 'Tirada larga', detail: 'Ritmo cómodo' }, gym: null },
    0: { run: { type: 'rest', title: 'Descanso total' }, gym: null },
  };
}

export const BLOCKS = [
  { n: 1, name: 'Base', focus: 'Fuerza base + hipertrofia, pliometría básica' },
  { n: 2, name: 'Fuerza', focus: 'Fuerza máxima (3-6 reps), pliometría media' },
  { n: 3, name: 'Potencia', focus: 'Fuerza explosiva y contrastes, pliometría avanzada' },
];
