import { useEffect, useMemo, useRef, useState } from 'react';
import { SESSIONS } from '../data/program';
import { getEx } from '../data/exercises';
import type { Prescription } from '../data/types';
import { setState, useStore, type LiveState, type SetLog, type WorkoutLog } from '../lib/store';
import { sessionItems } from '../lib/plan';
import { fmtKg, lastSets, suggest } from '../lib/progress';
import { fmtClock, fmtShort } from '../lib/dates';
import { Icon } from '../components/Icon';

type Draft = { weight: string; reps: string };

const upd = (fn: (w: WorkoutLog) => WorkoutLog) => setState((st) => (st.active ? { ...st, active: fn(st.active) } : st));
const num = (x: string) => {
  const n = Number(x.replace(',', '.'));
  return x.trim() === '' || !Number.isFinite(n) ? null : n;
};
const repsLabel = (p: Prescription) => (p.reps[0] === p.reps[1] ? `${p.reps[0]}` : `${p.reps[0]}-${p.reps[1]}`);

export function Workout({ onExit, onFinished, openEx }: {
  onExit: () => void;
  onFinished: (id: string) => void;
  openEx: (exId: string, p?: Prescription) => void;
}) {
  const s = useStore();
  const w = s.active!;
  const items = useMemo(() => sessionItems(w.sessionId, w.date, s, w.adjust), [w.sessionId, w.date, w.adjust, s.settings]);
  const live: LiveState = w.live ?? { item: 0, phase: 'idle', since: w.startedAt };
  const [now, setNow] = useState(Date.now());
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [confirm, setConfirm] = useState(false);
  const buzzed = useRef<number>(0);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  // Pantalla siempre encendida mientras entrenas (si el navegador lo permite)
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const req = async () => {
      try { lock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request('screen') ?? null; } catch { /* no disponible */ }
    };
    req();
    const vis = () => document.visibilityState === 'visible' && req();
    document.addEventListener('visibilitychange', vis);
    return () => { document.removeEventListener('visibilitychange', vis); lock?.release().catch(() => {}); };
  }, []);

  const exOf = (i: number) => w.choices[i] ?? items[i].ex;
  const setsOf = (i: number) => w.sets.filter((x) => x.item === i);
  const isDone = (i: number) => setsOf(i).length >= items[i].sets;
  const cur = Math.min(live.item, items.length - 1);
  const curP = items[cur];
  const curEx = getEx(exOf(cur));
  const curSets = setsOf(cur);
  const nextIdx = (() => {
    for (let k = 1; k <= items.length; k++) { const j = (cur + k) % items.length; if (!isDone(j)) return j; }
    return -1;
  })();

  // Valores sugeridos para la siguiente serie
  const draftFor = (i: number): Draft => {
    if (drafts[i]) return drafts[i];
    const sets = setsOf(i);
    const lastHere = sets[sets.length - 1];
    if (lastHere) return { weight: lastHere.weight != null ? String(lastHere.weight) : '', reps: lastHere.reps != null ? String(lastHere.reps) : '' };
    const sg = suggest(exOf(i), items[i], s.workouts, w.id);
    return { weight: sg.weight != null ? String(sg.weight) : '', reps: String(sg.reps) };
  };
  const setDraft = (i: number, d: Partial<Draft>) => setDrafts((x) => ({ ...x, [i]: { ...draftFor(i), ...d } }));

  const elapsed = (now - live.since) / 1000;
  const restLeft = (live.restFor ?? 0) - elapsed;

  // Vibra al terminar el descanso
  useEffect(() => {
    if (live.phase === 'rest' && restLeft <= 0 && buzzed.current !== live.since) {
      buzzed.current = live.since;
      try { navigator.vibrate?.([300, 120, 300]); } catch { /* sin vibración */ }
    }
  }, [live.phase, restLeft, live.since]);

  const startSet = () => {
    const t = Date.now();
    upd((x) => ({ ...x, live: { item: cur, phase: 'set', since: t, pendingRest: live.phase === 'rest' ? (t - live.since) / 1000 : undefined } }));
  };
  const endSet = () => {
    const t = Date.now();
    const d = draftFor(cur);
    const log: SetLog = {
      exId: exOf(cur), item: cur, set: curSets.length + 1,
      weight: num(d.weight), reps: num(d.reps) ?? curP.reps[0],
      startedAt: live.since, endedAt: t, restSec: live.pendingRest,
    };
    upd((x) => ({ ...x, sets: [...x.sets, log], live: { item: cur, phase: 'rest', since: t, restFor: curP.rest } }));
    setDrafts((x) => ({ ...x, [cur]: { weight: d.weight, reps: d.reps } }));
    try { navigator.vibrate?.(60); } catch { /* sin vibración */ }
  };
  const goTo = (i: number) => {
    if (live.phase === 'set') return;
    upd((x) => ({ ...x, live: { ...live, item: i } }));
  };
  const choose = (i: number, exId: string) => {
    upd((x) => ({ ...x, choices: { ...x.choices, [i]: exId } }));
    setDrafts((d) => { const n = { ...d }; delete n[i]; return n; });
  };
  const editSet = (idx: number, field: 'weight' | 'reps', v: string) => {
    upd((x) => ({ ...x, sets: x.sets.map((st, k) => (k === idx ? { ...st, [field]: num(v) } : st)) }));
  };
  const finish = () => {
    const t = Date.now();
    const done: WorkoutLog = { ...w, endedAt: t, live: undefined };
    setState((st) => ({ ...st, workouts: [...st.workouts, done].sort((a, b) => a.startedAt - b.startedAt), active: null }));
    onFinished(done.id);
  };
  const discard = () => setState((st) => ({ ...st, active: null }));

  const totalSets = items.reduce((a, p) => a + p.sets, 0);
  const unitOf = (id: string) => { const u = getEx(id).unit; return u === 's' ? 'seg' : u === 'm' ? 'm' : 'reps'; };

  return (
    <>
      <div className="app" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 190px)' }}>
        <div className="wtop">
          <button className="iconbtn" type="button" onClick={onExit} aria-label="Volver al inicio"><Icon n="back" /></button>
          <div className="title">
            <span className="lbl">{w.adjust === 'reduced' ? 'Versión reducida' : 'En curso'} · {fmtClock((now - w.startedAt) / 1000)}</span>
            <b>{SESSIONS[w.sessionId].name}</b>
          </div>
          <button className="btn sm" type="button" onClick={() => setConfirm((c) => !c)}>Terminar</button>
        </div>

        {confirm && (
          <div className="card">
            <b>¿Terminar el entrenamiento?</b>
            <span className="muted small">Llevas {w.sets.length} de {totalSets} series.</span>
            <div className="grid2">
              <button className="btn primary" type="button" onClick={finish} disabled={w.sets.length === 0}>Guardar y terminar</button>
              <button className="btn" type="button" onClick={() => setConfirm(false)}>Seguir</button>
            </div>
            <button className="linkbtn" type="button" style={{ color: 'var(--bad)' }} onClick={discard}>Descartar sin guardar</button>
          </div>
        )}

        <div className="ring" aria-label="Progreso de la sesión"><i style={{ width: `${(w.sets.length / Math.max(1, totalSets)) * 100}%` }} /></div>

        {items.map((p, i) => {
          const exId = exOf(i);
          const ex = getEx(exId);
          const sets = setsOf(i);
          const open = i === cur;
          const base = getEx(p.ex);
          const family = [base.id, ...(base.alts ?? [])];
          const unit = unitOf(exId);
          return (
            <div key={i} className={`exitem ${open ? 'cur' : ''} ${isDone(i) ? 'done' : ''}`}>
              <button type="button" className="exhead" onClick={() => goTo(i)}>
                <span className="n">{isDone(i) ? <Icon n="check" size={18} /> : i + 1}</span>
                <span style={{ minWidth: 0 }}>
                  <span className="nm" style={{ display: 'block' }}>{ex.name}</span>
                  <span className="sub">{p.sets} × {repsLabel(p)} {unit !== 'reps' ? unit : ''}{p.rpe ? ` · RPE ${p.rpe}` : ''}{p.note ? ` · ${p.note}` : ''}</span>
                </span>
                <span className="pill num">{sets.length}/{p.sets}</span>
              </button>
              {open && (
                <div className="exbody">
                  {family.length > 1 && (
                    <div className="seg-ctl">
                      {family.map((fid, k) => (
                        <button key={fid} type="button" className={fid === exId ? 'on' : ''} onClick={() => choose(i, fid)}>
                          {k === 0 ? 'Principal' : getEx(fid).name}
                        </button>
                      ))}
                    </div>
                  )}
                  <Hint exId={exId} p={p} workoutId={w.id} />
                  <div className="sets">
                    <div className="sethead"><span>Serie</span><span>{ex.bodyweight ? 'kg extra' : 'kg'}</span><span>{unit}</span><span>tiempo</span></div>
                    {Array.from({ length: p.sets }, (_, k) => {
                      const done = sets[k];
                      if (done) {
                        const idx = w.sets.indexOf(done);
                        return (
                          <div className="setrow done" key={k}>
                            <span className="k">{k + 1}</span>
                            <input id={`w-${i}-${k}`} inputMode="decimal" value={done.weight ?? ''} placeholder="—" onChange={(e) => editSet(idx, 'weight', e.target.value)} aria-label={`Peso serie ${k + 1}`} />
                            <input id={`r-${i}-${k}`} inputMode="numeric" value={done.reps ?? ''} onChange={(e) => editSet(idx, 'reps', e.target.value)} aria-label={`Reps serie ${k + 1}`} />
                            <span className="tm">{fmtClock((done.endedAt - done.startedAt) / 1000)}{done.restSec != null ? <><br />↺ {fmtClock(done.restSec)}</> : null}</span>
                          </div>
                        );
                      }
                      if (k === sets.length) {
                        const d = draftFor(i);
                        return (
                          <div className="setrow next" key={k}>
                            <span className="k" style={{ color: 'var(--accent-ink)' }}>{k + 1}</span>
                            <input id={`dw-${i}`} inputMode="decimal" value={d.weight} placeholder={ex.bodyweight ? '—' : 'kg'} onChange={(e) => setDraft(i, { weight: e.target.value })} aria-label="Peso siguiente serie" />
                            <input id={`dr-${i}`} inputMode="numeric" value={d.reps} onChange={(e) => setDraft(i, { reps: e.target.value })} aria-label="Reps siguiente serie" />
                            <span className="tm">{live.phase === 'set' && open ? <b className="acc">en curso</b> : 'siguiente'}</span>
                          </div>
                        );
                      }
                      return (
                        <div className="setrow" key={k} style={{ opacity: 0.45 }}>
                          <span className="k">{k + 1}</span><span className="muted small" style={{ textAlign: 'center' }}>—</span><span className="muted small" style={{ textAlign: 'center' }}>{repsLabel(p)}</span><span />
                        </div>
                      );
                    })}
                  </div>
                  <button className="linkbtn" type="button" onClick={() => openEx(exId, p)} style={{ alignSelf: 'flex-start' }}>Ver técnica y animación ›</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="dock">
        <div className="dock-in">
          {live.phase === 'set' && (
            <>
              <div className="clock">
                <span className="big">{fmtClock(elapsed)}</span>
                <span className="what">Serie {curSets.length + 1} de {curP.sets}<br /><b>{curEx.name}</b></span>
              </div>
              <button className="btn primary big" type="button" onClick={endSet}>Terminé la serie</button>
            </>
          )}
          {live.phase !== 'set' && (
            <>
              {live.phase === 'rest' && (
                <>
                  <div className="clock">
                    <span className={`big ${restLeft < 0 ? 'over' : ''}`}>{restLeft >= 0 ? fmtClock(restLeft) : `+${fmtClock(-restLeft)}`}</span>
                    <span className="what">{restLeft >= 0 ? 'Descansando' : 'Descanso cumplido'}<br />plan {fmtClock(live.restFor ?? 0)}</span>
                  </div>
                  <div className="ring"><i style={{ width: `${Math.min(100, (elapsed / Math.max(1, live.restFor ?? 1)) * 100)}%` }} /></div>
                </>
              )}
              {!isDone(cur) ? (
                <button className="btn primary big" type="button" onClick={startSet}><Icon n="play" /> Iniciar serie {curSets.length + 1} · {curEx.name}</button>
              ) : nextIdx >= 0 ? (
                <button className="btn primary big" type="button" onClick={() => goTo(nextIdx)}>Siguiente: {getEx(exOf(nextIdx)).name}</button>
              ) : (
                <button className="btn good big" type="button" onClick={finish}><Icon n="check" /> Terminar y ver resumen</button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Hint({ exId, p, workoutId }: { exId: string; p: Prescription; workoutId: string }) {
  const s = useStore();
  const sg = suggest(exId, p, s.workouts, workoutId);
  const last = lastSets(exId, s.workouts, workoutId);
  return (
    <div className="hint">
      {last && (
        <div className="small muted" style={{ marginBottom: 3 }}>
          La última vez ({fmtShort(last.date)}): <span className="num">{last.sets.map((x) => (x.weight ? `${fmtKg(x.weight)}×${x.reps}` : `${x.reps}`)).join(' · ')}</span>
        </div>
      )}
      <b>Hoy:</b> {sg.text}
    </div>
  );
}
