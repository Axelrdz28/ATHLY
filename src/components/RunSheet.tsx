import { useState } from 'react';
import { RUN_TYPES } from '../data/program';
import type { RunPlan, RunType } from '../data/types';
import { setState, useStore } from '../lib/store';
import { fmtLong } from '../lib/dates';
import { Sheet } from './Sheet';

/** Registrar lo que corriste ese día */
export function RunLogSheet({ date, plan, onClose }: { date: string; plan: RunPlan; onClose: () => void }) {
  const s = useStore();
  const prev = s.runs[date];
  const [type, setType] = useState<RunType>(prev?.type ?? plan.type);
  const [km, setKm] = useState(prev?.km?.toString() ?? '');
  const [min, setMin] = useState(prev?.minutes?.toString() ?? '');
  const [notes, setNotes] = useState(prev?.notes ?? '');
  const pace = Number(km) > 0 && Number(min) > 0 ? Number(min) / Number(km) : 0;

  const save = () => {
    setState((st) => ({ ...st, runs: { ...st.runs, [date]: { date, type, km: Number(km) || undefined, minutes: Number(min) || undefined, notes: notes || undefined } } }));
    onClose();
  };
  const remove = () => {
    setState((st) => { const runs = { ...st.runs }; delete runs[date]; return { ...st, runs }; });
    onClose();
  };

  return (
    <Sheet title="Registrar running" sub={fmtLong(date)} onClose={onClose}>
      <div className="banner">Plan: <b>{plan.title}</b>{plan.detail ? ` · ${plan.detail}` : ''}{plan.km ? ` · ${plan.km[0]}-${plan.km[1]} km` : ''}</div>
      <label className="field">Tipo
        <select id="run-type" value={type} onChange={(e) => setType(e.target.value as RunType)}>
          {Object.entries(RUN_TYPES).filter(([k]) => k !== 'rest').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <div className="grid2">
        <label className="field">Distancia (km)<input id="run-km" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value.replace(',', '.'))} placeholder="10" /></label>
        <label className="field">Tiempo (min)<input id="run-min" inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value.replace(',', '.'))} placeholder="52" /></label>
      </div>
      {pace > 0 && <div className="muted small">Ritmo medio: <b className="num">{Math.floor(pace)}:{String(Math.round((pace % 1) * 60)).padStart(2, '0')} /km</b></div>}
      <label className="field">Notas<textarea id="run-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sensaciones, series, clima…" /></label>
      <button className="btn primary big" type="button" onClick={save}>Guardar</button>
      {prev && <button className="btn danger" type="button" onClick={remove}>Quitar registro</button>}
      <p className="muted small" style={{ margin: 0 }}>La sincronización con Strava llega en la fase 2. Por ahora, captura los datos de tu reloj aquí.</p>
    </Sheet>
  );
}

/** Editar el plan de running de un día (plan de tu coach) */
export function RunPlanSheet({ date, plan, isCoach, onClose }: { date: string; plan: RunPlan; isCoach: boolean; onClose: () => void }) {
  const [type, setType] = useState<RunType>(plan.type);
  const [title, setTitle] = useState(plan.title);
  const [detail, setDetail] = useState(plan.detail ?? '');
  const [k1, setK1] = useState(plan.km?.[0]?.toString() ?? '');
  const [k2, setK2] = useState(plan.km?.[1]?.toString() ?? '');

  const save = () => {
    const km: [number, number] | undefined = Number(k1) > 0 ? [Number(k1), Number(k2) || Number(k1)] : undefined;
    setState((st) => ({ ...st, coach: { ...st.coach, [date]: { type, title: title || RUN_TYPES[type], detail: detail || undefined, km } } }));
    onClose();
  };
  const restore = () => {
    setState((st) => { const coach = { ...st.coach }; delete coach[date]; return { ...st, coach }; });
    onClose();
  };

  return (
    <Sheet title="Plan de running" sub={fmtLong(date)} onClose={onClose}>
      <p className="muted small" style={{ margin: 0 }}>Captura lo que te dejó tu coach para este día. Sustituye al plan base solo en esta fecha.</p>
      <label className="field">Tipo
        <select id="plan-type" value={type} onChange={(e) => { const t = e.target.value as RunType; setType(t); if (!title || Object.values(RUN_TYPES).includes(title)) setTitle(RUN_TYPES[t]); }}>
          {Object.entries(RUN_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label className="field">Título<input id="plan-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Series de 1 km" /></label>
      <label className="field">Indicaciones<textarea id="plan-detail" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="6 × 1 km a ritmo 10K, rec. 2 min trote" /></label>
      <div className="grid2">
        <label className="field">Km mínimo<input id="plan-k1" inputMode="decimal" value={k1} onChange={(e) => setK1(e.target.value.replace(',', '.'))} /></label>
        <label className="field">Km máximo<input id="plan-k2" inputMode="decimal" value={k2} onChange={(e) => setK2(e.target.value.replace(',', '.'))} /></label>
      </div>
      <button className="btn primary big" type="button" onClick={save}>Guardar plan del día</button>
      {isCoach && <button className="btn" type="button" onClick={restore}>Volver al plan base</button>}
    </Sheet>
  );
}
