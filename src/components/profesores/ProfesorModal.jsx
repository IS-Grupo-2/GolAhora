// src/components/profesores/ProfesorModal.jsx
import { useState, useEffect } from 'react';

// ── Estado vacío del formulario ───────────────────────────────────────────────
const FORM_VACIO = {
    name:          '',
    lastName:        '',
    dni: '',
    usarName:             '',
    email:        '',
    phoneNumber:           '',
    password:        '',
    role:          '',
    legajo:    '',
    startDate: new Date().toISOString(),
    turno: '',
    specialty:        '',
    certification:          '',
};

const ERRORES_VACIOS = {
    name: '', lastName: '', dni: '', userName: '',
    email: '', phoneNumber: '', password: '', role: '',
    legajo: '', startDate: '', turno: '', specialty: '', certification: ''
};

// ── Sub-componente Field ──────────────────────────────────────────────────────
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

// ── Componente principal ──────────────────────────────────────────────────────
export default function ProfesorModal({ open, modo, profesor, onGuardar, onCerrar }) {
    const [form,     setForm]     = useState(FORM_VACIO);
    const [errores,  setErrores]  = useState(ERRORES_VACIOS);
    const [showPass, setShowPass] = useState(false);

    const esNuevo = modo === 'nuevo';

    // Poblar / limpiar al abrir
    useEffect(() => {
        if (!open) return;

        if (esNuevo) {
            setForm(FORM_VACIO);
        } else if (profesor) {
            // Formateamos las certificaciones acá, al cargar los datos en el estado
            const certs = profesor.certificaciones;
            const certsFormateadas = Array.isArray(certs) 
                ? certs.map(c => c.nombre).join(', ') 
                : (certs ?? '');

           setForm({
    name:          profesor.name          ?? '',
    lastName:      profesor.lastName      ?? '',
    dni:           profesor.dni           ?? '',
    userName:      profesor.userName      ?? '',
    email:         profesor.email         ?? '',
    phoneNumber:   profesor.phoneNumber   ?? '',
    password:      '',
    role:          profesor.role          ?? 'activo',
    legajo:        profesor.legajo        ?? '',
    startDate:     profesor.startDate     ?? '2026-06-05T02:26:29.972Z',
    turno:         profesor.turno         ?? '',
    specialty:     profesor.specialty     ?? '',
    certification: certsFormateadas
});

        }
        setErrores(ERRORES_VACIOS);
        setShowPass(false);
    }, [open, modo, profesor]);

    // Escape para cerrar
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

    // Re-inicializar Lucide cuando cambia showPass o se abre el modal
    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, showPass]);

    // ── Helpers de form ───────────────────────────────────────────────────────
    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrores(prev => ({ ...prev, [field]: '' }));
    }

    // ── Validación ────────────────────────────────────────────────────────────
   function validar() {
    const errs = { ...ERRORES_VACIOS };
    let ok = true;

    if (form.name.trim().length < 2)           { errs.name          = 'Nombre inválido';                   ok = false; }
    if (form.lastName.trim().length < 2)       { errs.lastName      = 'Apellido inválido';                 ok = false; }
    if (!/^\d{7,8}$/.test(form.dni.trim()))    { errs.dni           = 'DNI inválido (7 u 8 dígitos)';      ok = false; }
    if (!form.email.includes('@'))             { errs.email         = 'Email inválido';                    ok = false; }
    if (form.userName.trim().length < 4)       { errs.userName      = 'Username inválido (mín. 4 car.)';   ok = false; }
    if (form.legajo.trim().length < 4)         { errs.legajo        = 'Legajo inválido';                   ok = false; }
    if (form.specialty.trim().length < 2)      { errs.specialty     = 'Especialidad inválida';             ok = false; }
    if (!form.turno)                           { errs.turno         = 'Seleccione un turno';               ok = false; }
    if (esNuevo && form.password.length < 6)   { errs.password      = 'Mínimo 6 caracteres';               ok = false; }

    setErrores(errs);
    return ok;
}
function handleGuardar() {
    if (!validar()) return;

    const datos = {
        // Solo incluir id cuando estamos editando
        ...(profesor ? { idUsuario: profesor.idUsuario } : {}),
        name:          form.name.trim(),
        lastName:      form.lastName.trim(),
        dni:           form.dni.trim(),
        userName:      form.userName.trim(),
        email:         form.email.trim(),
        phoneNumber:   form.phoneNumber.trim(),
        password:      form.password, // Asegúrate de incluir el campo si es necesario
        role:          form.role,
        legajo:        form.legajo.trim(),
        startDate:     form.startDate,
        turno:         form.turno,
        specialty:     form.specialty.trim(),
        certification: form.certification.trim(),
    };

    onGuardar(datos);
}

    if (!open) return null;

    return (
      <div
    className="dash-modal-overlay activo"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-profesor-titulo"
    onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}
