// src/components/empleados/EmpleadoModalBaja.jsx
import { useEffect } from 'react';

export default function EmpleadoModalBaja({ open, empleado, onConfirmar, onCerrar }) {
    const deBaja = empleado?.activo === true;

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
    }, [open, deBaja]);

    if (!open || !empleado) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>Cambiar estado</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                        {deBaja ? (
                            <>¿Deseás deshabilitar a <strong>{empleado.nombre} {empleado.apellido}</strong>?</>
                        ) : (
                            <>¿Deseás reactivar a <strong>{empleado.nombre} {empleado.apellido}</strong>?</>
                        )}
                    </p>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-danger" onClick={() => onConfirmar(empleado)}>
                        <i data-lucide={deBaja ? 'user-x' : 'user-check'} />
                        {deBaja ? 'Deshabilitar' : 'Reactivar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
