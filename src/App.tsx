import { useCallback, useEffect, useState } from 'react';
import type { Prescription, SessionId } from './data/types';
import { SESSIONS } from './data/program';
import { setState, uid, useStore } from './lib/store';
import { dayPlan, sessionItems } from './lib/plan';
import { Home, type Tab, type UI } from './screens/Home';
import { Week } from './screens/Week';
import { Progress } from './screens/Progress';
import { Profile } from './screens/Profile';
import { Workout } from './screens/Workout';
import { ExerciseSheet } from './components/ExerciseSheet';
import { RunLogSheet, RunPlanSheet } from './components/RunSheet';
import { CheckinSheet } from './components/CheckinSheet';
import { SummarySheet } from './components/SummarySheet';
import { Icon } from './components/Icon';

type Overlay =
  | { k: 'ex'; exId: string; p?: Prescription }
  | { k: 'runlog'; date: string }
  | { k: 'runplan'; date: string }
  | { k: 'checkin'; date: string; sessionId: SessionId }
  | { k: 'summary'; id: string }
  | null;

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'hoy', label: 'Hoy', icon: 'home' },
  { id: 'semana', label: 'Semana', icon: 'cal' },
  { id: 'progreso', label: 'Progreso', icon: 'chart' },
  { id: 'perfil', label: 'Perfil', icon: 'user' },
];

export function App() {
  const s = useStore();
  const [tab, setTab] = useState<Tab>('hoy');
  const [inWorkout, setInWorkout] = useState(!!s.active);
  const [ov, setOv] = useState<Overlay>(null);
  const close = useCallback(() => setOv(null), []);

  useEffect(() => {
    document.documentElement.dataset.theme = s.settings.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    const light = s.settings.theme === 'light' || (s.settings.theme === 'system' && matchMedia('(prefers-color-scheme: light)').matches);
    meta?.setAttribute('content', light ? '#F2F3F5' : '#1B1E22');
  }, [s.settings.theme]);

  useEffect(() => { window.scrollTo(0, 0); }, [tab, inWorkout]);

  const ui: UI = {
    openEx: (exId, p) => setOv({ k: 'ex', exId, p }),
    openRunLog: (date) => setOv({ k: 'runlog', date }),
    openRunPlan: (date) => setOv({ k: 'runplan', date }),
    start: (date, sessionId) => setOv({ k: 'checkin', date, sessionId }),
    openWorkout: () => setInWorkout(true),
    openSummary: (id) => setOv({ k: 'summary', id }),
    goTab: (t) => { setTab(t); setInWorkout(false); },
  };

  const begin = (date: string, sessionId: SessionId, adjust: 'normal' | 'reduced', readiness: { legs: number; sleep: number; energy: number }) => {
    const items = sessionItems(sessionId, date, s, adjust);
    if (!items.length) return;
    setState((st) => ({
      ...st,
      active: { id: uid(), date, sessionId, startedAt: Date.now(), adjust, readiness, choices: {}, sets: [], live: { item: 0, phase: 'idle', since: Date.now() } },
    }));
    setOv(null);
    setInWorkout(true);
  };

  return (
    <>
      {inWorkout && s.active ? (
        <Workout
          onExit={() => setInWorkout(false)}
          onFinished={(id) => { setInWorkout(false); setTab('hoy'); setOv({ k: 'summary', id }); }}
          openEx={ui.openEx}
        />
      ) : (
        <>
          {tab === 'hoy' && <Home ui={ui} />}
          {tab === 'semana' && <Week ui={ui} />}
          {tab === 'progreso' && <Progress ui={ui} />}
          {tab === 'perfil' && <Profile ui={ui} />}
          <nav className="nav" aria-label="Secciones">
            <div className="nav-in">
              {TABS.map((t) => (
                <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
                  <Icon n={t.icon} />{t.label}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}

      {ov?.k === 'ex' && <ExerciseSheet exId={ov.exId} presc={ov.p} onClose={close} />}
      {ov?.k === 'runlog' && <RunLogSheet date={ov.date} plan={dayPlan(ov.date, s).run} onClose={close} />}
      {ov?.k === 'runplan' && <RunPlanSheet date={ov.date} plan={dayPlan(ov.date, s).run} isCoach={!!s.coach[ov.date]} onClose={close} />}
      {ov?.k === 'checkin' && (
        <CheckinSheet
          sessionName={SESSIONS[ov.sessionId].name}
          legDay={ov.sessionId === 'legA' || ov.sessionId === 'legB'}
          onStart={(adj, r) => begin(ov.date, ov.sessionId, adj, r)}
          onClose={close}
        />
      )}
      {ov?.k === 'summary' && <SummarySheet workoutId={ov.id} onClose={close} />}
    </>
  );
}
