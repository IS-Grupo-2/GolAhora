import { useEffect } from 'react';

function parseMinutes(time) {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export default function ReservaModal({ reserva, onClose, onSave }) {
    const isEdit = !!reserva;

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        const start = parseMinutes(values.horaInicio);
        const end = parseMinutes(values.horaFin);
        const duracionMin = start !== null && end !== null ? Math.max(0, end - start) : reserva?.duracionMin || 60;

        onSave({
            ...reserva,
            reservador: reserva?.reservador || {
                id: Date.now(),
                nombre: values.cliente || 'Usuario Nuevo',
                email: `${(values.cliente || 'nuevo').replace(/\s+/g, '').toLowerCase()}@club.com`,
                rol: 'cliente'
            },
            cancha: values.cancha === '2'
                ? { id: 2, nombre: 'Cancha 2 (Pádel)', numero: 2 }
                : { id: 1, nombre: 'Cancha 1 (Fútbol 5)', numero: 1 },
            fechaUso: values.fechaUso,
            horaInicio: values.horaInicio,
            horaFin: values.horaFin,
            duracionMin,
            montoTotal: Number(values.montoTotal) || reserva?.montoTotal || 0,
            estado: reserva?.estado || 'pendiente',
            cobro: reserva?.cobro || { estado: 'pendiente', metodo: null }
        });
    };

    return (
        <div className="dash-modal-overlay activo">
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{isEdit ? 'Modificar Reserva' : 'Nueva Reserva'}</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <i data-lucide="x" />
                    </button>
                </div>
                <div className="dash-modal-body">
                    <form id="form-reserva" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                            <label>Cliente <span className="req">*</span></label>
                            <input name="cliente" type="text" defaultValue={reserva?.reservador.nombre || ''} placeholder="Buscar o seleccionar cliente..." required />
                        </div>
                        
                        <div className="form-group">
                            <label>Cancha <span className="req">*</span></label>
                            <select name="cancha" defaultValue={reserva?.cancha.id || ''} required>
                                <option value="" disabled>Seleccione una cancha</option>
                                <option value="1">Cancha 1 (Fútbol 5)</option>
                                <option value="2">Cancha 2 (Pádel)</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha de uso <span className="req">*</span></label>
                                <input name="fechaUso" type="date" defaultValue={reserva?.fechaUso || ''} required />
                            </div>
                            <div className="form-group">
                                <label>Monto Total ($)</label>
                                <input name="montoTotal" type="number" defaultValue={reserva?.montoTotal || ''} placeholder="Ej. 15000" readOnly={isEdit} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Hora Inicio <span className="req">*</span></label>
                                <input name="horaInicio" type="time" defaultValue={reserva?.horaInicio || ''} required />
                            </div>
                            <div className="form-group">
                                <label>Hora Fin <span className="req">*</span></label>
                                <input name="horaFin" type="time" defaultValue={reserva?.horaFin || ''} required />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
                    <button className="btn-modal-save" form="form-reserva" type="submit">
                        <i data-lucide="save" /> {isEdit ? 'Actualizar' : 'Registrar'}
                    </button>
                </div>
            </div>
        </div>
    );
}