>
    <div className="dash-modal">
        {/* HEADER */}
        <div className="dash-modal-header">
            <h3 id="modal-profesor-titulo">
                {esNuevo ? 'Nuevo profesor' : 'Editar profesor'}
            </h3>
            <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                <i data-lucide="x" />
            </button>
        </div>

        {/* BODY */}
        <div className="dash-modal-body">

            {/* Fila 1: Name / LastName */}
            <div className="form-row">
                <Field label="Nombre" required error={errores.name}>
                    <input
                        type="text"
                        placeholder="Ej: Carlos"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        className={errores.name ? 'input-error-field' : ''}
                    />
                </Field>
                <Field label="Apellido" required error={errores.lastName}>
                    <input
                        type="text"
                        placeholder="Ej: Gómez"
                        value={form.lastName}
                        onChange={e => set('lastName', e.target.value)}
                        className={errores.lastName ? 'input-error-field' : ''}
                    />
                </Field>
            </div>

            {/* Fila 2: DNI (Fecha de nacimiento eliminada por no estar en el esquema) */}
            <div className="form-row">
                <Field label="DNI" required error={errores.dni}>
                    <input
                        type="text"
                        placeholder="Ej: 32456789"
                        inputMode="numeric"
                        maxLength={8}
                        value={form.dni}
                        onChange={e => set('dni', e.target.value)}
                        className={errores.dni ? 'input-error-field' : ''}
                    />
                </Field>
                <Field label="Email" required error={errores.email}>
                    <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        autoComplete="email"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        className={errores.email ? 'input-error-field' : ''}
                    />
                </Field>
            </div>

            {/* Fila 3: PhoneNumber / Username */}
            <div className="form-row">
                <Field label="Teléfono" error={errores.phoneNumber}>
                    <input
                        type="text"
                        placeholder="+54 11..."
                        autoComplete="tel"
                        value={form.phoneNumber}
                        onChange={e => set('phoneNumber', e.target.value)}
                        className={errores.phoneNumber ? 'input-error-field' : ''}
                    />
                </Field>
                <Field label="Username" required error={errores.userName}>
                    <input
                        type="text"
                        placeholder="Ej: cgomez"
                        autoComplete="username"
                        value={form.userName}
                        onChange={e => set('userName', e.target.value)}
                        className={errores.userName ? 'input-error-field' : ''}
                    />
                </Field>
            </div>

            {/* Fila 4: Legajo / Specialty */}
            <div className="form-row">
                <Field label="Legajo" required error={errores.legajo}>
                    <input
                        type="text"
                        placeholder="PROF-1001"
                        value={form.legajo}
                        onChange={e => set('legajo', e.target.value)}
                        className={errores.legajo ? 'input-error-field' : ''}
                    />
                </Field>
                <Field label="Especialidad" required error={errores.specialty}>
                    <input
                        type="text"
                        placeholder="Ej: Fútbol Infantil"
                        value={form.specialty}
                        onChange={e => set('specialty', e.target.value)}
                        className={errores.specialty ? 'input-error-field' : ''}
                    />
                </Field>
            </div>

            {/* Fila 5: Turno / Certificación */}
            <div className="form-row">
                <Field label="Turno" required error={errores.turno}>
                    <select
                        value={form.turno}
                        onChange={e => set('turno', e.target.value)}
                        className={errores.turno ? 'input-error-field' : ''}
                    >
                        <option value="">Seleccionar</option>
                        <option value="Mañana">Mañana</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noche">Noche</option>
                    </select>
                </Field>
                <Field label="Certificaciones" error={errores.certification}>
                    <input
                        type="text"
                        placeholder="Ej: AFA Nivel 1"
                        value={form.certification}
                        onChange={e => set('certification', e.target.value)}
                    />
                </Field>
            </div>

            {/* Contraseña — solo en alta */}
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
                    </div>
                </Field>
            )}

            {/* Rol / Estado — solo en edición */}
            {!esNuevo && (
                <Field label="Estado">
                    <select
                        value={form.role}
                        onChange={e => set('role', e.target.value)}
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
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