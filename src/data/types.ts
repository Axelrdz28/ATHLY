export type Progression = 'double' | 'plyo' | 'reps' | 'time' | 'carry';
export type AnimId = 'squat' | 'pullup' | 'boxjump' | 'legpress';

export interface Exercise {
  id: string;
  name: string;
  primary: string[];
  secondary?: string[];
  equipment: string;
  cues: string[];
  errors: string[];
  progression: Progression;
  /** kg que se suben al progresar (doble progresión) */
  increment?: number;
  /** máximo 2, y solo si son equivalentes de verdad */
  alts?: string[];
  anim?: AnimId;
  /** se registra por pierna/lado */
  perSide?: boolean;
  /** se registra sin peso (peso corporal o saltos) */
  bodyweight?: boolean;
  /** unidad de las "reps": reps, segundos o metros */
  unit?: 'reps' | 's' | 'm';
}

export interface Prescription {
  ex: string;
  sets: number;
  reps: [number, number];
  rpe?: string;
  rest: number; // segundos
  tempo?: string;
  note?: string;
  /** solo en semanas de fartlek */
  onlyFartlek?: boolean;
}

export type SessionId = 'push' | 'legA' | 'pull' | 'legB' | 'shoulders';

export interface GymSession {
  id: SessionId;
  name: string;
  focus: string;
  minutes: number;
  items: Prescription[];
}

export type RunType = 'easy' | 'track' | 'hills' | 'fartlek' | 'long' | 'rest' | 'other';

export interface RunPlan {
  type: RunType;
  title: string;
  detail?: string;
  km?: [number, number];
}
