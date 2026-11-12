import { useMemo, useState } from 'react';
import { EXERCISES, getEx } from '../data/exercises';
import { SESSIONS } from '../data/program';
import { useStore } from '../lib/store';
import { computePRs, e1rm, fmtKg, timing } from '../lib/progress';
import { fmtClock, fmtLong, fmtMinutes, fmtShort } from '../lib/dates';
import { Icon } from '../components/Icon';
import { Header, type UI } from './Home';

type View = 'records' | 'ex' | 'time';

export function Progress({ ui }: { ui: UI }) {
  const [view, setView] = useState<View>('records');
  return (
    <div className="app">
      <Header ui={ui} />
      <h1>Progreso</h1>
      <div className="seg-ctl">
        <button type="button" className={view === 'records' ? 'on' : ''} onClick={() => setView('records')}>Récords</button>
        <button type="button" className={view === 'ex' ? 'on' : ''} onClick={() => setView('ex')}>Ejercicios</button>
        <button type="button" className={view === 'time' ? 'on' : ''} onClick={() => setView('time')}>Tiempos</button>
      </div>
      {view === 'records' && <Records ui={ui} />}
      {view === 'ex' && <ExProgress ui={ui} />}
      {view === 'time' && <Times ui={ui} />}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="empty"><Icon n="chart" />{text}</div>;
}

function Records({ ui }: { ui: UI }) {
  const s = useStore();
  const prs = useMemo(() => computePRs(s.workouts).reverse(), [s.workouts]);
  if (!prs.length) return <Empty text="Tus récords aparecerán aquí, marcados en el día que los hiciste. Se cuentan a partir de la segunda vez que haces un ejercicio." />;
  const byDay: Record<string, typeof prs> = {};
  prs.forEach((p) => (byDay[p.date] ??= []).push(p));
  return (
    <div className="feed">
      {Object.entries(byDay).map(([d, list]) => (
        <div className="feed-day" key={d}>
          <span className="lbl">{fmtLong(d)} · {list.length} PR</span>
          {list.map((p, i) => (
            <button type="button" className="pr" key={i} onClick={() => ui.openSummary(p.workoutId)} style={{ textAlign: 'left', color: 'inherit', cursor: 'pointer' }}>
              <span className="ic"><Icon n="trophy" /></span>
              <div><b>PR · {getEx(p.exId).name}</b><span>{p.kind === 'peso' ? 'Peso máximo' : p.kind === '1RM' ? 'Fuerza estimada' : 'Más repeticiones'} · {p.label}</span></div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function ExProgress({ ui }: { ui: UI }) {
  const s = useStore();
  const ids = useMemo(() => [...new Set(s.workouts.flatMap((w) => w.sets.map((x) => x.exId)))], [s.workouts]);
  const [sel, setSel] = useState<string | null>(null);
  if (!ids.length) return <Empty text="Cuando registres series, aquí verás la gráfica de cada ejercicio." />;
  const cur = sel && ids.includes(sel) ? sel : ids[0];
  const ex = getEx(cur);
  const points = s.workouts
    .map((w) => {
      const sets = w.sets.filter((x) => x.exId === cur && x.reps);
      if (!sets.length) return null;
      const weighted = sets.some((x) => (x.weight ?? 0) > 0);
      const v = weighted ? Math.max(...sets.map((x) => e1rm(x.weight ?? 0, x.reps ?? 0))) : Math.max(...sets.map((x) => x.reps ?? 0));
      return { date: w.date, v, weighted, sets };
    })
    .filter(Boolean) as { date: string; v: number; weighted: boolean; sets: { weight: number | null; reps: number | null }[] }[];
  const weighted = points.some((p) => p.weighted);
  return (
    <>
      <label className="field">Ejercicio
        <select id="prog-ex" value={cur} onChange={(e) => setSel(e.target.value)}>
          {ids.sort((a, b) => EXERCISES[a].name.localeCompare(EXERCISES[b].name)).map((id) => <option key={id} value={id}>{EXERCISES[id].name}</option>)}
        </select>
      </label>
      <div className="card">
        <span className="lbl">{weighted ? '1RM estimado (kg)' : `Mejor serie (${ex.unit === 's' ? 's' : ex.unit === 'm' ? 'm' : 'reps'})`}</span>
        <LineChart pts={points.map((p) => ({ x: p.date, y: weighted ? Math.round(p.v * 2) / 2 : p.v }))} />
        <span className="muted small">El 1RM estimado combina peso y reps (fórmula de Epley), así una serie de 80×8 se compara con una de 85×5.</span>
      </div>
      <div className="card">
        <span className="lbl">Sesiones</span>
        {points.slice().reverse().map((p, i) => (
          <div key={i} className="small" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <span className="muted">{fmtShort(p.date)}</span>
            <span className="num">{p.sets.map((x) => (x.weight ? `${fmtKg(x.weight)}×${x.reps}` : `${x.reps}`)).join(' · ')}</span>
          </div>
        ))}
      </div>
      <button className="btn" type="button" onClick={() => ui.openEx(cur)}>Ver técnica de {ex.name}</button>
    </>
  );
}

function LineChart({ pts }: { pts: { x: string; y: number }[] }) {
  if (pts.length < 2) return <div className="muted small">Necesitas al menos dos sesiones para ver la tendencia.</div>;
  const W = 320, H = 150, pl = 34, pr = 10, pt = 10, pb = 22;
  const ys = pts.map((p) => p.y);
  let lo = Math.min(...ys), hi = Math.max(...ys);
  if (hi - lo < 1) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.15;
  lo = Math.floor(lo - pad); hi = Math.ceil(hi + pad);
  const X = (i: number) => pl + (i / (pts.length - 1)) * (W - pl - pr);
  const Y = (v: number) => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Progreso del ejercicio">
      {ticks.map((t) => (
        <g key={t}><line className="gl" x1={pl} x2={W - pr} y1={Y(t)} y2={Y(t)} /><text x={pl - 6} y={Y(t) + 3} textAnchor="end">{t}</text></g>
      ))}
      <path className="ar" d={`${d} L${X(pts.length - 1)} ${H - pb} L${X(0)} ${H - pb} Z`} />
      <path className="ln" d={d} />
      {pts.map((p, i) => <circle key={i} className="pt" cx={X(i)} cy={Y(p.y)} r={i === pts.length - 1 ? 4.5 : 2.5} />)}
      <text x={X(0)} y={H - 6} textAnchor="start">{fmtShort(pts[0].x)}</text>
      <text x={X(pts.length - 1)} y={H - 6} textAnchor="end">{fmtShort(pts[pts.length - 1].x)}</text>
    </svg>
  );
}

function Times({ ui }: { ui: UI }) {
  const s = useStore();
  const list = s.workouts.filter((w) => w.endedAt).slice(-12).reverse();
  if (!list.length) return <Empty text="Aquí verás cuánto tiempo pasas en series y cuánto descansando en cada sesión." />;
  const all = list.map(timing);
  const avgRest = all.reduce((a, t) => a + t.avgRest, 0) / all.length;
  const avgSet = all.reduce((a, t) => a + t.avgSet, 0) / all.length;
  return (
    <>
      <div className="stats">
        <div className="stat"><b>{fmtClock(avgSet)}</b><small>serie media</small></div>
        <div className="stat"><b>{fmtClock(avgRest)}</b><small>descanso medio</small></div>
        <div className="stat"><b>{fmtMinutes(all.reduce((a, t) => a + t.total, 0) / all.length)}</b><small>sesión media</small></div>
      </div>
      <div className="legend"><span><i style={{ background: 'var(--accent)' }} />En series</span><span><i style={{ background: 'var(--line-strong)' }} />Descanso</span></div>
      {list.map((w, i) => {
        const t = all[i];
        const pct = t.work + t.rest > 0 ? (t.work / (t.work + t.rest)) * 100 : 0;
        return (
          <button type="button" key={w.id} className="card" onClick={() => ui.openSummary(w.id)} style={{ textAlign: 'left', color: 'inherit', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <b>{SESSIONS[w.sessionId].name}</b><span className="muted small">{fmtShort(w.date)} · {fmtMinutes(t.total)}</span>
            </div>
            <div className="tbar"><i className="w" style={{ width: `${pct}%` }} /><i className="r" style={{ width: `${100 - pct}%` }} /></div>
            <span className="muted small num">Series {fmtClock(t.work)} · descanso {fmtClock(t.rest)} · descanso medio {fmtClock(t.avgRest)}</span>
          </button>
        );
      })}
    </>
  );
}
