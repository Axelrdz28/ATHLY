import { useState } from 'react';
import { SESSIONS } from '../data/program';
import { getEx } from '../data/exercises';
import type { Prescription, SessionId } from '../data/types';
import { useStore, type State } from '../lib/store';
import { dayPlan, sessionItems, weekInfo, weekNote } from '../lib/plan';
import { DAY_NAME, DAY_SHORT, dow, fmtLong, mondayOf, todayKey, weekDays } from '../lib/dates';
import { computePRs, streakWeeks } from '../lib/progress';
import { Icon } from '../components/Icon';

export interface UI {
  openEx: (exId: string, p?: Prescription) => void;
  openRunLog: (date: string) => void;
  openRunPlan: (date: string) => void;
  start: (date: string, sessionId: SessionId) => void;
  openWorkout: () => void;
  openSummary: (id: string) => void;
  goTab: (t: Tab) => void;
}
export type Tab = 'hoy' | 'semana' | 'progreso' | 'perfil';

export function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '·';
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase();
}

export function gymDoneOn(s: State, date: string) {
  return s.workouts.find((w) => w.date === date && w.endedAt);
}

export function runText(km?: [number, number]) {
  if (!km) return '';
  return km[0] === km[1] ? `${km[0]} km` : `${km[0]}-${km[1]} km`;
}

export function Header({ ui }: { ui: UI }) {
  const s = useStore();
  const streak = streakWeeks(s);
  return (
    <div className="top">
      <span className="logo">ATH<b>L</b>Y</span>
      <span className="me">
        <span className="streak" title="Semanas seguidas cumplidas"><Icon n="flame" size={13} /> {streak} sem</span>
        <button type="button" className="avatar" onClick={() => ui.goTab('perfil')} aria-label="Perfil">{initials(s.profile.name)}</button>
      </span>
    </div>
  );
}

export function Home({ ui }: { ui: UI }) {
  const s = useStore();
  const today = todayKey();
  const days = weekDays(today);
  const [sel, setSel] = useState(() => {
    const i = days.indexOf(today);
    return i >= 0 && i < 6 ? days[i + 1] : today;
  });
  const wi = weekInfo(today, s);
  const plan = dayPlan(today, s);
  const note = weekNote(wi);
  const run = s.runs[today];
  const gymDone = gymDoneOn(s, today);
  const active = s.active;

  // Resumen semanal
  const mon = mondayOf(today);
  const kmDone = days.reduce((a, d) => a + (s.runs[d]?.km ?? 0), 0);
  const kmPlan = days.reduce((a, d) => a + (dayPlan(d, s).run.km?.[1] ?? 0), 0);
  const gymPlanned = days.filter((d) => dayPlan(d, s).gym).length;
  const gymCount = s.workouts.filter((w) => w.endedAt && mondayOf(w.date) === mon).length;
  const prsWeek = computePRs(s.workouts).filter((p) => mondayOf(p.date) === mon).length;

  let cta: JSX.Element;
  if (active) {
    cta = <button className="btn primary big" type="button" onClick={ui.openWorkout}><Icon n="play" /> Continuar {SESSIONS[active.sessionId].name}</button>;
  } else if (plan.gym && !gymDone) {
    cta = <button className="btn primary big" type="button" onClick={() => ui.start(today, plan.gym!)}><Icon n="play" /> Empezar {SESSIONS[plan.gym].name}</button>;
  } else if (gymDone) {
    cta = <button className="btn big" type="button" onClick={() => ui.openSummary(gymDone.id)}><Icon n="check" /> Sesión completada · ver resumen</button>;
  } else if (plan.run.type !== 'rest' && !run) {
    cta = <button className="btn primary big" type="button" onClick={() => ui.openRunLog(today)}><Icon n="run" /> Registrar running</button>;
  } else {
    cta = <button className="btn big" type="button" disabled><Icon n="moon" /> Día de descanso</button>;
  }

  return (
    <div className="app">
      <Header ui={ui} />
      <div className="date"><b>{fmtLong(today)}</b> · Bloque {wi.block} ({wi.blockName}) · Semana {wi.weekInBlock}</div>
      {note && <div className="banner">{note}</div>}

      <section className="card" aria-label="Hoy">
        <span className="lbl">Hoy</span>
        <div className="row">
          <span className="ic"><Icon n={plan.run.type === 'rest' ? 'moon' : 'run'} /></span>
          <div>
            <div className="t">{plan.run.title}</div>
            <div className="s">{plan.run.type === 'rest' ? 'Recupera: el músculo crece cuando descansas' : [plan.run.detail, runText(plan.run.km)].filter(Boolean).join(' · ')}{plan.runFromCoach && ' · plan del coach'}</div>
          </div>
          {plan.run.type === 'rest' ? null : run ? (
            <button type="button" className="pill good" onClick={() => ui.openRunLog(today)} style={{ border: 0, cursor: 'pointer' }}><Icon n="check" size={11} /> {run.km ? `${run.km} km` : 'Hecho'}</button>
          ) : (
            <button type="button" className="btn sm" onClick={() => ui.openRunLog(today)}>Registrar</button>
          )}
        </div>
        {plan.gym && (
          <div className="row">
            <span className="ic"><Icon n="lift" /></span>
            <div>
              <div className="t">{SESSIONS[plan.gym].name}</div>
              <div className="s">{SESSIONS[plan.gym].focus} · {SESSIONS[plan.gym].minutes} min</div>
            </div>
            {gymDone ? <span className="pill good"><Icon n="check" size={11} /> Hecho</span> : <span className="pill">{sessionItems(plan.gym, today, s).length} ejercicios</span>}
          </div>
        )}
        {cta}
      </section>

      <div className="week" role="tablist" aria-label="Semana">
        {days.map((d) => {
          const p = dayPlan(d, s);
          const g = !p.gym || !!gymDoneOn(s, d);
          const r = p.run.type === 'rest' || !!s.runs[d];
          const rest = !p.gym && p.run.type === 'rest';
          const cls = rest ? 'rest' : g && r ? 'ok' : (p.gym && gymDoneOn(s, d)) || s.runs[d] ? 'part' : '';
          return (
            <button key={d} type="button" role="tab" aria-selected={d === sel} className={`d ${cls} ${d === today ? 'now' : ''} ${d === sel ? 'sel' : ''}`} onClick={() => setSel(d)}>
              {DAY_SHORT[dow(d)]}
              <span className={`dot ${cls === 'ok' || rest ? 'x' : ''}`}>{cls === 'ok' ? <Icon n="check" /> : rest ? '–' : ''}</span>
            </button>
          );
        })}
      </div>

      <DayCard date={sel} ui={ui} />

      <div className="stats">
        <div className="stat"><b>{Math.round(kmDone)}</b><small>de ~{kmPlan || '—'} km plan</small><div className="bar"><i style={{ width: `${kmPlan ? Math.min(100, (kmDone / kmPlan) * 100) : 0}%` }} /></div></div>
        <div className="stat"><b>{gymCount}/{gymPlanned}</b><small>sesiones gym</small><div className="bar"><i style={{ width: `${(gymCount / Math.max(1, gymPlanned)) * 100}%` }} /></div></div>
        <button type="button" className="stat" style={{ textAlign: 'left', cursor: 'pointer', color: 'inherit' }} onClick={() => ui.goTab('progreso')}><b>{prsWeek}</b><small>PRs esta semana</small></button>
      </div>
    </div>
  );
}

