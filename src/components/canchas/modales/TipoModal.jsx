import { useState, useEffect } from 'react';

// ==========================================
// 1. TipoModal (Formulario)
// ==========================================
export default function TipoModal({ open, modo, tipo, onGuardar, onCerrar }) {
    const defaultForm = { name: '', superficie: '', capacity: '', pricePerHour: '', description: '' };
    const [form, setForm] = useState(defaultForm);
    const [errores, setErrores] = useState(defaultForm);

    useEffect(() => {
        if (open) setForm(tipo ? { ...tipo } : defaultForm);
        setErrores(defaultForm);
    }, [open, tipo]);

    if (!open) return null;

    function handleGuardar() {
        let errs = { ...defaultForm }, ok = true;
        const cap = parseInt(form.capacity), pre = parseFloat(form.pricePerHour);

        if (form.name.trim().length < 2) { errs.name = 'Muy corto'; ok = false; }
        if (form.superficie.trim().length < 2) { errs.superficie = 'Requerido'; ok = false; }
        if (!cap || cap < 2) { errs.capacity = 'Mín. 2'; ok = false; }
        if (!pre || pre < 0) { errs.pricePerHour = 'Inválido'; ok = false; }

        setErrores(errs);
        if (ok) onGuardar({ ...form, capacity: cap, pricePerHour: pre });
    }

    return (
        <div className="dash-modal-overlay activo" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
    <div className="dash-modal">
        <div className="dash-modal-header">
            <h3>{modo === 'nuevo' ? 'Nuevo tipo de cancha' : 'Editar tipo'}</h3>
            <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
        </div>
        <div className="dash-modal-body">
            <div className="form-row">
                <div className="form-group">
                    <label>Nombre <span className="req">*</span></label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={errores.name ? 'input-error-field' : ''} />
                    <span className="form-error">{errores.name}</span>
                </div>
                <div className="form-group">
                    <label>Superficie <span className="req">*</span></label>
                    <input type="text" value={form.superficie} onChange={e => setForm({...form, superficie: e.target.value})} className={errores.superficie ? 'input-error-field' : ''} />
                    <span className="form-error">{errores.superficie}</span>
                </div>
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Capacidad <span className="req">*</span></label>
                    <input type="number" min="2" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className={errores.capacity ? 'input-error-field' : ''} />
                    <span className="form-error">{errores.capacity}</span>
                </div>
            </div>

            <div className="form-group">
                <label>Precio/hora ($) <span className="req">*</span></label>
                <input type="number" min="0" value={form.pricePerHour} onChange={e => setForm({...form, pricePerHour: e.target.value})} className={errores.pricePerHour ? 'input-error-field' : ''} />
                <span className="form-error">{errores.pricePerHour}</span>
            </div>

            <div className="form-group">
                <label>DescripciÃ³n</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
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

// (Crea y exporta de forma similar TipoModalDetalle y TipoModalBaja utilizando los esquemas de Canchas)