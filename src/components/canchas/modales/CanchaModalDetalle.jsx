// src/components/canchas/modales/CanchaModalDetalle.jsx
import { useEffect } from 'react';

export default function CanchaModalDetalle({ open, cancha, tipos, onCerrar }) {
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

    if (!open || !cancha) return null;
    const tipo = tipos.find(t => t.id === cancha.idTipo);

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>Detalle de cancha</h3>
                    <button className="dash-modal-close" onClick={onCerrar} aria-label="Cerrar"><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <div className="detalle-grid">
                        <div className="det-row">
                            <span>Número</span><strong>{cancha.numero}</strong>
                        </div>
                        <div className="det-row">
                            <span>Nombre</span><strong>{cancha.nombre}</strong>
                        </div>
                        <div className="det-row">
                            <span>Tipo</span><strong>{tipo?.nombre || '—'}</strong>
                        </div>
                        <div className="det-row">
                            <span>Capacidad</span><strong>{tipo?.capacidadJugadores || '—'} jug.</strong>
                        </div>
                        <div className="det-row">
                            <span>Precio/hora</span><strong>{tipo ? `$${tipo.precioHora.toLocaleString('es-AR')}` : '—'}</strong>
                        </div>
                        <div className="det-row">
                            <span>Estado</span>
                            <span className={`badge ${cancha.estado === 'activa' ? 'success' : 'danger'}`}>
                                {cancha.estado === 'activa' ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                        <div className="det-row full" style={{ gridColumn: '1 / -1' }}>
                            <span>Descripción</span><strong>{cancha.descripcion || '—'}</strong>
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