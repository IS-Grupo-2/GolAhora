// src/components/reservas/ReservaCard.jsx
import { useEffect } from 'react';
import { formatearFecha } from '../../utils/fechas';

export default function ReservaCard({ reserva, onCancelar, onPagar }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    });

    const isPagado = reserva.cobro?.estado === 'pagado';
    const isCancelada = reserva.estado === 'cancelada';

    return (
        <div className="cancel-info-card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
            {/* Banner superior de estado */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: isCancelada ? 'var(--red)' : isPagado ? '#10b981' : '#f59e0b' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h4 style={{ margin: '0 0 0.25rem', color: 'var(--text)', fontSize: '1.1rem' }}>
                        {reserva.cancha.nombre}
                    </h4>
                    <span className={`badge ${isCancelada ? 'danger' : isPagado ? 'success' : 'warning'}`}>
                        {isCancelada ? 'Cancelada' : reserva.estado}
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text)' }}>
                        ${reserva.montoTotal.toLocaleString('es-AR')}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monto Total</span>
                </div>
            </div>

            <div className="detalle-grid" style={{ gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div className="detalle-campo" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                    <i data-lucide="calendar" style={{ color: 'var(--purple)', width: '16px' }} />
                    <span className="detalle-valor">{formatearFecha(reserva.fechaUso)}</span>
                </div>
                <div className="detalle-campo" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                    <i data-lucide="clock" style={{ color: 'var(--purple)', width: '16px' }} />
                    <span className="detalle-valor">{reserva.horaInicio} a {reserva.horaFin} hs</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!isPagado && !isCancelada && (
                    <button className="btn-primary-action" style={{ flex: 1, justifyContent: 'center' }} onClick={onPagar}>
                        <i data-lucide="credit-card" /> Pagar ahora
                    </button>
                )}
                
                {!isCancelada && (
                    <button 
                        className="btn-modal-cancel" 
                        style={{ flex: isPagado ? 1 : 0, color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }} 
                        onClick={onCancelar}
                        title="Cancelar reserva"
                    >
                        <i data-lucide="x-circle" /> {isPagado && "Cancelar Reserva"}
                    </button>
                )}
            </div>
        </div>
    );
}