export function DayCard({ date, ui }: { date: string; ui: UI }) {
  const s = useStore();
  const p = dayPlan(date, s);
  const today = todayKey();
  const items = p.gym ? sessionItems(p.gym, date, s) : [];
  const done = gymDoneOn(s, date);
  const wi = weekInfo(date, s);
  return (
    <section className="card" aria-label={DAY_NAME[dow(date)]}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <h2>{date === today ? 'Hoy' : DAY_NAME[dow(date)]}</h2>
        <span className="muted small">{fmtLong(date).split(' ').slice(1).join(' ')}</span>
      </div>
      <div className="row">
        <span className="ic"><Icon n={p.run.type === 'rest' ? 'moon' : 'run'} /></span>
        <div>
          <div className="t">{p.run.title}{p.runFromCoach && <span className="pill acc" style={{ marginLeft: 6 }}>coach</span>}</div>
          <div className="s">{[p.run.detail, runText(p.run.km)].filter(Boolean).join(' · ') || '—'}</div>
        </div>
        <button type="button" className="iconbtn" onClick={() => ui.openRunPlan(date)} aria-label="Editar plan de running"><Icon n="edit" /></button>
      </div>
      {p.gym ? (
        <>
          <div className="row">
            <span className="ic"><Icon n="lift" /></span>
            <div>
              <div className="t">{SESSIONS[p.gym].name}</div>
              <div className="s">{SESSIONS[p.gym].focus}{p.gym === 'legB' ? ` · semana de ${wi.thursday === 'fartlek' ? 'fartlek: con pliometría' : 'cuestas: sin pliometría'}` : ''}</div>
            </div>
            {done && <span className="pill good"><Icon n="check" size={11} /> Hecho</span>}
          </div>
          <div className="exl">
            {items.map((it, i) => (
              <button key={i} type="button" onClick={() => ui.openEx(it.ex, it)}>
                <span>{getEx(it.ex).name}</span>
                <span className="r">{it.sets} × {it.reps[0] === it.reps[1] ? it.reps[0] : `${it.reps[0]}-${it.reps[1]}`}</span>
                <Icon n="chev" />
              </button>
            ))}
          </div>
          {!done && !s.active && date !== today && (
            <button className="btn" type="button" onClick={() => ui.start(today, p.gym!)}>Hacer esta sesión hoy</button>
          )}
        </>
      ) : (
        <div className="muted small">Sin gym este día.</div>
      )}
    </section>
  );
}
