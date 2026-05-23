// src/components/clases/ClaseModalBaja.jsx
import { useEffect } from 'react';

export default function ClaseModalBaja({ open, clase, onConfirmar, onCerrar }) {
    const esCancelada = clase?.estado === 'cancelada';

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
    }, [open, esCancelada]);

    if (!open || !clase) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>{esCancelada ? 'Reactivar Clase' : 'Cancelar Clase'}</h3>
                    <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                        <i data-lucide="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                        {esCancelada ? (
                            <>¿Deseás reactivar y volver a programar la clase <strong>{clase.nombre}</strong>?</>
                        ) : (
                            <>¿Deseás cancelar la clase <strong>{clase.nombre}</strong>? Esta acción notificará la suspensión del turno en la grilla horaria.</>
                        )}
                    </p>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Volver</button>
                    <button 
                        className={esCancelada ? 'btn-modal-save' : 'btn-modal-danger'} 
                        onClick={() => onConfirmar(clase)}
                    >
                        <i data-lucide={esCancelada ? 'calendar-check' : 'calendar-x'} />
                        {esCancelada ? 'Reactivar Clase' : 'Cancelar Clase'}
                    </button>
                </div>
            </div>
        </div>
    );
}