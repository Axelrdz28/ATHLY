import { useEffect, useRef, useState } from 'react';
import type { AnimId } from '../data/types';
import { ANIMS, ease, lerp } from './figures';

const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Anim({ id, compact = false }: { id: AnimId; compact?: boolean }) {
  const def = ANIMS[id];
  const total = def.tl.reduce((s, x) => s + x.d, 0);
  const gRef = useRef<SVGGElement>(null);
  const ghostRef = useRef<SVGGElement>(null);
  const st = useRef({ t: reduceMotion ? def.tl[0].d + def.tl[1].d - 1 : 0, visible: true });
  const [playing, setPlaying] = useState(!reduceMotion);
  const [slow, setSlow] = useState(false);
  const [ghost, setGhost] = useState(true);
  const [idx, setIdx] = useState(0);
  const playRef = useRef(playing);
  playRef.current = playing;
  const slowRef = useRef(slow);
  slowRef.current = slow;

  useEffect(() => {
    const g = gRef.current!;
    let raf = 0;
    let last = performance.now();
    let curIdx = -1;
    const draw = () => {
      const t = ((st.current.t % total) + total) % total;
      let acc = 0, i = 0;
      while (i < def.tl.length - 1 && t >= acc + def.tl[i].d) { acc += def.tl[i].d; i++; }
      const cur = def.tl[i], prev = i === 0 ? cur : def.tl[i - 1];
      const fr = def.render(lerp(prev.p, cur.p, ease(Math.min(1, (t - acc) / cur.d))));
      g.innerHTML = fr.bg + `<g class="ghost">${ghostRef.current?.dataset.on === '1' ? def.render(def.ghost).fig : ''}</g>` + fr.fig + (fr.fg ?? '');
      g.style.opacity = def.fade && playRef.current ? String(Math.max(0, Math.min(1, t / 180, (total - t) / 180))) : '1';
      if (i !== curIdx) { curIdx = i; setIdx(i); }
    };
    const frame = (n: number) => {
      const dt = Math.min(64, n - last);
      last = n;
      if (playRef.current && st.current.visible) { st.current.t += dt * (slowRef.current ? 0.4 : 1); draw(); }
      raf = requestAnimationFrame(frame);
    };
    draw();
    raf = requestAnimationFrame(frame);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((e) => { st.current.visible = e[0].isIntersecting; }) : null;
    io?.observe(g.ownerSVGElement!);
    (g as unknown as { redraw: () => void }).redraw = draw;
    return () => { cancelAnimationFrame(raf); io?.disconnect(); };
  }, [id]);

  const redraw = () => (gRef.current as unknown as { redraw?: () => void })?.redraw?.();
  useEffect(redraw, [ghost]);

  const jump = (j: number) => {
    let acc = 0;
    for (let q = 0; q <= j; q++) acc += def.tl[q].d;
    st.current.t = acc - 1;
    setPlaying(false);
    playRef.current = false;
    redraw();
  };

  return (
    <div className="anim">
      <div className="stage">
        <span className="view">{def.view}</span>
        <svg viewBox="0 0 220 230" role="img" aria-label="Animación del ejercicio">
          <g ref={ghostRef} data-on={ghost ? '1' : '0'} />
          <g ref={gRef} />
        </svg>
        <div className="now" aria-live="polite">{def.tl[idx]?.l}</div>
      </div>
      <div className="anim-ctrl">
        <button type="button" className="btn sm" onClick={() => setPlaying((x) => !x)}>{playing ? 'Pausar' : 'Reproducir'}</button>
        <button type="button" className="btn sm" aria-pressed={slow} onClick={() => setSlow((x) => !x)}>Cámara lenta</button>
        <button type="button" className="btn sm" aria-pressed={ghost} onClick={() => setGhost((x) => !x)}>{def.ghostLabel}</button>
      </div>
      {!compact && (
        <ol className="phases">
          {def.tl.map((x, j) => (
            <li key={j} className={j === idx ? 'on' : ''} onClick={() => jump(j)}>
              <span>{x.l}</span><span className="dur">{(x.d / 1000).toFixed(1)} s</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
