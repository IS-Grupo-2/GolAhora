// src/components/clases/ClaseModal.jsx
import { useState, useEffect, useMemo } from 'react';
import { useCanchas } from '../../context/CanchasContext';
import { useReservas } from '../../context/ReservasContext';
import { useClases } from '../../context/ClasesContext';
import { diaSemanaDeFecha, horaAMinutos, minutosAHora } from '../../utils/reservasDisponibilidad';

const FORM_VACIO = {
    nombre: '', descripcion: '', tipoClase: '', idProfesor: '',
    cancha: '', fecha: '', horario: '', duracionMin: 60,
    maxAlumnos: 10, precio: 0, estado: 'programada',
};

const ERRORES_VACIOS = {
    nombre: '', tipoClase: '', cancha: '', fecha: '', horario: '', maxAlumnos: ''
};

function seSolapan(inicioA, finA, inicioB, finB) {
    return inicioA < finB && finA > inicioB;
}

function resolverCanchaSeleccionada(valor, canchas) {
    if (!valor) return null;
    const numero = String(valor).match(/cancha\s*(\d+)/i)?.[1];
    const id = Number(valor);

    return canchas.find(c =>
        Number(c.id) === id ||
        (numero && Number(c.numero) === Number(numero)) ||
        c.nombre === valor
    ) || null;
}

function idCanchaReserva(reserva) {
    return Number(reserva?.cancha?.idCancha ?? reserva?.cancha?.id ?? reserva?.idCancha ?? reserva?.canchaId);
}

function idCanchaClase(clase, canchas) {
    const idDirecto = Number(clase?.cancha?.idCancha ?? clase?.cancha?.id ?? clase?.idCancha ?? clase?.canchaId);
    if (idDirecto) return idDirecto;
    return Number(resolverCanchaSeleccionada(clase?.cancha, canchas)?.id);
}

function Field({ label, required, error, children }) {
    return (
        <div className="form-group">
            <label>{label}{required && <span className="req"> *</span>}</label>
            {children}
            {error && <small className="form-error">{error}</small>}
        </div>
    );
}

export default function ClaseModal({ open, modo, clase, profesoresDisp, onGuardar, onCerrar }) {
    const { canchas, disponibilidades } = useCanchas();
    const { reservas = [] } = useReservas();
    const { clases = [] } = useClases();
    const [form, setForm] = useState(FORM_VACIO);
    const [errores, setErrores] = useState(ERRORES_VACIOS);
    const esNuevo = modo === 'nuevo';

    const disponibilidadClase = useMemo(() => {
        if (!form.cancha || !form.fecha || !form.horario || !form.duracionMin) return null;

        const canchaSeleccionada = resolverCanchaSeleccionada(form.cancha, canchas);
        if (!canchaSeleccionada) return { ok: false, mensaje: 'Seleccione una cancha valida.' };
        if (canchaSeleccionada.estado === 'inactiva') return { ok: false, mensaje: 'La cancha seleccionada no esta activa.' };

        const inicio = horaAMinutos(form.horario);
        const fin = inicio + Number(form.duracionMin || 0);
        if (fin <= inicio) return { ok: false, mensaje: 'La duracion de la clase debe ser mayor a cero.' };

        const diaSemana = diaSemanaDeFecha(form.fecha);
        const franjasCanchaDia = disponibilidades.filter(d =>
            Number(d.idCancha ?? d.canchaId) === Number(canchaSeleccionada.id) &&
            d.diaSemana === diaSemana
        );

        const franjaHabilitada = franjasCanchaDia.some(d =>
            d.disponible === true &&
            inicio >= Number(d.horaInicio) * 60 &&
            fin <= Number(d.horaFin) * 60
        );

        if (!franjaHabilitada) {
            return {
                ok: false,
                mensaje: `La cancha no tiene disponibilidad habilitada para ${diaSemana} de ${minutosAHora(inicio)} a ${minutosAHora(fin)}.`
            };
        }

        const franjaBloqueada = franjasCanchaDia.some(d =>
            d.disponible === false &&
            seSolapan(inicio, fin, Number(d.horaInicio) * 60, Number(d.horaFin) * 60)
        );

        if (franjaBloqueada) {
            return { ok: false, mensaje: 'La cancha esta bloqueada o en mantenimiento en ese horario.' };
        }

        const reservaSolapada = reservas.some(r => {
            if (r.estado === 'cancelada') return false;
            if (idCanchaReserva(r) !== Number(canchaSeleccionada.id)) return false;
            if (r.fechaUso !== form.fecha) return false;
            return seSolapan(inicio, fin, horaAMinutos(r.horaInicio), horaAMinutos(r.horaFin));
        });

        if (reservaSolapada) {
            return { ok: false, mensaje: 'Ya existe una reserva para esa cancha en la franja horaria elegida.' };
        }

        const claseSolapada = clases.some(c => {
            if (c.estado === 'cancelada') return false;
            if (clase?.idClase && Number(c.idClase) === Number(clase.idClase)) return false;
            if (idCanchaClase(c, canchas) !== Number(canchaSeleccionada.id)) return false;
            if (c.fecha !== form.fecha) return false;
            const inicioClase = horaAMinutos(c.horario);
            const finClase = inicioClase + Number(c.duracionMin || 0);
            return seSolapan(inicio, fin, inicioClase, finClase);
        });

        if (claseSolapada) {
            return { ok: false, mensaje: 'Ya existe una clase para esa cancha en la franja horaria elegida.' };
        }

        return { ok: true, cancha: canchaSeleccionada, horaFin: minutosAHora(fin), diaSemana };
    }, [form.cancha, form.fecha, form.horario, form.duracionMin, canchas, disponibilidades, reservas, clases, clase?.idClase]);

    useEffect(() => {
        if (!open) return;
        if (esNuevo) {
            setForm(FORM_VACIO);
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
        }
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
        if (disponibilidadClase && !disponibilidadClase.ok) {
            errs.cancha = disponibilidadClase.mensaje;
            ok = false;
        }
        setErrores(errs);
        return ok;
    }

    function handleGuardar() {
        if (!validar()) return;
        
        const idProfesor = Number(form.idProfesor);
        const profSeleccionado = profesoresDisp.find(p =>
            p.idUsuario === idProfesor || p.id === idProfesor
        ) || null;
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
            alumnos: clase?.alumnos || [],
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
                                {canchas.filter(c => c.estado !== 'inactiva').map(c => (
                                    <option key={c.id} value={c.nombre}>
                                        {c.nombre}
                                    </option>
                                ))}
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

                    {disponibilidadClase && !disponibilidadClase.ok && (
                        <div className="form-error" style={{ display: 'block', fontWeight: 600 }}>
                            {disponibilidadClase.mensaje}
                        </div>
                    )}

                    {disponibilidadClase?.ok && (
                        <div className="badge success" style={{ display: 'inline-flex', width: 'fit-content' }}>
                            Cancha disponible hasta las {disponibilidadClase.horaFin}
                        </div>
                    )}

                    {false && (
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
                    )}
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar} disabled={disponibilidadClase?.ok === false}>
                        <i data-lucide="save" /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
