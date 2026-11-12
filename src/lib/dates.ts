export const DAY_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
export const DAY_NAME = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(k: string, n: number): string {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function todayKey(): string {
  return toKey(new Date());
}

/** Lunes de la semana de esa fecha */
export function mondayOf(k: string): string {
  const d = fromKey(k);
  const dow = d.getDay();
  return addDays(k, dow === 0 ? -6 : 1 - dow);
}

export function weekDays(k: string): string[] {
  const mon = mondayOf(k);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

export function dow(k: string): number {
  return fromKey(k).getDay();
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86400000);
}

export function fmtLong(k: string): string {
  const d = fromKey(k);
  return `${DAY_NAME[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`;
}

export function fmtShort(k: string): string {
  const d = fromKey(k);
  return `${d.getDate()} ${MONTH[d.getMonth()]}`;
}

export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function fmtMinutes(sec: number): string {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
