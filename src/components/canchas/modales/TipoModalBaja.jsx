// src/components/canchas/modales/TipoModalBaja.jsx
import { useEffect } from 'react';

export default function TipoModalBaja({ open, tipo, onConfirmar, onCerrar }) {
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
    }, [open]);

    if (!open || !tipo) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>Eliminar tipo de cancha</h3>
                    <button className="dash-modal-close" onClick={onCerrar} aria-label="Cerrar"><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                        ¿Estás seguro que deseás eliminar el tipo <strong>"{tipo.nombre}"</strong>? Esta acción no se puede deshacer.
                    </p>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-danger" onClick={() => onConfirmar(tipo)}>
                        <i data-lucide="trash-2" /> Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}