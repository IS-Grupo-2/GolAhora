// src/components/clases/ClaseModal.jsx
import { useState, useEffect } from 'react';

const FORM_VACIO = {
    nombre: '', descripcion: '', tipoClase: '', idProfesor: '',
    cancha: '', fecha: '', horario: '', duracionMin: 60,
    maxAlumnos: 10, precio: 0, estado: 'programada',
};

const ERRORES_VACIOS = {
    nombre: '', tipoClase: '', cancha: '', fecha: '', horario: '', maxAlumnos: ''
};

function Field({ label, required, error, children }) {
    return (
        <div className="form-group">
            <label>{label}{required && <span className="req"> *</span>}</label>
            {children}
            {error && <small className="form-error">{error}</small>}
        </div>
    );
}

export default function ClaseModal({ open, modo, clase, profesoresDisp, alumnosDisp = [], onGuardar, onCerrar }) {
    const [form, setForm] = useState(FORM_VACIO);
    const [errores, setErrores] = useState(ERRORES_VACIOS);
    const [alumnosBusqueda, setAlumnosBusqueda] = useState('');
    const [selectedAlumnoIds, setSelectedAlumnoIds] = useState([]);
    const esNuevo = modo === 'nuevo';

    const alumnosFiltrados = (alumnosDisp || []).filter(al => {
        const q = alumnosBusqueda.toLowerCase();
        return (
            `${al.nombre} ${al.apellido}`.toLowerCase().includes(q) ||
            al.email.toLowerCase().includes(q)
        );
    });

    useEffect(() => {
        if (!open) return;
        if (esNuevo) {
            setForm(FORM_VACIO);
            setSelectedAlumnoIds([]);
        } else if (clase) {
            setForm({
                nombre: clase.nombre || '',
                descripcion: clase.descripcion || '',
                tipoClase: clase.tipoClase || '',
                idProfesor: clase.profesor?.idUsuario || clase.profesor?.id || '',
                cancha: clase.cancha || '',
                fecha: clase.fecha || '',
                horario: clase.horario || '',
                duracionMin: clase.duracionMin || 60,
                maxAlumnos: clase.maxAlumnos || 10,
                precio: clase.precio || 0,
                estado: clase.estado || 'programada',
            });
            setSelectedAlumnoIds((clase.alumnos || []).map(al => al.id));
        }
        setAlumnosBusqueda('');
        setErrores(ERRORES_VACIOS);
    }, [open, modo, clase, esNuevo]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrores(prev => ({ ...prev, [field]: '' }));
        if (field === 'maxAlumnos' && Number(value) < selectedAlumnoIds.length) {
            setSelectedAlumnoIds(prev => prev.slice(0, Number(value)));
        }
    }

    function validar() {
        const errs = { ...ERRORES_VACIOS };
        let ok = true;
        if (form.nombre.trim().length < 3) { errs.nombre = 'Nombre muy corto'; ok = false; }
        if (!form.tipoClase) { errs.tipoClase = 'Seleccione un tipo'; ok = false; }
        if (!form.cancha) { errs.cancha = 'Seleccione una cancha'; ok = false; }
        if (!form.fecha) { errs.fecha = 'Seleccione fecha'; ok = false; }
        if (!form.horario) { errs.horario = 'Seleccione horario'; ok = false; }
        if (form.maxAlumnos < 1) { errs.maxAlumnos = 'Mínimo 1 alumno'; ok = false; }
        setErrores(errs);
        return ok;
    }

    function toggleAlumno(id) {
        setSelectedAlumnoIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : prev.length < Number(form.maxAlumnos)
                    ? [...prev, id]
                    : prev
        );
    }

    function handleGuardar() {
        if (!validar()) return;
        
        const idProfesor = Number(form.idProfesor);
        const profSeleccionado = profesoresDisp.find(p =>
            p.idUsuario === idProfesor || p.id === idProfesor
        ) || null;
        const alumnosSeleccionados = alumnosDisp
            .filter(al => selectedAlumnoIds.includes(al.id))
            .map(al => ({ id: al.id, nombre: `${al.nombre} ${al.apellido}`, presente: false, email: al.email }));

        const datos = {
            ...(clase ? { idClase: clase.idClase } : {}),
            nombre: form.nombre.trim(),
            descripcion: form.descripcion.trim(),
            tipoClase: form.tipoClase,
            profesor: profSeleccionado,
            cancha: form.cancha,
            fecha: form.fecha,
            horario: form.horario,
            duracionMin: Number(form.duracionMin),
            maxAlumnos: Number(form.maxAlumnos),
            precio: Number(form.precio),
            estado: form.estado,
            alumnos: alumnosSeleccionados,
        };
        onGuardar(datos);
    }

    if (!open) return null;

    return (
        <div className="dash-modal-overlay activo" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{esNuevo ? 'Programar Clase' : 'Modificar Clase'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <div className="form-row">
                        <Field label="Nombre de la Clase" required error={errores.nombre}>
                            <input type="text" placeholder="Ej: Entrenamiento Táctico" value={form.nombre} onChange={e => set('nombre', e.target.value)} className={errores.nombre ? 'input-error-field' : ''} />
                        </Field>
                        <Field label="Tipo" required error={errores.tipoClase}>
                            <select value={form.tipoClase} onChange={e => set('tipoClase', e.target.value)} className={errores.tipoClase ? 'input-error-field' : ''}>
                                <option value="">Seleccionar</option>
                                <option value="Grupal">Grupal</option>
                                <option value="Particular">Particular (1 a 1)</option>
                                <option value="Escuelita">Escuelita Infantil</option>
                            </select>
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Profesor Asignado">
                            <select value={form.idProfesor} onChange={e => set('idProfesor', e.target.value)}>
                                <option value="">Sin asignar / A definir</option>
                                {profesoresDisp.map(p => (
                                    <option key={p.idUsuario || p.id} value={p.idUsuario || p.id}>
                                        {p.nombre} {p.apellido} {p.verificacionCertificacion ? '(Certificado)' : ''}
                                    </option>
                                ))}
                            </select>
                            {profesoresDisp.length === 0 && (
                                <small style={{ color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                                    No hay profesores con certificacion verificada disponibles.
                                </small>
                            )}
                        </Field>
                        <Field label="Cancha" required error={errores.cancha}>
                            <select value={form.cancha} onChange={e => set('cancha', e.target.value)} className={errores.cancha ? 'input-error-field' : ''}>
                                <option value="">Seleccionar</option>
                                <option value="Cancha 1 (F5)">Cancha 1 (Fútbol 5)</option>
                                <option value="Cancha 2 (F7)">Cancha 2 (Fútbol 7)</option>
                                <option value="Pista Funcional">Pista Funcional</option>
                            </select>
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Fecha" required error={errores.fecha}>
                            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className={errores.fecha ? 'input-error-field' : ''} />
                        </Field>
                        <Field label="Horario Inicio" required error={errores.horario}>
                            <input type="time" value={form.horario} onChange={e => set('horario', e.target.value)} className={errores.horario ? 'input-error-field' : ''} />
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Duración (minutos)">
                            <input type="number" min="30" step="15" value={form.duracionMin} onChange={e => set('duracionMin', e.target.value)} />
                        </Field>
                        <Field label="Capacidad Máxima" required error={errores.maxAlumnos}>
                            <input type="number" min="1" value={form.maxAlumnos} onChange={e => set('maxAlumnos', e.target.value)} className={errores.maxAlumnos ? 'input-error-field' : ''} />
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Precio / Costo ($)">
                            <input type="number" min="0" value={form.precio} onChange={e => set('precio', e.target.value)} />
                        </Field>
                        {!esNuevo && (
                            <Field label="Estado de la Clase">
                                <select value={form.estado} onChange={e => set('estado', e.target.value)}>
                                    <option value="programada">Programada</option>
                                    <option value="en_curso">En Curso</option>
                                    <option value="finalizada">Finalizada</option>
                                </select>
                            </Field>
                        )}
                    </div>

                    <Field label="Descripción / Planificación">
                        <textarea rows="2" placeholder="Notas sobre la clase..." value={form.descripcion} onChange={e => set('descripcion', e.target.value)} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '0.5rem', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}></textarea>
                    </Field>

                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>Alumnos inscriptos</label>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedAlumnoIds.length} / {form.maxAlumnos}</span>
                        </div>
                        <input
                            type="search"
                            placeholder="Buscar alumno..."
                            value={alumnosBusqueda}
                            onChange={e => setAlumnosBusqueda(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.55rem 0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                marginBottom: '0.85rem'
                            }}
                        />
                        <div style={{ display: 'grid', gap: '0.55rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '2px' }}>
                            {alumnosFiltrados.length === 0 ? (
                                <div style={{ padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No se encontraron alumnos.
                                </div>
                            ) : (
                                alumnosFiltrados.map(al => {
                                    const seleccionado = selectedAlumnoIds.includes(al.id);
                                    const disabled = !seleccionado && selectedAlumnoIds.length >= Number(form.maxAlumnos);
                                    return (
                                        <label key={al.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            padding: '0.85rem 0.95rem',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '12px',
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                            opacity: disabled ? 0.55 : 1,
                                        }}>
                                            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{al.nombre} {al.apellido}</strong>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{al.email}</span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={seleccionado}
                                                disabled={disabled}
                                                onChange={() => toggleAlumno(al.id)}
                                                style={{ width: '18px', height: '18px', cursor: disabled ? 'not-allowed' : 'pointer' }}
                                            />
                                        </label>
                                    );
                                })
                            )}
                        </div>
                        {selectedAlumnoIds.length >= Number(form.maxAlumnos) && (
                            <p style={{ fontSize: '0.78rem', color: '#a16207', margin: '0.75rem 0 0' }}>
                                Se alcanzó la capacidad máxima de alumnos para esta clase.
                            </p>
                        )}
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}>
                        <i data-lucide="save" /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
