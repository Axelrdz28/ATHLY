import type { Readiness } from './store';

export interface ReadinessResult {
  level: 'normal' | 'reduced' | 'swap';
  title: string;
  text: string;
}

/** Reglas de entrenamiento, no IA: piernas pesan más en días de pierna. */
export function evaluate(r: Readiness, legDay: boolean): ReadinessResult {
  const avg = (r.legs + r.sleep + r.energy) / 3;
  if (legDay && (r.legs <= 1 || (r.legs <= 2 && avg <= 2.5))) {
    return {
      level: 'swap',
      title: 'Hoy conviene mover la pierna',
      text: 'Tus piernas llegan muy cargadas. Te sugiero cambiar esta sesión por otro día o hacer la versión reducida, sin pliometría.',
    };
  }
  if ((legDay && r.legs <= 2) || avg < 3 || r.sleep <= 1) {
    return {
      level: 'reduced',
      title: 'Versión reducida',
      text: 'Una serie menos por ejercicio, RPE −1 y sin pliometría. Mantienes el estímulo sin cavar un hoyo de fatiga.',
    };
  }
  return { level: 'normal', title: 'Todo en orden', text: 'Sesión completa, tal como está planeada.' };
}
