import { useState } from 'react';
import { EXERCISES, getEx, progressionText } from '../data/exercises';
import type { Prescription } from '../data/types';
import { Anim } from '../anim/Anim';
import { Sheet } from './Sheet';
import { useStore } from '../lib/store';
import { fmtShort } from '../lib/dates';
import { fmtKg } from '../lib/progress';

/** Busca la alternativa de quién es (para mostrar las del principal) */
function parentOf(id: string): string | null {
  for (const e of Object.values(EXERCISES)) if (e.alts?.includes(id)) return e.id;
  return null;
}

export function ExerciseSheet({ exId, presc, onClose }: { exId: string; presc?: Prescription; onClose: () => void }) {
  const [id, setId] = useState(exId);
  const ex = getEx(id);
  const s = useStore();
  const main = parentOf(id) ? getEx(parentOf(id)!) : ex;
  const family = [main.id, ...(main.alts ?? [])];
  const top = presc ? presc.reps[1] : 10;
  const history = s.workouts
    .map((w) => ({ date: w.date, sets: w.sets.filter((x) => x.exId === id) }))
    .filter((h) => h.sets.length)
    .slice(-5)
    .reverse();
  const unit = ex.unit === 's' ? 's' : ex.unit === 'm' ? 'm' : '';

  return (
    <Sheet title={ex.name} sub={ex.equipment} onClose={onClose}>
      {family.length > 1 && (
        <div className="seg-ctl" role="tablist">
          {family.map((fid, i) => (
            <button key={fid} type="button" className={fid === id ? 'on' : ''} onClick={() => setId(fid)}>
              {i === 0 ? 'Principal' : getEx(fid).name}
            </button>
          ))}
        </div>
      )}
      {presc && (
        <div className="chips">
          <span className="chip acc">{presc.sets} × {presc.reps[0] === presc.reps[1] ? presc.reps[0] : `${presc.reps[0]}-${presc.reps[1]}`}{unit && ` ${unit}`}</span>
          {presc.rpe && <span className="chip">RPE {presc.rpe}</span>}
          <span className="chip">Descanso {presc.rest >= 60 ? `${Math.floor(presc.rest / 60)}:${String(presc.rest % 60).padStart(2, '0')}` : `${presc.rest} s`}</span>
          {presc.tempo && <span className="chip">Tempo {presc.tempo}</span>}
        </div>
      )}
      {ex.anim ? (
        <Anim id={ex.anim} key={id} />
      ) : (
        <div className="placeholder">La animación de este ejercicio está en preparación. Mientras tanto, guíate con los puntos clave.</div>
      )}
      <div className="musc">
        {ex.primary.map((m) => <span key={m}>{m}</span>)}
        {ex.secondary?.map((m) => <span key={m} className="sec">{m}</span>)}
      </div>
      <div className="tech">
        <div className="ok"><span className="lbl">Puntos clave</span><ul>{ex.cues.map((c) => <li key={c}>{c}</li>)}</ul></div>
        <div className="no"><span className="lbl">Errores comunes</span><ul>{ex.errors.map((c) => <li key={c}>{c}</li>)}</ul></div>
      </div>
      <div className="rule">
        <div className="lbl" style={{ marginBottom: 4 }}>Cómo progresar</div>
        {progressionText(ex, top, presc?.rpe)}
      </div>
      {presc?.note && <div className="banner">{presc.note}</div>}
      <div className="card">
        <span className="lbl">Historial</span>
        {history.length === 0 ? (
          <span className="muted small">Aún no has registrado este ejercicio. Cada alternativa guarda su propio historial.</span>
        ) : (
          history.map((h, i) => (
            <div key={i} className="small num" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span className="muted">{fmtShort(h.date)}</span>
              <span>{h.sets.map((x) => (x.weight ? `${fmtKg(x.weight)}×${x.reps}` : `${x.reps}${unit}`)).join(' · ')}</span>
            </div>
          ))
        )}
      </div>
    </Sheet>
  );
}
