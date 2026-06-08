// src/components/canchas/modales/TipoModalDetalle.jsx
import { useEffect } from 'react';

function CampoDetalle({ label, children, full = false }) {
    return (
        <div
            style={{
                gridColumn: full ? '1 / -1' : undefined,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--bg-card)',
            }}
        >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
                {label}
            </span>
            {children}
        </div>
    );
}

function Valor({ children }) {
    return (
        <strong style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700 }}>
            {children}
        </strong>
    );
}

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
                    <button className="dash-modal-close" onClick={onCerrar} aria-label="Cerrar">
                        <i data-lucide="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                        <CampoDetalle label="Nombre">
                            <Valor>{tipo.nombre || '-'}</Valor>
                        </CampoDetalle>

                        <CampoDetalle label="Superficie">
                            <Valor>{tipo.superficie || '-'}</Valor>
                        </CampoDetalle>

                        <CampoDetalle label="Capacidad">
                            <Valor>{tipo.capacidadJugadores || '-'} jug.</Valor>
                        </CampoDetalle>

                        <CampoDetalle label="Duracion max.">
                            <Valor>{tipo.duracionMaxReservaMin || '-'} min</Valor>
                        </CampoDetalle>

                        <CampoDetalle label="Precio/hora">
                            <Valor>${Number(tipo.precioHora || 0).toLocaleString('es-AR')}</Valor>
                        </CampoDetalle>

                        <CampoDetalle label="Descripcion" full>
                            <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>
                                {tipo.descripcion || '-'}
                            </p>
                        </CampoDetalle>
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}
