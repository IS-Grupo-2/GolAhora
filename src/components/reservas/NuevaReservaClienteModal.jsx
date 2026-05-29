// src/components/reservas/NuevaReservaClienteModal.jsx
import { useEffect, useState, useMemo } from 'react';
import { useCanchas } from '../../context/CanchasContext';
import { useReservas } from '../../context/ReservasContext';
import { useAuth } from '../../context/AuthContext';

export default function NuevaReservaClienteModal({ onClose }) {
    const { canchas, tiposCanchas } = useCanchas();
    const { crearReserva } = useReservas();
    const { user } = useAuth();

    const [form, setForm] = useState({
        canchaId: '',
        fechaUso: '',
        horaInicio: '18:00',
        horaFin: '19:00'
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    }, []);

    // Calcula dinámicamente el precio en base a la cancha seleccionada y el tiempo
    const detallesCancha = useMemo(() => {
        if (!form.canchaId) return null;
        const canchaSeleccionada = canchas.find(c => c.id === Number(form.canchaId));
        const tipo = tiposCanchas.find(t => t.id === canchaSeleccionada?.idTipo);
        
        // Cálculo de horas (simplificado)
        const [hIn, mIn] = form.horaInicio.split(':').map(Number);
        const [hFin, mFin] = form.horaFin.split(':').map(Number);
        let horas = (hFin + mFin/60) - (hIn + mIn/60);
        if (horas <= 0) horas = 1; // Fallback

        const precioTotal = (tipo?.precioHora || 0) * horas;

        return { cancha: canchaSeleccionada, tipo, horas, precioTotal };
    }, [form, canchas, tiposCanchas]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!detallesCancha) return;

        const nuevaReserva = {
            cliente: { idUsuario: user.id, nombre: user.nombre, apellido: user.apellido },
            reservador: { id: user.id, nombre: `${user.nombre} ${user.apellido}`, email: user.email, rol: user.rol },
            cancha: { id: detallesCancha.cancha.id, idCancha: detallesCancha.cancha.id, nombre: detallesCancha.cancha.nombre, numero: detallesCancha.cancha.numero },
            fechaUso: form.fechaUso,
            horaInicio: form.horaInicio,
            horaFin: form.horaFin,
            duracionMin: detallesCancha.horas * 60,
            estado: 'pendiente', // RF24: Requiere pago para confirmarse
            montoTotal: detallesCancha.precioTotal,
            cobro: { estado: 'pendiente', metodo: null }
        };

        await crearReserva(nuevaReserva);
        onClose();
    };

    return (
        <div className="dash-modal-overlay activo">
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>Reservar una Cancha</h3>
                    <button className="dash-modal-close" onClick={onClose}><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <form id="reserva-wizard" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        <div className="form-group">
                            <label>Seleccionar Cancha <span className="req">*</span></label>
                            <select name="canchaId" value={form.canchaId} onChange={handleChange} required>
                                <option value="" disabled>Elegí una cancha...</option>
                                {canchas.filter(c => c.estado === 'activa').map(c => {
                                    const tipo = tiposCanchas.find(t => t.id === c.idTipo);
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} - {tipo?.nombre} (${tipo?.precioHora.toLocaleString('es-AR')}/hr)
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Fecha <span className="req">*</span></label>
                            <input name="fechaUso" type="date" value={form.fechaUso} onChange={handleChange} min={new Date().toISOString().split("T")[0]} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Hora de Inicio <span className="req">*</span></label>
                                <input name="horaInicio" type="time" value={form.horaInicio} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Hora de Fin <span className="req">*</span></label>
                                <input name="horaFin" type="time" value={form.horaFin} onChange={handleChange} required />
                            </div>
                        </div>

                        {detallesCancha && (
                            <div className="cancel-policy" style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginTop: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subtotal ({detallesCancha.horas} horas)</span>
                                    <strong style={{ fontSize: '1.25rem', color: 'var(--purple)' }}>${detallesCancha.precioTotal.toLocaleString('es-AR')}</strong>
                                </div>
                                <p style={{ fontSize: '0.75rem', marginTop: '8px' }}>
                                    <strong>RF24:</strong> La reserva quedará "Pendiente" hasta que abones el monto total. Podés pagar ahora o desde la sección "Mis Reservas".
                                </p>
                            </div>
                        )}
                    </form>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose} type="button">Cancelar</button>
                    <button className="btn-modal-save" form="reserva-wizard" type="submit" disabled={!detallesCancha}>
                        <i data-lucide="calendar-check" /> Confirmar Reserva
                    </button>
                </div>
            </div>
        </div>
    );
}