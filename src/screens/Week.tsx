import { useState } from 'react';
import { useStore } from '../lib/store';
import { addDays, fmtShort, mondayOf, todayKey, weekDays } from '../lib/dates';
import { weekInfo, weekNote } from '../lib/plan';
import { BLOCKS } from '../data/program';
import { DayCard, Header, type UI } from './Home';

export function Week({ ui }: { ui: UI }) {
  const s = useStore();
  const [mon, setMon] = useState(mondayOf(todayKey()));
  const days = weekDays(mon);
  const wi = weekInfo(mon, s);
  const note = weekNote(wi);
  const block = BLOCKS[wi.block - 1];
  return (
    <div className="app">
      <Header ui={ui} />
      <div className="top">
        <button className="iconbtn" type="button" onClick={() => setMon(addDays(mon, -7))} aria-label="Semana anterior">‹</button>
        <div style={{ textAlign: 'center' }}>
          <h2>Semana {wi.index + 1}</h2>
          <div className="muted small">{fmtShort(days[0])} – {fmtShort(days[6])}</div>
        </div>
        <button className="iconbtn" type="button" onClick={() => setMon(addDays(mon, 7))} aria-label="Semana siguiente">›</button>
      </div>
      <div className="card">
        <span className="lbl">Bloque {wi.block} · {block.name} · semana {wi.weekInBlock} de 4</span>
        <span className="small">{block.focus}. Jueves de <b>{wi.thursday === 'hills' ? 'cuestas' : 'fartlek'}</b>.</span>
        {note && <div className="banner">{note}</div>}
        <span className="muted small">Toca el lápiz de cualquier día para capturar el plan de tu coach.</span>
      </div>
      {days.map((d) => <DayCard key={d} date={d} ui={ui} />)}
    </div>
  );
}
