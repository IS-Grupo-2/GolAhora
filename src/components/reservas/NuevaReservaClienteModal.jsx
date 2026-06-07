import { useEffect, useState, useMemo } from 'react';
import { useCanchas } from '../../context/CanchasContext';
import { useReservas } from '../../context/ReservasContext';
import { useCobros } from '../../context/CobrosContext';
import { useAuth } from '../../context/AuthContext';
import { validarReservaCancha } from '../../utils/reservasDisponibilidad';

export default function NuevaReservaClienteModal({ onClose }) {
    const { canchas = [], tiposCanchas = [], disponibilidades = [] } = useCanchas();
    const { crearReserva, reservas = [] } = useReservas();
    const cobrosContext = useCobros();
    const { user } = useAuth();
    const hoy = new Date();
    const fechaMaximaReserva = new Date(hoy);
    fechaMaximaReserva.setDate(fechaMaximaReserva.getDate() + 30);

    const [form, setForm] = useState({
        canchaId: '',
        fechaUso: '',
        horaInicio: '18:00',
        horaFin: '19:00'
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    }, []);

    // Precio dinámico mapeando defensivamente 'tipoCanchaId' o 'idTipo'
    const detallesCancha = useMemo(() => {
        if (!form.canchaId) return null;
        return validarReservaCancha({
            canchaId: form.canchaId,
            fechaUso: form.fechaUso,
            horaInicio: form.horaInicio,
            horaFin: form.horaFin,
            canchas,
            tiposCanchas,
            disponibilidades,
            reservas
        });
    }, [form, canchas, tiposCanchas, disponibilidades, reservas]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        if (!detallesCancha?.ok) return;

        // Fallbacks seguros de ID y Nombre por si difieren las propiedades de Auth de tu equipo
        const userId = user?.idUsuario || user?.id || 1;
        const userNombre = user?.nombre || 'Cliente';
        const userApellido = user?.apellido || 'Moc';

        const nuevaReserva = {
            cliente: { idUsuario: userId, nombre: userNombre, apellido: userApellido },
            reservador: { id: userId, nombre: `${userNombre} ${userApellido}`, email: user?.email || 'cliente@test.com', rol: user?.rol || 'cliente' },
            cancha: {
                idCancha: detallesCancha.cancha.id,
                nombre: detallesCancha.cancha.nombre,
                numero: detallesCancha.cancha.numero
            },
            fechaUso: form.fechaUso,
            horaInicio: detallesCancha.horaInicio,
            horaFin: detallesCancha.horaFin,
            duracionMin: detallesCancha.duracionMin,
            estado: 'pendiente',
            montoTotal: detallesCancha.precioTotal,
            cobro: { estado: 'pendiente', metodo: null }
        };

        // 1. Persistir la reserva localmente
        const reservaCreada = await crearReserva(nuevaReserva);

        // 2. Persistir automáticamente el cobro en CobrosContext (si existe) sin tumbar la app
        if (reservaCreada?.idReserva && cobrosContext?.crearItem) {
            try {
                await cobrosContext.crearItem({
                    idReserva: reservaCreada.idReserva,
                    cliente: { idUsuario: userId, nombre: userNombre, apellido: userApellido, dni: user?.dni || '33788901' },
                    concepto: `Reserva ${detallesCancha.cancha.nombre} - ${form.fechaUso}`,
                    tipoCobro: 'Reserva Cancha',
                    monto: detallesCancha.precioTotal,
                    montoFinal: detallesCancha.precioTotal,
                    fecha: new Date().toISOString().split('T')[0],
                    estado: 'pendiente',
                    metodo: null
                });
            } catch (err) {
                console.warn("Muted: No se pudo auto-generar la fila en CobrosContext", err);
            }
        }

        onClose();
    };

    return (
        <div className="dash-modal-overlay activo">
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>Reservar una Cancha</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <i data-lucide="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <form id="reserva-wizard" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div className="form-group">
                            <label>Seleccionar Cancha <span className="req">*</span></label>
                            <select name="canchaId" value={form.canchaId} onChange={handleChange} required>
                                <option value="" disabled>Elegí una cancha...</option>
                                {canchas.filter(c => c.estado !== 'inactiva').map(c => {
                                    const tipoId = c.tipoCanchaId || c.idTipo;
                                    const tipo = tiposCanchas.find(t => t.id === tipoId);
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} – {tipo?.nombre || 'General'} (${tipo?.precioHora?.toLocaleString('es-AR')}/hr)
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Fecha <span className="req">*</span></label>
                            <input
                                name="fechaUso" type="date"
                                value={form.fechaUso} onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                max={fechaMaximaReserva.toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Hora de Inicio <span className="req">*</span></label>
                                <input name="horaInicio" type="time" step="1800" value={form.horaInicio} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Hora de Fin <span className="req">*</span></label>
                                <input name="horaFin" type="time" step="1800" value={form.horaFin} onChange={handleChange} required />
                            </div>
                        </div>

                        {detallesCancha?.ok && (
                            <div className="cancel-policy" style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginTop: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Subtotal ({detallesCancha.horas} hs)
                                    </span>
                                    <strong style={{ fontSize: '1.25rem', color: 'var(--purple)' }}>
                                        ${detallesCancha.precioTotal.toLocaleString('es-AR')}
                                    </strong>
                                </div>
                                <p style={{ fontSize: '0.75rem', marginTop: '8px', lineHeight: 1.4 }}>
                                    <strong>Nota:</strong> La reserva quedará "Pendiente" hasta que abones el monto total.
                                    Podés pagar desde "Mis Reservas".
                                </p>
                            </div>
                        )}

                        {form.canchaId && form.fechaUso && !detallesCancha?.ok && (
                            <div className="form-error" style={{ display: 'block', fontWeight: 600 }}>
                                {detallesCancha?.mensaje}
                            </div>
                        )}
                    </form>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose} type="button">Cancelar</button>
                    <button
                        className="btn-modal-save"
                        form="reserva-wizard"
                        type="submit"
                        disabled={!detallesCancha?.ok}
                    >
                        <i data-lucide="calendar-check" /> Confirmar Reserva
                    </button>
                </div>
            </div>
        </div>
    );
}
