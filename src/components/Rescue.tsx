import { Component, type ReactNode } from 'react';

const KEY = 'athly:v1';

function downloadBackup() {
  try {
    const raw = localStorage.getItem(KEY) ?? '{}';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    a.download = `athly-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  } catch {
    /* sin almacenamiento */
  }
}

function closeActiveWorkout() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    s.active = null;
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* datos ilegibles: no tocar */
  }
  location.reload();
}

/** Si algo falla al dibujar la app, muestra opciones de rescate en vez de una pantalla en blanco */
export class Rescue extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="app" style={{ justifyContent: 'center', minHeight: '100dvh' }}>
        <span className="logo">ATH<b>L</b>Y</span>
        <h1>Algo falló al abrir la app</h1>
        <p className="muted" style={{ margin: 0 }}>Tus datos siguen guardados en este celular. Prueba en este orden:</p>
        <button className="btn primary big" type="button" onClick={() => location.reload()}>1. Reintentar</button>
        <button className="btn big" type="button" onClick={closeActiveWorkout}>2. Cerrar el entrenamiento en curso y reintentar</button>
        <button className="btn big" type="button" onClick={downloadBackup}>Descargar mis datos (respaldo)</button>
        <div className="note" style={{ marginTop: 6 }}>
          <b>Detalle del error</b> (mándale una captura de esto a quien te ayuda con la app):
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: '6px 0 0' }}>{String(this.state.error?.message ?? this.state.error)}</pre>
        </div>
      </div>
    );
  }
}
