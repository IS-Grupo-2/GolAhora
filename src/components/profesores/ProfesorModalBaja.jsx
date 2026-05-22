// src/components/profesores/ProfesorModalBaja.jsx
import { useEffect } from 'react';

export default function ProfesorModalBaja({ open, profesor, onConfirmar, onCerrar }) {
    const deBaja = profesor?.estado === 'activo';

    // Escape para cerrar
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Lucide icons
    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, deBaja]);

    if (!open || !profesor) return null;

    return (
        <div
            className="dash-modal-overlay activo"
            role="dialog"
            aria-modal="true"
            onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}
        >
            <div className="dash-modal dash-modal--sm">
                {/* HEADER */}
                <div className="dash-modal-header">
                    <h3>Cambiar estado</h3>
                    <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                        <i data-lucide="x" />
                    </button>
                </div>

                {/* BODY */}
                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                        {deBaja ? (
                            <>¿Deseás dar de baja a <strong>{profesor.nombre} {profesor.apellido}</strong>?</>
                        ) : (
                            <>¿Deseás reactivar a <strong>{profesor.nombre} {profesor.apellido}</strong>?</>
                        )}
                    </p>
                </div>

                {/* FOOTER */}
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-danger" onClick={() => onConfirmar(profesor)}>
                        <i data-lucide={deBaja ? 'user-x' : 'user-check'} />
                        {deBaja ? 'Dar de baja' : 'Reactivar'}
                    </button>
                </div>
            </div>
        </div>
    );
}