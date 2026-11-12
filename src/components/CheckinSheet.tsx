import { useState } from 'react';
import type { Readiness } from '../lib/store';
import { evaluate } from '../lib/readiness';
import { Sheet } from './Sheet';

const Q: { k: keyof Readiness; q: string; lo: string; hi: string }[] = [
  { k: 'legs', q: '¿Cómo están tus piernas?', lo: 'Muy cargadas', hi: 'Frescas' },
  { k: 'sleep', q: '¿Cómo dormiste?', lo: 'Muy mal', hi: 'Muy bien' },
  { k: 'energy', q: '¿Cuánta energía tienes?', lo: 'Nada', hi: 'Mucha' },
];

export function CheckinSheet({ sessionName, legDay, onStart, onClose }: {
  sessionName: string; legDay: boolean;
  onStart: (adjust: 'normal' | 'reduced', r: Readiness) => void; onClose: () => void;
}) {
  const [r, setR] = useState<Partial<Readiness>>({});
  const done = r.legs && r.sleep && r.energy;
  const res = done ? evaluate(r as Readiness, legDay) : null;

  return (
    <Sheet title="Check-in" sub={`Antes de ${sessionName}`} onClose={onClose}>
      <p className="muted small" style={{ margin: 0 }}>10 segundos. Contesta con honestidad: con esto ajusto la sesión de hoy.</p>
      {Q.map((x) => (
        <div key={x.k} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <b>{x.q}</b>
          <div className="scale">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" className={r[x.k] === n ? 'on' : ''} onClick={() => setR({ ...r, [x.k]: n })} aria-label={`${x.q} ${n}`}>{n}</button>
            ))}
          </div>
          <div className="scale-l"><span>{x.lo}</span><span>{x.hi}</span></div>
        </div>
      ))}
      {res && (
        <div className={`banner ${res.level === 'normal' ? 'good' : res.level === 'swap' ? 'bad' : ''}`}>
          <b>{res.title}.</b> {res.text}
        </div>
      )}
      {res?.level === 'normal' && <button className="btn primary big" type="button" onClick={() => onStart('normal', r as Readiness)}>Empezar sesión completa</button>}
      {res && res.level !== 'normal' && (
        <>
          <button className="btn primary big" type="button" onClick={() => onStart('reduced', r as Readiness)}>Hacer versión reducida</button>
          <button className="btn" type="button" onClick={() => onStart('normal', r as Readiness)}>Hacer la sesión completa igual</button>
          {res.level === 'swap' && <button className="btn" type="button" onClick={onClose}>Moverla a otro día</button>}
        </>
      )}
      {!res && <button className="btn big" type="button" disabled>Responde las 3 preguntas</button>}
    </Sheet>
  );
}
