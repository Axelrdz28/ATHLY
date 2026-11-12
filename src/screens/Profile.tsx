import { useRef, useState } from 'react';
import { replaceState, resetState, setState, useStore, type State } from '../lib/store';
import { activeWeeks, computePRs, streakWeeks } from '../lib/progress';
import { mondayOf, todayKey } from '../lib/dates';
import { Header, initials, type UI } from './Home';

export function Profile({ ui }: { ui: UI }) {
  const s = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const sessions = s.workouts.filter((w) => w.endedAt).length;
  const km = Object.values(s.runs).reduce((a, r) => a + (r.km ?? 0), 0);
  const prs = computePRs(s.workouts).length;

  const setProfile = (p: Partial<State['profile']>) => setState((st) => ({ ...st, profile: { ...st.profile, ...p } }));
  const setSettings = (p: Partial<State['settings']>) => setState((st) => ({ ...st, settings: { ...st.settings, ...p } }));
  const numOrUndef = (v: string) => (v.trim() === '' ? undefined : Number(v.replace(',', '.')) || undefined);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(s, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `athly-respaldo-${todayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setMsg('Respaldo descargado. Guárdalo en Drive o donde prefieras.');
  };
  const importData = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as State;
      if (data.v !== 1 || !Array.isArray(data.workouts)) throw new Error('formato');
      replaceState(data);
      setMsg(`Respaldo restaurado: ${data.workouts.length} sesiones.`);
    } catch {
      setMsg('Ese archivo no es un respaldo válido de ATHLY.');
    }
  };

  return (
    <div className="app">
      <Header ui={ui} />
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <span className="avatar big">{initials(s.profile.name)}</span>
        <label className="field" style={{ flex: 1 }}>Tu nombre
          <input id="pf-name" value={s.profile.name} onChange={(e) => setProfile({ name: e.target.value })} placeholder="Escribe tu nombre" />
        </label>
      </div>

      <div className="stats">
        <div className="stat"><b>{activeWeeks(s)}</b><small>semanas activas</small></div>
        <div className="stat"><b>{streakWeeks(s)}</b><small>racha (semanas)</small></div>
        <div className="stat"><b>{sessions}</b><small>sesiones gym</small></div>
        <div className="stat"><b>{Math.round(km)}</b><small>km registrados</small></div>
        <div className="stat"><b>{prs}</b><small>récords</small></div>
        <div className="stat"><b>{s.workouts.reduce((a, w) => a + w.sets.length, 0)}</b><small>series totales</small></div>
      </div>
      <p className="muted small" style={{ margin: 0 }}>Una semana cuenta para la racha cuando completas al menos 4 de las 5 sesiones de gym. Tus datos se quedan en este celular: nada se sube a internet.</p>

      <section className="card">
        <span className="lbl">Datos físicos (opcional)</span>
        <div className="grid2">
          <label className="field">Peso (kg)<input id="pf-w" inputMode="decimal" value={s.profile.weightKg ?? ''} onChange={(e) => setProfile({ weightKg: numOrUndef(e.target.value) })} /></label>
          <label className="field">Estatura (cm)<input id="pf-h" inputMode="numeric" value={s.profile.heightCm ?? ''} onChange={(e) => setProfile({ heightCm: numOrUndef(e.target.value) })} /></label>
        </div>
        {s.profile.weightKg ? <span className="muted small">Proteína recomendada para tu volumen: <b className="num">{Math.round(s.profile.weightKg * 1.8)}-{Math.round(s.profile.weightKg * 2)} g/día</b> (1.8-2 g/kg).</span> : null}
      </section>

      <section className="card">
        <span className="lbl">Plan</span>
        <label className="field">Inicio del bloque 1 (lunes de la semana 1)
          <input id="pf-start" type="date" value={s.settings.startDate} onChange={(e) => e.target.value && setSettings({ startDate: mondayOf(e.target.value) })} />
        </label>
        <label className="field">El jueves de la semana 1 toca
          <select id="pf-thu" value={s.settings.thursdayFirst} onChange={(e) => setSettings({ thursdayFirst: e.target.value as 'hills' | 'fartlek' })}>
            <option value="hills">Cuestas</option>
            <option value="fartlek">Fartlek</option>
          </select>
        </label>
        <label className="field">Apariencia
          <select id="pf-theme" value={s.settings.theme} onChange={(e) => setSettings({ theme: e.target.value as State['settings']['theme'] })}>
            <option value="dark">Oscura (Ultra)</option>
            <option value="light">Clara</option>
            <option value="system">Según el sistema</option>
          </select>
        </label>
      </section>

      <section className="card">
        <span className="lbl">Respaldo</span>
        <span className="muted small">Descarga un respaldo de vez en cuando. Si cambias de celular o borras los datos del navegador, lo restauras aquí.</span>
        <div className="grid2">
          <button className="btn" type="button" onClick={exportData}>Descargar respaldo</button>
          <button className="btn" type="button" onClick={() => fileRef.current?.click()}>Restaurar</button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        {msg && <div className="banner">{msg}</div>}
        {!confirmReset ? (
          <button className="linkbtn" type="button" style={{ color: 'var(--bad)', alignSelf: 'flex-start' }} onClick={() => setConfirmReset(true)}>Borrar todos mis datos</button>
        ) : (
          <div className="banner bad">
            <b>¿Seguro?</b> Se borran sesiones, running y récords de este celular.
            <div className="grid2" style={{ marginTop: 8 }}>
              <button className="btn danger" type="button" onClick={() => { resetState(); setConfirmReset(false); }}>Sí, borrar</button>
              <button className="btn" type="button" onClick={() => setConfirmReset(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </section>
      <p className="muted small" style={{ margin: 0, textAlign: 'center' }}>ATHLY v0.1</p>
    </div>
  );
}
