// src/components/empleados/EmpleadoModal.jsx
import { useState, useEffect } from 'react';

const FORM_VACIO = {
    nombre: '', apellido: '', dni: '', email: '', telefono: '',
    legajo: '', userName: '', turno: '', sector: '',
    password: '', activo: 'true',
};

const ERRORES_VACIOS = {
    nombre: '', apellido: '', dni: '', email: '', telefono: '',
    legajo: '', userName: '', turno: '', sector: '', password: '',
};

function Field({ label, required, error, children }) {
    return (
        <div className="form-group">
            <label>
                {label}{required && <span className="req"> *</span>}
            </label>
            {children}
            {error && <small className="form-error">{error}</small>}
        </div>
    );
}

export default function EmpleadoModal({ open, modo, empleado, onGuardar, onCerrar }) {
    const [form, setForm]         = useState(FORM_VACIO);
    const [errores, setErrores]   = useState(ERRORES_VACIOS);
    const [showPass, setShowPass] = useState(false);

    const esNuevo = modo === 'nuevo';

    useEffect(() => {
        if (!open) return;
        if (esNuevo) {
            setForm(FORM_VACIO);
        } else if (empleado) {
            setForm({
                nombre:   empleado.nombre   || '',
                apellido: empleado.apellido || '',
                dni:      empleado.dni      || '',
                email:    empleado.email    || '',
                telefono: empleado.telefono || '',
                legajo:   empleado.legajo   || '',
                userName: empleado.userName || '',
                turno:    empleado.turno    || '',
                sector:   empleado.sector   || '',
                password: '',
                activo:   empleado.activo ? 'true' : 'false',
            });
        }
        setErrores(ERRORES_VACIOS);
        setShowPass(false);
    }, [open, modo, empleado]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, showPass]);

    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrores(prev => ({ ...prev, [field]: '' }));
    }

    function validar() {
        const errs = { ...ERRORES_VACIOS };
        let ok = true;

        if (form.nombre.trim().length < 2) { errs.nombre = 'Nombre muy corto'; ok = false; }
        if (form.apellido.trim().length < 2) { errs.apellido = 'Apellido muy corto'; ok = false; }
        if (!/^\d{7,8}$/.test(form.dni.trim())) { errs.dni = 'DNI inválido (7 u 8 dígitos)'; ok = false; }
        if (form.telefono.trim().length < 8 || form.telefono.trim().length > 20) { errs.telefono = 'Teléfono inválido'; ok = false; }
        if (!form.email.includes('@') || !form.email.includes('.')) { errs.email = 'Email inválido'; ok = false; }
        if (form.legajo.trim().length < 4) { errs.legajo = 'Legajo inválido'; ok = false; }
        if (form.userName.trim().length < 4 || form.userName.trim().length > 20) { errs.userName = 'Entre 4 y 20 caracteres'; ok = false; }
        if (!form.turno) { errs.turno = 'Seleccione un turno'; ok = false; }
        if (form.sector.trim().length < 2) { errs.sector = 'Sector muy corto'; ok = false; }
        if (esNuevo && form.password.length < 6) { errs.password = 'Mínimo 6 caracteres'; ok = false; }

        setErrores(errs);
        return ok;
    }

    function handleGuardar() {
        if (!validar()) return;

        const datos = {
            ...(empleado ? { idUsuario: empleado.idUsuario } : {}),
            nombre:   form.nombre.trim(),
            apellido: form.apellido.trim(),
            dni:      form.dni.trim(),
            email:    form.email.trim(),
            telefono: form.telefono.trim(),
            legajo:   form.legajo.trim(),
            userName: form.userName.trim(),
            turno:    form.turno,
            sector:   form.sector.trim(),
            rol:      'empleado',
            estado:   form.activo === 'true' ? 'activo' : 'inactivo',
            activo:   form.activo === 'true',
            ...(esNuevo ? { password: form.password.trim() } : {}),
        };

        onGuardar(datos);
    }

    if (!open) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{esNuevo ? 'Nuevo empleado' : 'Editar empleado'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>
                
                <div className="dash-modal-body">
                    <div className="form-row">
                        <Field label="Nombre" required error={errores.nombre}>
                            <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)} className={errores.nombre ? 'input-error-field' : ''} />
                        </Field>
                        <Field label="Apellido" required error={errores.apellido}>
                            <input type="text" value={form.apellido} onChange={e => set('apellido', e.target.value)} className={errores.apellido ? 'input-error-field' : ''} />
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="DNI" required error={errores.dni}>
                            <input type="text" value={form.dni} onChange={e => set('dni', e.target.value)} className={errores.dni ? 'input-error-field' : ''} />
                        </Field>
                        <Field label="Email" required error={errores.email}>
                            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={errores.email ? 'input-error-field' : ''} />
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Teléfono" required error={errores.telefono}>
                            <input type="text" value={form.telefono} onChange={e => set('telefono', e.target.value)} className={errores.telefono ? 'input-error-field' : ''} />
                        </Field>
                        <Field label="Legajo" required error={errores.legajo}>
                            <input type="text" value={form.legajo} onChange={e => set('legajo', e.target.value)} className={errores.legajo ? 'input-error-field' : ''} />
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Username" required error={errores.userName}>
                            <input type="text" value={form.userName} onChange={e => set('userName', e.target.value)} className={errores.userName ? 'input-error-field' : ''} />
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Turno" required error={errores.turno}>
                            <select value={form.turno} onChange={e => set('turno', e.target.value)} className={errores.turno ? 'input-error-field' : ''}>
                                <option value="">Seleccionar</option>
                                <option value="Mañana">Mañana</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noche">Noche</option>
                            </select>
                        </Field>
                        <Field label="Sector" required error={errores.sector}>
                            <input type="text" placeholder="Ej: Recepción" value={form.sector} onChange={e => set('sector', e.target.value)} className={errores.sector ? 'input-error-field' : ''} />
                        </Field>
                    </div>

                    {esNuevo && (
                        <Field label="Contraseña" required error={errores.password}>
                            <div className="pw-wrapper">
                                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className={errores.password ? 'input-error-field' : ''} />
                                <button type="button" className="pw-toggle" onClick={() => setShowPass(p => !p)}>
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </Field>
                    )}

                    {!esNuevo && (
                        <Field label="Estado">
                            <select value={form.activo} onChange={e => set('activo', e.target.value)}>
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </Field>
                    )}
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}><i data-lucide="save" />Guardar empleado</button>
                </div>
            </div>
        </div>
    );
}
