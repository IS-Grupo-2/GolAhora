// src/components/canchas/modales/CanchaModalBaja.jsx
import { useEffect } from 'react';

export default function CanchaModalBaja({ open, cancha, onConfirmar, onCerrar }) {
    const esBaja = cancha?.estado === 'activa';

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, esBaja]);

    if (!open || !cancha) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>{esBaja ? 'Dar de baja' : 'Reactivar cancha'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar} aria-label="Cerrar"><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                        {esBaja 
                            ? <>¿Deseás dar de baja a <strong>"{cancha.nombre}"</strong>? Se bloquearán todas sus disponibilidades vinculadas.</>
                            : <>¿Deseás reactivar <strong>"{cancha.nombre}"</strong>?</>}
                    </p>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-danger" onClick={() => onConfirmar(cancha)}>
                        <i data-lucide="power" /> Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}