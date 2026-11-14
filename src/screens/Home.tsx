import { useState } from 'react';
import { SESSIONS } from '../data/program';
import { getEx } from '../data/exercises';
import type { Prescription, SessionId } from '../data/types';
import { setState, useStore, type State } from '../lib/store';
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
        <span className="streak" title="Semanas seguidas cumplidas"><Icon n="flame" size={13} /> {streak}</span>
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
  const [showNote, setShowNote] = useState(false);
  const wi = weekInfo(today, s);
  const plan = dayPlan(today, s);
  const note = weekNote(wi);
  const run = s.runs[today];
  const gymDone = gymDoneOn(s, today);
  const active = s.active;
  const isRest = plan.run.type === 'rest';

  // Resumen semanal
  const mon = mondayOf(today);
  const kmDone = days.reduce((a, d) => a + (s.runs[d]?.km ?? 0), 0);
  const gymPlanned = days.filter((d) => dayPlan(d, s).gym).length;
  const gymCount = s.workouts.filter((w) => w.endedAt && mondayOf(w.date) === mon).length;
  const prsWeek = computePRs(s.workouts).filter((p) => mondayOf(p.date) === mon).length;

  // Protagonista del día: la sesión de gym; si no hay, el running
  const heroTitle = plan.gym ? SESSIONS[plan.gym].name : plan.run.title;
  const heroSub = plan.gym
    ? `${sessionItems(plan.gym, today, s).length} ejercicios · ~${SESSIONS[plan.gym].minutes} min · ${SESSIONS[plan.gym].focus.toLowerCase()}`
    : isRest ? 'Recupera: el músculo crece cuando descansas' : [plan.run.detail, runText(plan.run.km)].filter(Boolean).join(' · ');

  let cta: JSX.Element;
  if (active) {
    cta = <button className="btn primary big" type="button" onClick={ui.openWorkout}><Icon n="play" /> Continuar entrenamiento</button>;
  } else if (plan.gym && !gymDone) {
    cta = <button className="btn primary big" type="button" onClick={() => ui.start(today, plan.gym!)}><Icon n="play" /> Empezar</button>;
  } else if (gymDone) {
    cta = <button className="btn big" type="button" onClick={() => ui.openSummary(gymDone.id)}><Icon n="check" /> Completada · ver resumen</button>;
  } else if (!isRest && !run) {
    cta = <button className="btn primary big" type="button" onClick={() => ui.openRunLog(today)}><Icon n="run" /> Registrar running</button>;
  } else if (!isRest && run) {
    cta = <button className="btn big" type="button" onClick={() => ui.openRunLog(today)}><Icon n="check" /> Running registrado · {run.km ? `${run.km} km` : 'ver'}</button>;
  } else {
    cta = <div className="muted small" style={{ textAlign: 'center' }}>Disfruta el descanso. Mañana seguimos.</div>;
  }

  return (
    <div className="app">
      <Header ui={ui} />
      <div className="date">
        <b>{fmtLong(today)}</b> · Bloque {wi.block} · Sem {wi.weekInBlock}
        {note && (
          <button type="button" className="info" onClick={() => setShowNote((x) => !x)} aria-expanded={showNote} aria-label="Sobre esta semana">
            <Icon n="info" />
          </button>
        )}
      </div>
      {note && showNote && <div className="note">{note}</div>}

      <section className="card hero" aria-label="Hoy">
        <span className="lbl">Hoy</span>
        <div>
          <div className="hero-title">{heroTitle}</div>
          <div className="muted small">{heroSub}</div>
        </div>
        {cta}
        {plan.gym && !isRest && (
          <div className="hero-run"><RunRow date={today} ui={ui} /></div>
        )}
      </section>

      <div>
        <div className="week" role="tablist" aria-label="Semana">
          {days.map((d) => {
            const st = dayStatus(s, d);
            return (
              <button key={d} type="button" role="tab" aria-selected={d === sel} className={`d ${d === today ? 'now' : ''} ${d === sel ? 'sel' : ''}`} onClick={() => setSel(d)}>
                <span className="dl">{DAY_SHORT[dow(d)]}</span>
                <span className={`dot ${st}`} aria-label={STATUS_LABEL[st]} />
              </button>
            );
          })}
        </div>
        <div className="week-legend"><span><i className="dot done" />Hecho</span><span><i className="dot part" />Parcial</span><span><i className="dot todo" />Pendiente</span><span><i className="dot rest" />Descanso</span></div>
      </div>

      <DayCard date={sel} ui={ui} key={sel} />

      <button type="button" className="card weekline" onClick={() => ui.goTab('progreso')}>
        <span><b className="num">{Math.round(kmDone)}</b><small> km semana</small></span>
        <span><b className="num">{gymCount}/{gymPlanned}</b><small> gym</small></span>
        <span><b className="num">{prsWeek}</b><small> PR</small></span>
      </button>
    </div>
  );
}

