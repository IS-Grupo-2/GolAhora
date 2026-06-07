// src/components/canchas/modales/DispModal.jsx
import { useEffect, useMemo, useState } from 'react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS_INICIO = Array.from({ length: 15 }, (_, i) => i + 9);
const HORAS_FIN = Array.from({ length: 15 }, (_, i) => i + 10);

const horaOption = (h) => (
    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
);

export default function DispModal({ open, modo, disp, idCanchaFallback, canchas, dispsExistentes, onGuardar, onCerrar }) {
    const defaultForm = { idCancha: '', diaSemana: '', horaInicio: 9, horaFin: 23, disponible: true };
    const [form, setForm] = useState(defaultForm);
    const [errores, setErrores] = useState({ idCancha: '', diaSemana: '', horaInicio: '', horaFin: '' });

    useEffect(() => {
        if (!open) return;
        setForm(disp ? {
            ...disp,
            idCancha: disp.idCancha ?? disp.canchaId,
            horaInicio: Number(disp.horaInicio),
            horaFin: Number(disp.horaFin)
        } : { ...defaultForm, idCancha: idCanchaFallback || '' });
        setErrores({ idCancha: '', diaSemana: '', horaInicio: '', horaFin: '' });
    }, [open, disp, idCanchaFallback]);

    useEffect(() => {
        if (open && typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [open, form]);

    const opcionesFin = useMemo(() => {
        const inicio = Number(form.horaInicio);
        return HORAS_FIN.filter(h => h > inicio);
    }, [form.horaInicio]);

    if (!open) return null;

    function actualizarInicio(valor) {
        const inicio = Number(valor);
        const finActual = Number(form.horaFin);
        setForm({
            ...form,
            horaInicio: inicio,
            horaFin: finActual > inicio ? finActual : Math.min(inicio + 1, 24)
        });
    }

    function handleGuardar() {
        const errs = { idCancha: '', diaSemana: '', horaInicio: '', horaFin: '' };
        let ok = true;
        const inicio = Number(form.horaInicio);
        const fin = Number(form.horaFin);
        const idCancha = Number(form.idCancha);

        if (!idCancha) { errs.idCancha = 'Requerido'; ok = false; }
        if (!form.diaSemana) { errs.diaSemana = 'Requerido'; ok = false; }
        if (inicio < 9 || inicio > 23) { errs.horaInicio = 'Debe estar entre 09:00 y 23:00'; ok = false; }
        if (fin <= inicio) { errs.horaFin = 'Debe ser mayor al inicio'; ok = false; }

        if (ok) {
            const solapado = dispsExistentes.some(d => {
                const dispCanchaId = Number(d.idCancha ?? d.canchaId);
                if (dispCanchaId !== idCancha || d.diaSemana !== form.diaSemana) return false;
                if (disp && d.id === disp.id) return false;
                return inicio < Number(d.horaFin) && fin > Number(d.horaInicio);
            });

            if (solapado) {
                errs.horaInicio = 'Solapamiento con otra franja';
                errs.horaFin = 'Verifique el horario';
                ok = false;
            }
        }

        setErrores(errs);
        if (ok) onGuardar({ ...form, idCancha, canchaId: idCancha, horaInicio: inicio, horaFin: fin });
    }

    return (
        <div className="dash-modal-overlay activo" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{modo === 'nuevo' ? 'Nueva franja horaria' : 'Editar franja'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <div className="form-group">
                        <label>Cancha <span className="req">*</span></label>
                        <select
                            value={form.idCancha}
                            onChange={e => setForm({ ...form, idCancha: e.target.value })}
                            className={errores.idCancha ? 'input-error-field' : ''}
                        >
                            <option value="">Seleccionar</option>
                            {canchas.filter(c => c.estado !== 'inactiva').map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                        <span className="form-error">{errores.idCancha}</span>
                    </div>

                    <div className="form-group">
                        <label>Día de la semana <span className="req">*</span></label>
                        <select
                            value={form.diaSemana}
                            onChange={e => setForm({ ...form, diaSemana: e.target.value })}
                            className={errores.diaSemana ? 'input-error-field' : ''}
                        >
                            <option value="">Seleccionar</option>
                            {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <span className="form-error">{errores.diaSemana}</span>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Hora inicio <span className="req">*</span></label>
                            <select
                                value={form.horaInicio}
                                onChange={e => actualizarInicio(e.target.value)}
                                className={errores.horaInicio ? 'input-error-field' : ''}
                            >
                                {HORAS_INICIO.map(horaOption)}
                            </select>
                            <span className="form-error">{errores.horaInicio}</span>
                        </div>
                        <div className="form-group">
                            <label>Hora fin <span className="req">*</span></label>
                            <select
                                value={form.horaFin}
                                onChange={e => setForm({ ...form, horaFin: Number(e.target.value) })}
                                className={errores.horaFin ? 'input-error-field' : ''}
                            >
                                {opcionesFin.map(horaOption)}
                            </select>
                            <span className="form-error">{errores.horaFin}</span>
                        </div>
                    </div>

                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            id="fd-disp"
                            checked={form.disponible}
                            onChange={e => setForm({ ...form, disponible: e.target.checked })}
                            style={{ width: 'auto' }}
                        />
                        <label htmlFor="fd-disp" style={{ margin: 0, fontWeight: 'normal' }}>Franja habilitada desde el alta</label>
                    </div>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}><i data-lucide="save" /> Guardar</button>
                </div>
            </div>
        </div>
    );
}
