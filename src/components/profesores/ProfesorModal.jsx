// src/components/profesores/ProfesorModal.jsx
import { useState, useEffect } from 'react';

// ── Estado vacío del formulario ───────────────────────────────────────────────
const FORM_VACIO = {
    nombre:          '',
    apellido:        '',
    fechaNacimiento: '',
    dni:             '',
    telefono:        '',
    email:           '',
    username:        '',
    legajo:          '',
    especialidad:    '',
    turno:           '',
    certificaciones: '',
    password:        '',
    rol:             '',
    estado:          'activo',
};

const ERRORES_VACIOS = {
    nombre: '', apellido: '', fechaNacimiento: '', dni: '',
    telefono: '', email: '', username: '', legajo: '',
    especialidad: '', turno: '', certificaciones: '',
    password: '', rol: '', estado: '',
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
                nombre:          profesor.nombre          ?? '',
                apellido:        profesor.apellido        ?? '',
                fechaNacimiento: profesor.fechaNacimiento ?? '',
                dni:             profesor.dni             ?? '',
                telefono:        profesor.telefono        ?? '',
                email:           profesor.email           ?? '',
                username:        profesor.username        ?? '',
                legajo:          profesor.legajo          ?? '',
                especialidad:    profesor.especialidad    ?? '',
                turno:           profesor.turno           ?? '',
                certificaciones: certsFormateadas,
                password:        '',
                rol:             profesor.rol             ?? 'profesor',
                estado:          profesor.estado          ?? (profesor.activo ? 'activo' : 'inactivo'),
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

        if (form.nombre.trim().length < 2)         { errs.nombre        = 'Nombre inválido';                   ok = false; }
        if (form.apellido.trim().length < 2)       { errs.apellido      = 'Apellido inválido';                 ok = false; }
        if (!form.fechaNacimiento)                 { errs.fechaNacimiento = 'Ingrese fecha';                  ok = false; }
        if (!/^\d{7,8}$/.test(form.dni.trim()))    { errs.dni           = 'DNI inválido (7 u 8 dígitos)';      ok = false; }
        if (!form.email.includes('@'))             { errs.email         = 'Email inválido';                    ok = false; }
        if (form.username.trim().length < 4)       { errs.username      = 'Username inválido (mín. 4 car.)';   ok = false; }
        if (form.legajo.trim().length < 4)         { errs.legajo        = 'Legajo inválido';                   ok = false; }
        if (form.especialidad.trim().length < 2)   { errs.especialidad  = 'Especialidad inválida';             ok = false; }
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
        nombre:          form.nombre.trim(),
        apellido:        form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento,
        dni:           form.dni.trim(),
        username:      form.username.trim(),
        email:         form.email.trim(),
        telefono:      form.telefono.trim(),
        password:      form.password, // Asegúrate de incluir el campo si es necesario
        rol:           form.rol || 'profesor',
        legajo:        form.legajo.trim(),
        turno:         form.turno,
        especialidad:  form.especialidad.trim(),
        certificaciones: form.certificaciones.trim(),
        estado:        form.estado,
        activo:        form.estado === 'activo',
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
                <Field label="Nombre" required error={errores.nombre}>
                    <input
                        type="text"
                        placeholder="Ej: Carlos"
                        value={form.nombre}
                        onChange={e => set('nombre', e.target.value)}
                        className={errores.nombre ? 'input-error-field' : ''}
                    />
                </Field>
                <Field label="Apellido" required error={errores.apellido}>
                    <input
                        type="text"
                        placeholder="Ej: Gómez"
                        value={form.apellido}
                        onChange={e => set('apellido', e.target.value)}
                        className={errores.apellido ? 'input-error-field' : ''}
                    />
                </Field>
            </div>

            {/* Fila 2: DNI (Fecha de nacimiento eliminada por no estar en el esquema) */}
            <div className="form-row">
                <Field label="Fecha de nacimiento" required error={errores.fechaNacimiento}>
                    <input
                        type="date"
                        value={form.fechaNacimiento}
                        onChange={e => set('fechaNacimiento', e.target.value)}
                        className={errores.fechaNacimiento ? 'input-error-field' : ''}
                    />
                </Field>
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
            </div>

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

            {/* Fila 3: PhoneNumber / Username */}
            <div className="form-row">
                <Field label="Teléfono" error={errores.telefono}>
                    <input
                        type="text"
                        placeholder="+54 11..."
                        autoComplete="tel"
                        value={form.telefono}
                        onChange={e => set('telefono', e.target.value)}
                        className={errores.telefono ? 'input-error-field' : ''}
                    />
                </Field>
                <Field label="Username" required error={errores.username}>
                    <input
                        type="text"
                        placeholder="Ej: cgomez"
                        autoComplete="username"
                        value={form.username}
                        onChange={e => set('username', e.target.value)}
                        className={errores.username ? 'input-error-field' : ''}
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
                <Field label="Especialidad" required error={errores.especialidad}>
                    <input
                        type="text"
                        placeholder="Ej: Fútbol Infantil"
                        value={form.especialidad}
                        onChange={e => set('especialidad', e.target.value)}
                        className={errores.especialidad ? 'input-error-field' : ''}
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
                <Field label="Certificaciones" error={errores.certificaciones}>
                    <input
                        type="text"
                        placeholder="Ej: AFA Nivel 1"
                        value={form.certificaciones}
                        onChange={e => set('certificaciones', e.target.value)}
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
                        value={form.estado}
                        onChange={e => set('estado', e.target.value)}
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