/** Fila de running: casilla para marcar hecho, toque para registrar km reales, lápiz para editar el plan */
export function RunRow({ date, ui, editPlan = false }: { date: string; ui: UI; editPlan?: boolean }) {
  const s = useStore();
  const p = dayPlan(date, s);
  const run = s.runs[date];
  const isRest = p.run.type === 'rest';
  const canLog = !isRest && date <= todayKey();
  const planText = [p.run.detail, runText(p.run.km)].filter(Boolean).join(' · ');
  const doneText = run ? [run.km ? `${run.km} km` : 'Hecho', run.minutes ? `${run.minutes} min` : ''].filter(Boolean).join(' · ') : '';
  const toggle = () => {
    if (!run) setState((st) => ({ ...st, runs: { ...st.runs, [date]: { date, type: p.run.type } } }));
    else if (run.km == null && run.minutes == null && !run.notes) setState((st) => { const runs = { ...st.runs }; delete runs[date]; return { ...st, runs }; });
    else ui.openRunLog(date);
  };
  return (
    <div className="runrow">
      {canLog ? (
        <button type="button" className={`check ${run ? 'on' : ''}`} onClick={toggle} aria-pressed={!!run} aria-label={run ? 'Running hecho' : 'Marcar running como hecho'}>
          {run && <Icon n="check" />}
        </button>
      ) : (
        <span className="rr-ic"><Icon n={isRest ? 'moon' : 'run'} /></span>
      )}
      <button type="button" className="rr-main" onClick={() => (canLog ? ui.openRunLog(date) : ui.openRunPlan(date))} disabled={isRest && !editPlan}>
        <span className="rr-t">{p.run.title}{p.runFromCoach && <span className="pill acc" style={{ marginLeft: 6 }}>coach</span>}</span>
        <span className="rr-s">{run ? <><b className="good">{doneText}</b>{planText && <span className="muted"> · plan {planText}</span>}</> : <span className="muted">{planText || (isRest ? 'Sin running' : '—')}</span>}</span>
        {canLog && <span className="rr-hint">{run ? 'Editar km y tiempo ›' : 'Agregar km reales ›'}</span>}
      </button>
      {editPlan && <button type="button" className="iconbtn sm" onClick={() => ui.openRunPlan(date)} aria-label="Editar plan de running"><Icon n="edit" /></button>}
    </div>
  );
}

type DayStatus = 'done' | 'part' | 'todo' | 'rest';
const STATUS_LABEL: Record<DayStatus, string> = { done: 'Hecho', part: 'Parcial', todo: 'Pendiente', rest: 'Descanso' };

function dayStatus(s: State, d: string): DayStatus {
  const p = dayPlan(d, s);
  if (!p.gym && p.run.type === 'rest') return 'rest';
  const g = !p.gym || !!gymDoneOn(s, d);
  const r = p.run.type === 'rest' || !!s.runs[d];
  if (g && r) return 'done';
  if ((p.gym && gymDoneOn(s, d)) || s.runs[d]) return 'part';
  return 'todo';
}

export function DayCard({ date, ui, defaultOpen = false, allowStart = false }: { date: string; ui: UI; defaultOpen?: boolean; allowStart?: boolean }) {
  const s = useStore();
  const [open, setOpen] = useState(defaultOpen);
  const p = dayPlan(date, s);
  const today = todayKey();
  const items = p.gym ? sessionItems(p.gym, date, s) : [];
  const done = gymDoneOn(s, date);
  const wi = weekInfo(date, s);
  return (
    <section className="card" aria-label={DAY_NAME[dow(date)]}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <h3>{date === today ? 'Hoy' : DAY_NAME[dow(date)]} <span className="muted small" style={{ fontFamily: 'var(--f-body)', fontWeight: 500 }}>{fmtLong(date).split(' ').slice(1).join(' ')}</span></h3>
        {done && <span className="pill good"><Icon n="check" size={11} /> Gym hecho</span>}
      </div>
      <RunRow date={date} ui={ui} editPlan />
      <div className="dayline">
        <Icon n="lift" />
        {p.gym ? (
          <span className="dl-t">{SESSIONS[p.gym].name}<span className="muted"> · {items.length} ejercicios{p.gym === 'legB' ? (wi.thursday === 'fartlek' ? ' · con pliometría' : ' · sin pliometría') : ''}</span></span>
        ) : (
          <span className="dl-t muted">Sin gym</span>
        )}
        {p.gym && (
          <button type="button" className="linkbtn" onClick={() => setOpen((x) => !x)} aria-expanded={open}>{open ? 'Ocultar' : 'Ver rutina'}</button>
        )}
      </div>
      {open && p.gym && (
        <>
          <div className="exl">
            {items.map((it, i) => (
              <button key={i} type="button" onClick={() => ui.openEx(it.ex, it)}>
                <span>{getEx(it.ex).name}</span>
                <span className="r">{it.sets} × {it.reps[0] === it.reps[1] ? it.reps[0] : `${it.reps[0]}-${it.reps[1]}`}</span>
                <Icon n="chev" />
              </button>
            ))}
          </div>
          {allowStart && !done && !s.active && date !== today && (
            <button className="btn" type="button" onClick={() => ui.start(today, p.gym!)}>Hacer esta sesión hoy</button>
          )}
        </>
      )}
    </section>
  );
}
