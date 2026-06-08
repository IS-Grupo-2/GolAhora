import { useEffect, useMemo } from 'react';
import { calcularPoliticaReembolso } from '../../utils/reservasReembolso';
import { formatearFecha } from '../../utils/fechas';

export default function ReservaModalCancelar({ reserva, onClose, onCancel }) {
    const politica = useMemo(() => reserva ? calcularPoliticaReembolso(reserva) : null, [reserva]);
    const estaPagada = reserva?.cobro?.estado === 'pagado';

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
                    <h3>Cancelar Reserva</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <i data-lucide="x" />
                    </button>
                </div>
                <div className="dash-modal-body">
                    <p style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: '8px' }}>
                        Estás a punto de cancelar la reserva de <strong>{reserva.reservador.nombre}</strong> para el <strong>{formatearFecha(reserva.fechaUso)}</strong>.
                    </p>
                    <div className="cancel-info-grid">
                        <div className="cancel-info-card">
                            <span className="cancel-info-label">Cancha</span>
                            <strong>{reserva.cancha.nombre}</strong>
                        </div>
                        <div className="cancel-info-card">
                            <span className="cancel-info-label">Horario</span>
                            <strong>{reserva.horaInicio} - {reserva.horaFin}</strong>
                        </div>
                        <div className="cancel-info-card full-width">
                            <span className="cancel-info-label">Estado del pago</span>
                            <strong>{estaPagada ? 'Pago completado' : 'Pago pendiente'}</strong>
                        </div>
                    </div>

                    <div className="detalle-campo detalle-full cancel-policy">
                        <p>
                            {estaPagada
                                ? `Se emitirá un recibo de reembolso por el ${politica.porcentaje}% del pago. ${politica.descripcion}`
                                : 'La reserva no está pagada, por lo tanto no se emitirá recibo de reembolso.'
                            }
                        </p>
                    </div>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cerrar</button>
                    <button className="btn-modal-danger" onClick={() => onCancel(reserva.idReserva)}>
                        <i data-lucide="trash-2" /> Confirmar Cancelación
                    </button>
                </div>
            </div>
        </div>
    );
}
