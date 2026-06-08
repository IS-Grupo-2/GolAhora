import { useState, useEffect, useMemo } from 'react';
import { useCanchas } from '../../context/CanchasContext';
import { useClientes } from '../../context/ClientesContext';
import { useReservas } from '../../context/ReservasContext';
import { useClases } from '../../context/ClasesContext';
import { validarReservaCancha } from '../../utils/reservasDisponibilidad';

export default function ReservaModal({ reserva, onClose, onSave }) {
    const { canchas, tiposCanchas, disponibilidades } = useCanchas();
    const { clientes } = useClientes();
    const { reservas } = useReservas();
    const { clases } = useClases();
    const isEdit = !!reserva;
    const hoy = new Date();
    const fechaMaximaReserva = new Date(hoy);
    fechaMaximaReserva.setDate(fechaMaximaReserva.getDate() + 30);

    const [form, setForm] = useState({
        clienteId: reserva?.cliente?.idUsuario || reserva?.cliente?.id || '',
        canchaId:  reserva?.cancha?.idCancha  || reserva?.cancha?.id  || '',
        fechaUso:  reserva?.fechaUso   || '',
        horaInicio: reserva?.horaInicio || '18:00',
        horaFin:    reserva?.horaFin    || '19:00',
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    }, []);

    // Precio dinámico según cancha + horario
    const detallesCancha = useMemo(() => {
        if (!form.canchaId) return null;
        return validarReservaCancha({
            reservaId: reserva?.idReserva,
            canchaId: form.canchaId,
            fechaUso: form.fechaUso,
            horaInicio: form.horaInicio,
            horaFin: form.horaFin,
            canchas,
            tiposCanchas,
            disponibilidades,
            reservas,
            clases
        });
    }, [form, canchas, tiposCanchas, disponibilidades, reservas, clases, reserva?.idReserva]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (!detallesCancha?.ok || !form.clienteId) return;

        const clienteSel = clientes.find(
            c => c.idUsuario === Number(form.clienteId) || c.id === Number(form.clienteId)
        );
        if (!clienteSel) return;

        const reservaData = {
            ...(isEdit ? { idReserva: reserva.idReserva } : {}),
            cliente: {
                idUsuario: clienteSel.idUsuario || clienteSel.id,
                nombre: clienteSel.nombre,
                apellido: clienteSel.apellido,
                dni: clienteSel.dni || 'S/N'
            },
            reservador: reserva?.reservador || {
                id: clienteSel.idUsuario || clienteSel.id,
                nombre: `${clienteSel.nombre} ${clienteSel.apellido}`,
                email: clienteSel.email || 'sin-email@club.com',
                rol: clienteSel.rol || 'cliente'
            },
            cancha: {
                id: detallesCancha.cancha.id,
                idCancha: detallesCancha.cancha.id,
                nombre: detallesCancha.cancha.nombre,
                numero: detallesCancha.cancha.numero
            },
            fechaUso: form.fechaUso,
            horaInicio: detallesCancha.horaInicio,
            horaFin: detallesCancha.horaFin,
            duracionMin: detallesCancha.duracionMin,
            montoTotal: detallesCancha.precioTotal,
            estado: reserva?.estado || 'pendiente',
            cobro: reserva?.cobro || { estado: 'pendiente', metodo: null }
        };

        onSave(reservaData);
    };

    return (
        <div className="dash-modal-overlay activo">
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{isEdit ? 'Modificar Reserva' : 'Nueva Reserva'}</h3>
                    <button className="dash-modal-close" type="button" onClick={onClose}>
                        <i data-lucide="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <form id="form-reserva" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div className="form-group">
                            <label>Cliente <span className="req">*</span></label>
                            <select name="clienteId" value={form.clienteId} onChange={handleChange} required>
                                <option value="" disabled>Seleccionar cliente...</option>
                                {clientes.map(c => (
                                    <option key={c.idUsuario || c.id} value={c.idUsuario || c.id}>
                                        {c.nombre} {c.apellido}{c.dni ? ` - DNI: ${c.dni}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Cancha <span className="req">*</span></label>
                            <select name="canchaId" value={form.canchaId} onChange={handleChange} required>
                                <option value="" disabled>Seleccionar cancha...</option>
                                {canchas.filter(c => c.estado !== 'inactiva' || isEdit).map(c => {
                                    const tipo = tiposCanchas.find(t => t.id === c.idTipo);
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} – {tipo?.nombre} (${tipo?.precioHora?.toLocaleString('es-AR')}/hr)
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha de uso <span className="req">*</span></label>
                                <input
                                    name="fechaUso" type="date"
                                    value={form.fechaUso} onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={fechaMaximaReserva.toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Monto calculado ($)</label>
                                <div style={{
                                    background: '#f1f5f9', padding: '0.6rem', borderRadius: '8px',
                                    border: '1px solid var(--border)', fontWeight: 'bold', color: 'var(--purple)'
                                }}>
                                    ${detallesCancha?.ok ? detallesCancha.precioTotal.toLocaleString('es-AR') : '0'}
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Hora inicio <span className="req">*</span></label>
                                <input name="horaInicio" type="time" step="1800" value={form.horaInicio} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Hora fin <span className="req">*</span></label>
                                <input name="horaFin" type="time" step="1800" value={form.horaFin} onChange={handleChange} required />
                            </div>
                        </div>

                        {form.canchaId && form.fechaUso && !detallesCancha?.ok && (
                            <div className="form-error" style={{ display: 'block', fontWeight: 600 }}>
                                {detallesCancha?.mensaje}
                            </div>
                        )}
                    </form>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" type="button" onClick={onClose}>Cancelar</button>
                    <button className="btn-modal-save" form="form-reserva" type="submit" disabled={!detallesCancha?.ok}>
                        <i data-lucide="save" /> {isEdit ? 'Actualizar' : 'Registrar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
