import { useEffect, type ReactNode } from 'react';
import { Icon } from './Icon';

export function Sheet({ title, sub, onClose, children }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <div style={{ minWidth: 0 }}>
            {sub && <div className="lbl">{sub}</div>}
            <h1>{title}</h1>
          </div>
          <button className="close" type="button" onClick={onClose} aria-label="Cerrar"><Icon n="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
