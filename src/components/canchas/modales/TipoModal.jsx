import { useState, useEffect } from 'react';

// ==========================================
// 1. TipoModal (Formulario)
// ==========================================
export default function TipoModal({ open, modo, tipo, onGuardar, onCerrar }) {
    const defaultForm = { nombre: '', superficie: '', capacidadJugadores: '', duracionMaxReservaMin: '', precioHora: '', descripcion: '' };
    const [form, setForm] = useState(defaultForm);
    const [errores, setErrores] = useState(defaultForm);

    useEffect(() => {
        if (open) setForm(tipo ? { ...tipo } : defaultForm);
        setErrores(defaultForm);
    }, [open, tipo]);

    if (!open) return null;

    function handleGuardar() {
        let errs = { ...defaultForm }, ok = true;
        const cap = parseInt(form.capacidadJugadores), dur = parseInt(form.duracionMaxReservaMin), pre = parseFloat(form.precioHora);

        if (form.nombre.trim().length < 2) { errs.nombre = 'Muy corto'; ok = false; }
        if (form.superficie.trim().length < 2) { errs.superficie = 'Requerido'; ok = false; }
        if (!cap || cap < 2) { errs.capacidadJugadores = 'Mín. 2'; ok = false; }
        if (!dur || dur < 30) { errs.duracionMaxReservaMin = 'Mín. 30'; ok = false; }
        if (!pre || pre < 0) { errs.precioHora = 'Inválido'; ok = false; }

        setErrores(errs);
        if (ok) onGuardar({ ...form, capacidadJugadores: cap, duracionMaxReservaMin: dur, precioHora: pre });
    }

    return (
        <div className="dash-modal-overlay activo" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{modo === 'nuevo' ? 'Nuevo tipo de cancha' : 'Editar tipo'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    {/* Campos adaptados con tu HTML */}
                    <div className="form-row">
                        <div className="form-group"><label>Nombre <span className="req">*</span></label><input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className={errores.nombre ? 'input-error-field' : ''} /><span className="form-error">{errores.nombre}</span></div>
                        <div className="form-group"><label>Superficie <span className="req">*</span></label><input type="text" value={form.superficie} onChange={e => setForm({...form, superficie: e.target.value})} className={errores.superficie ? 'input-error-field' : ''} /><span className="form-error">{errores.superficie}</span></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>Jugadores <span className="req">*</span></label><input type="number" min="2" value={form.capacidadJugadores} onChange={e => setForm({...form, capacidadJugadores: e.target.value})} className={errores.capacidadJugadores ? 'input-error-field' : ''} /><span className="form-error">{errores.capacidadJugadores}</span></div>
                        <div className="form-group"><label>Duración máx. (min) <span className="req">*</span></label><input type="number" min="30" step="30" value={form.duracionMaxReservaMin} onChange={e => setForm({...form, duracionMaxReservaMin: e.target.value})} className={errores.duracionMaxReservaMin ? 'input-error-field' : ''} /><span className="form-error">{errores.duracionMaxReservaMin}</span></div>
                    </div>
                    <div className="form-group"><label>Precio/hora ($) <span className="req">*</span></label><input type="number" min="0" value={form.precioHora} onChange={e => setForm({...form, precioHora: e.target.value})} className={errores.precioHora ? 'input-error-field' : ''} /><span className="form-error">{errores.precioHora}</span></div>
                    <div className="form-group"><label>Descripción</label><textarea rows="2" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}></textarea></div>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}><i data-lucide="save" /> Guardar</button>
                </div>
            </div>
        </div>
    );
}

// (Crea y exporta de forma similar TipoModalDetalle y TipoModalBaja utilizando los esquemas de Canchas)