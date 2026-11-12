import { SESSIONS } from '../data/program';
import { getEx } from '../data/exercises';
import { useStore } from '../lib/store';
import { computePRs, fmtKg, timing, volume } from '../lib/progress';
import { fmtClock, fmtLong, fmtMinutes } from '../lib/dates';
import { Sheet } from './Sheet';
import { Icon } from './Icon';

export function SummarySheet({ workoutId, onClose }: { workoutId: string; onClose: () => void }) {
  const s = useStore();
  const w = s.workouts.find((x) => x.id === workoutId);
  if (!w) return null;
  const t = timing(w);
  const prs = computePRs(s.workouts).filter((p) => p.workoutId === w.id);
  const vol = volume(w.sets);
  const exCount = new Set(w.sets.map((x) => x.exId)).size;
  const workPct = t.work + t.rest > 0 ? (t.work / (t.work + t.rest)) * 100 : 0;

  return (
    <Sheet title={SESSIONS[w.sessionId].name} sub={`Resumen · ${fmtLong(w.date)}`} onClose={onClose}>
      {prs.length > 0 && (
        <div className="feed-day">
          <span className="lbl">Récords de hoy</span>
          {prs.map((p, i) => (
            <div className="pr" key={i}>
              <span className="ic"><Icon n="trophy" /></span>
              <div><b>PR · {getEx(p.exId).name}</b><span>{p.label}</span></div>
            </div>
          ))}
        </div>
      )}
      <div className="stats">
        <div className="stat"><b>{fmtMinutes(t.total)}</b><small>duración</small></div>
        <div className="stat"><b>{w.sets.length}</b><small>series · {exCount} ejercicios</small></div>
        <div className="stat"><b>{vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${Math.round(vol)}`}</b><small>volumen (kg)</small></div>
      </div>
      <div className="card">
        <span className="lbl">Tiempo en series vs descanso</span>
        <div className="tbar"><i className="w" style={{ width: `${workPct}%` }} /><i className="r" style={{ width: `${100 - workPct}%` }} /></div>
        <div className="legend"><span><i style={{ background: 'var(--accent)' }} />Series {fmtClock(t.work)}</span><span><i style={{ background: 'var(--line-strong)' }} />Descanso {fmtClock(t.rest)}</span></div>
        <div className="small muted">Serie media <b className="num">{fmtClock(t.avgSet)}</b> · descanso medio <b className="num">{fmtClock(t.avgRest)}</b> · densidad <b className="num">{Math.round(t.density)} kg/min</b></div>
      </div>
      {w.adjust === 'reduced' && <div className="banner">Hiciste la versión reducida tras el check-in. Bien escuchado el cuerpo.</div>}
      <div className="card">
        <span className="lbl">Series</span>
        {[...new Set(w.sets.map((x) => x.exId))].map((id) => {
          const sets = w.sets.filter((x) => x.exId === id);
          const ex = getEx(id);
          return (
            <div key={id} className="small" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span>{ex.name}</span>
              <span className="muted num">{sets.map((x) => (x.weight ? `${fmtKg(x.weight)}×${x.reps}` : `${x.reps}`)).join(' · ')}</span>
            </div>
          );
        })}
      </div>
      <button className="btn primary big" type="button" onClick={onClose}>Listo</button>
    </Sheet>
  );
}
