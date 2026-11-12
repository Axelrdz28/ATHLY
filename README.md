# ATHLY

Rutina de gym planificada alrededor del running: qué toca hoy, modo entrenamiento con cronómetro de series y descansos, peso sugerido, récords personales y progreso.

**App:** https://axelrdz28.github.io/ATHLY/

## Instalar en el celular (Android)
1. Abre el enlace en Chrome.
2. Menú ⋮ → **Instalar app** (o "Agregar a la pantalla principal").
3. Se abre como una app normal y funciona sin señal.

Los datos (series, running, récords) se guardan **solo en el celular**. Usa *Perfil → Descargar respaldo* de vez en cuando.

## Desarrollo
```bash
npm install
npm run dev      # servidor local
npm run build    # compilación de producción
```
Cada push a `main` se publica automáticamente en GitHub Pages (`.github/workflows/deploy.yml`).

## Estructura
- `src/data/` — catálogo de ejercicios (técnica, alternativas, progresión) y programa por bloques.
- `src/lib/` — planificación (bloques, descarga, cuestas/fartlek), progreso (sugerencias, PRs, tiempos), check-in y almacenamiento.
- `src/anim/` — animaciones propias en SVG generadas con código.
- `src/screens/` — Hoy, Semana, Progreso, Perfil y modo entrenamiento.

Pendientes y fases siguientes: [ROADMAP.md](ROADMAP.md).
