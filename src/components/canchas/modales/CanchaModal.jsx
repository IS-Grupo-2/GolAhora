import { useState, useEffect } from 'react';

function Field({ label, required, error, children }) {
    return (
        <div className="form-group">
            <label>{label}{required && <span className="req"> *</span>}</label>
            {children}
            {error && <span className="form-error">{error}</span>}
        </div>
    );
}

// ==========================================
// 1. CanchaModal (Formulario)
// ==========================================
export default function CanchaModal({ open, modo, cancha, tipos, canchasActivas, onGuardar, onCerrar }) {
    const defaultForm = { numero: '', nombre: '', idTipo: '', descripcion: '' };
    const [form, setForm] = useState(defaultForm);
    const [errores, setErrores] = useState(defaultForm);

    useEffect(() => {
        if (!open) return;
        setForm(cancha ? {
            numero: cancha.numero, nombre: cancha.nombre, idTipo: cancha.idTipo, descripcion: cancha.descripcion || ''
        } : defaultForm);
        setErrores(defaultForm);
    }, [open, cancha]);

    if (!open) return null;

    function handleGuardar() {
        let errs = { ...defaultForm }, ok = true;
        const numero = parseInt(form.numero);

        if (!numero || numero < 1) { errs.numero = 'Válido'; ok = false; }
        if (form.nombre.trim().length < 2) { errs.nombre = 'Muy corto'; ok = false; }
        if (!form.idTipo) { errs.idTipo = 'Seleccione'; ok = false; }

        if (canchasActivas.some(c => c.numero === numero && (!cancha || c.id !== cancha.id))) {
            errs.numero = 'Número en uso'; ok = false;
        }

        setErrores(errs);
        if (ok) onGuardar({
            ...(cancha ? { id: cancha.id, estado: cancha.estado, activa: cancha.activa } : {}),
            ...form,
            numero,
            idTipo: parseInt(form.idTipo),
            tipoCanchaId: parseInt(form.idTipo),
        });
    }

    return (
        <div className="dash-modal-overlay activo" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{modo === 'nuevo' ? 'Nueva cancha' : 'Editar cancha'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <div className="form-row">
                        <Field label="Número" required error={errores.numero}>
                            <input type="number" min="1" value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} className={errores.numero ? 'input-error-field' : ''} />
                        </Field>
                        <Field label="Nombre" required error={errores.nombre}>
                            <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className={errores.nombre ? 'input-error-field' : ''} />
                        </Field>
                    </div>
                    <Field label="Tipo de cancha" required error={errores.idTipo}>
                        <select value={form.idTipo} onChange={e => setForm({...form, idTipo: e.target.value})} className={errores.idTipo ? 'input-error-field' : ''}>
                            <option value="">— Seleccionar —</option>
                            {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </Field>
                    <Field label="Descripción">
                        <textarea rows="3" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}></textarea>
                    </Field>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}><i data-lucide="save" /> Guardar</button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 2. CanchaModalDetalle (Read-only)
// ==========================================
export function CanchaModalDetalle({ open, cancha, tipos, onCerrar }) {
    if (!open || !cancha) return null;
    const tipo = tipos.find(t => t.id === cancha.idTipo);

    return (
        <div className="dash-modal-overlay activo" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>Detalle de cancha</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <div className="detalle-grid">
                        <div className="det-row"><span>Número</span><strong>{cancha.numero}</strong></div>
                        <div className="det-row"><span>Nombre</span><strong>{cancha.nombre}</strong></div>
                        <div className="det-row"><span>Tipo</span><strong>{tipo?.nombre || '—'}</strong></div>
                        <div className="det-row"><span>Capacidad</span><strong>{tipo?.capacidadJugadores || '—'} jug.</strong></div>
                        <div className="det-row"><span>Precio/hora</span><strong>{tipo ? `$${tipo.precioHora.toLocaleString('es-AR')}` : '—'}</strong></div>
                        <div className="det-row"><span>Estado</span><span className={`badge ${cancha.estado === 'activa' ? 'success' : 'danger'}`}>{cancha.estado === 'activa' ? 'Activa' : 'Inactiva'}</span></div>
                        <div className="det-row full"><span>Descripción</span><strong>{cancha.descripcion || '—'}</strong></div>
                    </div>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 3. CanchaModalBaja
// ==========================================
export function CanchaModalBaja({ open, cancha, onConfirmar, onCerrar }) {
    if (!open || !cancha) return null;
    const esBaja = cancha.estado === 'activa';

    return (
        <div className="dash-modal-overlay activo" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>{esBaja ? 'Deshabilitar cancha' : 'Reactivar cancha'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                        {esBaja 
                            ? <>¿Deshabilitar a <strong>"{cancha.nombre}"</strong>? Se bloquearán todas sus disponibilidades vinculadas.</>
                            : <>¿Reactivar <strong>"{cancha.nombre}"</strong>?</>}
                    </p>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-danger" onClick={() => onConfirmar(cancha)}>
                        <i data-lucide="power" /> Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
