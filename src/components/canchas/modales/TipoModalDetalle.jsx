// src/components/canchas/modales/TipoModalDetalle.jsx
import { useEffect } from 'react';

export default function TipoModalDetalle({ open, tipo, onCerrar }) {
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
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>Detalle del tipo de cancha</h3>
                    <button className="dash-modal-close" onClick={onCerrar} aria-label="Cerrar"><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <div className="detalle-grid">
                        <div className="det-row">
                            <span>Nombre</span><strong>{tipo.nombre}</strong>
                        </div>
                        <div className="det-row">
                            <span>Superficie</span><strong>{tipo.superficie}</strong>
                        </div>
                        <div className="det-row">
                            <span>Capacidad</span><strong>{tipo.capacidadJugadores} jug.</strong>
                        </div>
                        <div className="det-row">
                            <span>Duración máx.</span><strong>{tipo.duracionMaxReservaMin} min</strong>
                        </div>
                        <div className="det-row">
                            <span>Precio/hora</span><strong>${tipo.precioHora.toLocaleString('es-AR')}</strong>
                        </div>
                        <div className="det-row full" style={{ gridColumn: '1 / -1' }}>
                            <span>Descripción</span><strong>{tipo.descripcion || '—'}</strong>
                        </div>
                    </div>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}