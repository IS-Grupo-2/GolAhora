// src/components/canchas/modales/DispModal.jsx
import { useState, useEffect } from 'react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DispModal({ open, modo, disp, idCanchaFallback, canchas, dispsExistentes, onGuardar, onCerrar }) {
    const defaultForm = { idCancha: '', diaSemana: '', horaInicio: 8, horaFin: 23, disponible: true };
    const [form, setForm] = useState(defaultForm);
    const [errores, setErrores] = useState({ idCancha: '', diaSemana: '', horaInicio: '', horaFin: '' });

    useEffect(() => {
        if (!open) return;
        setForm(disp ? { ...disp } : { ...defaultForm, idCancha: idCanchaFallback || '' });
        setErrores({ idCancha: '', diaSemana: '', horaInicio: '', horaFin: '' });
    }, [open, disp, idCanchaFallback]);

    if (!open) return null;

    function handleGuardar() {
        let errs = { idCancha: '', diaSemana: '', horaInicio: '', horaFin: '' }, ok = true;
        const inicio = parseInt(form.horaInicio), fin = parseInt(form.horaFin), idCancha = parseInt(form.idCancha);

        if (!idCancha) { errs.idCancha = 'Requerido'; ok = false; }
        if (!form.diaSemana) { errs.diaSemana = 'Requerido'; ok = false; }
        if (fin <= inicio) { errs.horaFin = 'Debe ser mayor al inicio'; ok = false; }

        if (ok) {
            // Lógica de Solapamiento
            const solapado = dispsExistentes.some(d => {
                if (d.idCancha !== idCancha || d.diaSemana !== form.diaSemana) return false;
                if (disp && d.id === disp.id) return false;
                return (inicio < d.horaFin) && (fin > d.horaInicio);
            });

            if (solapado) {
                errs.horaInicio = 'Solapamiento con otra franja';
                errs.horaFin = 'Verifique el horario';
                ok = false;
            }
        }

        setErrores(errs);
        if (ok) onGuardar({ ...form, idCancha, horaInicio: inicio, horaFin: fin });
    }

    const opcionesHora = Array.from({length: 24}, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>);

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
                        <select value={form.idCancha} onChange={e => setForm({...form, idCancha: e.target.value})} className={errores.idCancha ? 'input-error-field' : ''}>
                            <option value="">— Seleccionar —</option>
                            {canchas.filter(c => c.estado === 'activa').map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                        <span className="form-error">{errores.idCancha}</span>
                    </div>
                    <div className="form-group">
                        <label>Día de la semana <span className="req">*</span></label>
                        <select value={form.diaSemana} onChange={e => setForm({...form, diaSemana: e.target.value})} className={errores.diaSemana ? 'input-error-field' : ''}>
                            <option value="">— Seleccionar —</option>
                            {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <span className="form-error">{errores.diaSemana}</span>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Hora inicio <span className="req">*</span></label>
                            <select value={form.horaInicio} onChange={e => setForm({...form, horaInicio: e.target.value})} className={errores.horaInicio ? 'input-error-field' : ''}>{opcionesHora}</select>
                            <span className="form-error">{errores.horaInicio}</span>
                        </div>
                        <div className="form-group">
                            <label>Hora fin <span className="req">*</span></label>
                            <select value={form.horaFin} onChange={e => setForm({...form, horaFin: e.target.value})} className={errores.horaFin ? 'input-error-field' : ''}>{opcionesHora}</select>
                            <span className="form-error">{errores.horaFin}</span>
                        </div>
                    </div>
                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id="fd-disp" checked={form.disponible} onChange={e => setForm({...form, disponible: e.target.checked})} style={{ width: 'auto' }} />
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