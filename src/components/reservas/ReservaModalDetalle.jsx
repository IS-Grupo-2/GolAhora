import { useEffect } from 'react';
import { formatearFecha } from '../../utils/fechas';

export default function ReservaModalDetalle({ reserva, onClose, onConfirm }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [reserva]);

    if (!reserva) return null;

    return (
        <div className="dash-modal-overlay activo">
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>Detalle de Reserva #{reserva.idReserva}</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <i data-lucide="x" />
                    </button>
                </div>
                
                <div className="dash-modal-body">
                    <div className="detalle-avatar">
                        <i data-lucide="calendar-check" style={{ width: '30px', height: '30px' }} />
                    </div>
                    <div className="detalle-nombre">{reserva.cancha.nombre}</div>
                    
                    <div className="detalle-grid" style={{ marginTop: '20px' }}>
                        <div className="detalle-campo detalle-full">
                            <span className="detalle-label">Cliente</span>
                            <span className="detalle-valor">{reserva.reservador.nombre} ({reserva.reservador.email})</span>
                        </div>
                        <div className="detalle-campo">
                            <span className="detalle-label">Fecha Uso</span>
                            <span className="detalle-valor">{formatearFecha(reserva.fechaUso)}</span>
                        </div>
                        <div className="detalle-campo">
                            <span className="detalle-label">Horario</span>
                            <span className="detalle-valor">{reserva.horaInicio} - {reserva.horaFin}</span>
                        </div>
                        <div className="detalle-campo">
                            <span className="detalle-label">Monto Total</span>
                            <span className="detalle-valor">${reserva.montoTotal.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="detalle-campo">
                            <span className="detalle-label">Estado de Reserva</span>
                            <span className="detalle-valor" style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                                {reserva.estado}
                            </span>
                        </div>
                        <div className="detalle-campo detalle-full" style={{ background: reserva.cobro.estado === 'pagado' ? '#f0fdf4' : '#fffbeb', borderColor: reserva.cobro.estado === 'pagado' ? '#bbf7d0' : '#fde68a' }}>
                            <span className="detalle-label">Estado del Pago</span>
                            <span className="detalle-valor">
                                {reserva.cobro.estado === 'pagado' ? '✅ Pago completado y validado' : '⏳ Pendiente de cobro'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cerrar</button>
                    {/* RF24 - Validación de pago para confirmar */}
                    {reserva.estado === 'pendiente' && (
                        <button className="btn-modal-save" onClick={() => onConfirm(reserva.idReserva)}>
                            <i data-lucide="check-circle" /> Validar Pago y Confirmar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
