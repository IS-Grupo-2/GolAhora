// src/components/usuarios/UsuarioModal.jsx
import { useState, useEffect } from 'react';

// ── Estado inicial del formulario ─────────────────────────────────────────────
const FORM_VACIO = {
    name:            '',
    lastName:        '',
    dni:             '',
    userName:        '',
    email:           '',
    phoneNumber:     '',
    password:        '',
    role:            '',
    startDate: new Date().toISOString(),
    estado:          'activo',
};

const ERRORES_VACIOS = {
    name: '', lastName: '', dni: '', userName: '', email: '', phoneNumber: '', password: '', role: '', startDate: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
    return (
        <div className="form-group">
            <label>
                {label} {required && <span className="req">*</span>}
            </label>
            {children}
            {error && <small className="form-error">{error}</small>}
        </div>
    );
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function UsuarioModal({ open, modo, usuario, onGuardar, onCerrar }) {
    const [form,        setForm]       = useState(FORM_VACIO);
    const [errores,     setErrores]    = useState(ERRORES_VACIOS);
    const [showPass,    setShowPass]   = useState(false);
    const esNuevo = modo === 'nuevo';

    // Poblar / limpiar form al abrir
    useEffect(() => {
        if (!open) return;
        if (esNuevo) {
            setForm(FORM_VACIO);
        } else if (usuario) {
            setForm({
                name:            usuario.name            ?? '',
                lastName:        usuario.lastName        ?? '',
                dni:             usuario.dni             ?? '',
                phoneNumber:     usuario.phoneNumber     ?? '',
                email:           usuario.email           ?? '',
                userName:        usuario.userName        ?? '',
                password:        '',
                estado:          usuario.estado          ?? 'activo',
            });
        }
        setErrores(ERRORES_VACIOS);
        setShowPass(false);
    }, [open, modo, usuario]);

    // Cerrar con Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Lucide icons
    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, showPass]);

    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrores(prev => ({ ...prev, [field]: '' }));
    }

    // ── Validación ────────────────────────────────────────────────────────────
    function validar() {
        const errs = { ...ERRORES_VACIOS };
        let ok = true;

        if (form.name.trim().length < 2)                                  { errs.name = 'Nombre muy corto';                    ok = false; }
        if (form.lastName.trim().length < 2)                              { errs.lastName = 'Apellido muy corto';              ok = false; }
        if (!/^\d{7,8}$/.test(form.dni.trim()))                           { errs.dni = 'DNI inválido (7 u 8 dígitos)';         ok = false; }
        if (form.phoneNumber.trim().length < 8)                           { errs.phoneNumber = 'Teléfono inválido';            ok = false; }
        if (!form.email.includes('@') || !form.email.includes('.'))       { errs.email = 'Email inválido';                     ok = false; }
        if (form.userName.trim().length < 4 || form.userName.trim().length > 20) { errs.userName = 'Entre 4 y 20 caracteres';  ok = false; }
        if (esNuevo && form.password.length < 6)                          { errs.password = 'Mínimo 6 caracteres';             ok = false; }

        setErrores(errs);
        return ok;
    }

    function handleGuardar() {
        if (!validar()) return;
        const datos = {
            ...(usuario ? { id: usuario.id } : {}),
            name:            form.name.trim(),
            lastName:        form.lastName.trim(),
            dni:             form.dni.trim(),
            phoneNumber:     form.phoneNumber.trim(),
            email:           form.email.trim(),
            userName:        form.userName.trim(),
            estado:          form.estado,
            ...(esNuevo ? { password: form.password.trim() } : {}),
        };
        onGuardar(datos);
    }

    if (!open) return null;

    return (
        <div
            className="dash-modal-overlay activo"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-usuario-titulo"
            onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}
        >
            <div className="dash-modal">
                {/* HEADER */}
                <div className="dash-modal-header">
                    <h3 id="modal-usuario-titulo">
                        {esNuevo ? 'Nuevo cliente' : 'Editar cliente'}
                    </h3>
                    <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                        <i data-lucide="x" />
                    </button>
                </div>

                {/* BODY */}
                <div className="dash-modal-body">
                    <div className="form-row">
                        <Field label="Nombre(s)" required error={errores.name}>
                            <input
                                type="text"
                                placeholder="Ej: Juan Pablo"
                                autoComplete="given-name"
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                className={errores.name ? 'input-error-field' : ''}
                            />
                        </Field>
                        <Field label="Apellido" required error={errores.lastName}>
                            <input
                                type="text"
                                placeholder="Ej: Pérez"
                                autoComplete="family-name"
                                value={form.lastName}
                                onChange={e => set('lastName', e.target.value)}
                                className={errores.lastName ? 'input-error-field' : ''}
                            />
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="DNI" required error={errores.dni}>
                            <input
                                type="text"
                                placeholder="Ej: 40255711"
                                inputMode="numeric"
                                maxLength={8}
                                value={form.dni}
                                onChange={e => set('dni', e.target.value)}
                                className={errores.dni ? 'input-error-field' : ''}
                            />
                        </Field>
                        <Field label="Teléfono" required error={errores.phoneNumber}>
                            <input
                                type="text"
                                placeholder="+54 11..."
                                autoComplete="tel"
                                value={form.phoneNumber}
                                onChange={e => set('phoneNumber', e.target.value)}
                                className={errores.phoneNumber ? 'input-error-field' : ''}
                            />
                        </Field>
                    </div>

                    <Field label="Correo electrónico" required error={errores.email}>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            autoComplete="email"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            className={errores.email ? 'input-error-field' : ''}
                        />
                    </Field>

                    <div className="form-row">
                        <Field label="Nombre de usuario" required error={errores.userName}>
                            <input
                                type="text"
                                placeholder="usuario123"
                                autoComplete="username"
                                value={form.userName}
                                onChange={e => set('userName', e.target.value)}
                                className={errores.userName ? 'input-error-field' : ''}
                            />
                        </Field>
                        {/* Estado visible sólo en edición */}
                        {!esNuevo && (
                            <Field label="Estado">
                                <select
                                    value={form.estado}
                                    onChange={e => set('estado', e.target.value)}
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </Field>
                        )}
                    </div>

                    {/* Contraseña sólo en alta */}
                    {esNuevo && (
                        <Field label="Contraseña" required error={errores.password}>
                            <div className="pw-wrapper">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    className={errores.password ? 'input-error-field' : ''}
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    aria-label="Mostrar contraseña"
                                    onClick={() => setShowPass(p => !p)}
                                >
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </Field>
                    )}
                </div>

                {/* FOOTER */}
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}>
                        <i data-lucide="save" />
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}