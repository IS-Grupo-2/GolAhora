import { useEffect, useState } from 'react';

export default function ReservaModalCancelar({ reserva, onClose, onCancel }) {
    // Estado para simular la detección del plazo de cancelación (verificarAnt30Dias o similar)
    const [fueraDePlazo, setFueraDePlazo] = useState(false); 

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
                        Estás a punto de cancelar la reserva de <strong>{reserva.reservador.nombre}</strong> para el <strong>{reserva.fechaUso}</strong>.
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
                            <strong>{reserva.cobro.estado === 'pagado' ? 'Pago completado' : 'Pago pendiente'}</strong>
                        </div>
                    </div>

                    <div className="detalle-campo detalle-full cancel-policy">
                        <label className="cancel-policy-toggle">
                            <input 
                                type="checkbox" 
                                checked={fueraDePlazo} 
                                onChange={(e) => setFueraDePlazo(e.target.checked)} 
                            />
                            La cancelación está fuera del plazo mínimo de antelación.
                        </label>
                        <p>
                            {fueraDePlazo 
                                ? "🚨 Se aplicará un recargo al usuario según las políticas del club (RF25)."
                                : "✅ Se procesará el reembolso total o parcial según la política de devoluciones (RF26)."
                            }
                        </p>
                    </div>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cerrar</button>
                    <button className="btn-modal-danger" onClick={() => onCancel(reserva.idReserva, fueraDePlazo)}>
                        <i data-lucide="trash-2" /> Confirmar Cancelación
                    </button>
                </div>
            </div>
        </div>
    );
}