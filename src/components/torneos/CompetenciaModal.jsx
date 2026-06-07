import { useState, useEffect } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

const FORM_INICIAL = {
    nombre: '',
    descripcion: '',
    tipo: 'liga',
    estado: 'inscripcion',
    maxEquipos: 8,
    fechaInicio: '',
    fechaFin: '',
};

function hoyISO() {
    return new Date().toISOString().split('T')[0];
}

function sumarDias(fecha, dias) {
    if (!fecha) return '';
    const base = new Date(`${fecha}T00:00:00`);
    base.setDate(base.getDate() + Number(dias));
    return base.toISOString().split('T')[0];
}

function fechaEsPosteriorAHoy(fecha) {
    return fecha > hoyISO();
}

function competenciaIniciada(competencia) {
    return Boolean(competencia?.fechaInicio) && competencia.fechaInicio <= hoyISO();
}

function esPotenciaDeDos(valor) {
    return valor > 0 && (valor & (valor - 1)) === 0;
}

function calcularFechaFin(tipo, maxEquipos, fechaInicio) {
    const dias = tipo === 'torneo' ? Number(maxEquipos) / 2 : Number(maxEquipos) + 1;
    return sumarDias(fechaInicio, dias);
}

function Field({ label, error, children }) {
    return (
        <div className="form-group">
            <label>{label}</label>
            {children}
            {error && <small className="form-error">{error}</small>}
        </div>
    );
}

export default function CompetenciaModal({ isOpen, onClose, onSave, competenciaEditar }) {
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [errores, setErrores] = useState({});

    const esEdicion = Boolean(competenciaEditar);
    const yaIniciada = competenciaIniciada(competenciaEditar);
    const opcionesTorneo = [2, 4, 8, 16];

    useEffect(() => {
        if (!isOpen) return;
        setErrores({});

        if (competenciaEditar) {
            const maxEquipos = Number(competenciaEditar.maxEquipos || 2);
            setFormData({
                ...FORM_INICIAL,
                ...competenciaEditar,
                maxEquipos,
                fechaFin: calcularFechaFin(competenciaEditar.tipo, maxEquipos, competenciaEditar.fechaInicio),
            });
        } else {
            setFormData(FORM_INICIAL);
        }
    }, [competenciaEditar, isOpen]);

    useEffect(() => {
        if (isOpen && window.lucide) window.lucide.createIcons();
    }, [isOpen, errores]);

    if (!isOpen) return null;

    function setCampo(campo, valor) {
        setFormData(prev => {
            const next = { ...prev, [campo]: valor };
            if (campo === 'tipo') {
                next.maxEquipos = valor === 'torneo' ? 8 : Math.min(Number(prev.maxEquipos || 8), 20);
            }
            if (['tipo', 'maxEquipos', 'fechaInicio'].includes(campo)) {
                next.fechaFin = calcularFechaFin(next.tipo, Number(next.maxEquipos), next.fechaInicio);
            }
            return next;
        });
        setErrores(prev => ({ ...prev, [campo]: '' }));
    }

    function validar() {
        const nextErrores = {};
        const maxEquipos = Number(formData.maxEquipos);

        if (formData.nombre.trim().length < 3) nextErrores.nombre = 'Ingrese un nombre valido.';
        if (!formData.fechaInicio) {
            nextErrores.fechaInicio = 'Ingrese fecha de inicio.';
        } else if (!esEdicion && !fechaEsPosteriorAHoy(formData.fechaInicio)) {
            nextErrores.fechaInicio = 'La fecha de inicio debe ser posterior al dia de hoy.';
        } else if (esEdicion && !yaIniciada && !fechaEsPosteriorAHoy(formData.fechaInicio)) {
            nextErrores.fechaInicio = 'La fecha de inicio debe ser posterior al dia de hoy.';
        }

        if (formData.tipo === 'torneo') {
            if (maxEquipos > 16 || !esPotenciaDeDos(maxEquipos)) {
                nextErrores.maxEquipos = 'Los torneos admiten 2, 4, 8 o 16 equipos.';
            }
        } else if (maxEquipos < 2 || maxEquipos > 20) {
            nextErrores.maxEquipos = 'Las ligas admiten entre 2 y 20 equipos.';
        }

        setErrores(nextErrores);
        return Object.keys(nextErrores).length === 0;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validar()) return;

        onSave({
            ...formData,
            maxEquipos: Number(formData.maxEquipos),
            fechaFin: calcularFechaFin(formData.tipo, Number(formData.maxEquipos), formData.fechaInicio),
        });
        onClose();
    };

    return (
        <div className="dash-modal-overlay activo" onClick={onClose}>
            <div className="dash-modal" onClick={e => e.stopPropagation()}>
                <div className="dash-modal-header">
                    <h3>{esEdicion ? 'Modificar competencia' : 'Nueva competencia'}</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <Icon name="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <form onSubmit={handleSubmit} id="competencia-form">
                        <Field label="Nombre de la competencia" error={errores.nombre}>
                            <input
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={e => setCampo('nombre', e.target.value)}
                            />
                        </Field>

                        <Field label="Descripcion">
                            <textarea
                                rows="3"
                                value={formData.descripcion || ''}
                                onChange={e => setCampo('descripcion', e.target.value)}
                                placeholder="Ej: Liga semanal para equipos amateurs"
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '0.5rem', background: 'var(--bg)', color: 'var(--text)' }}
                            />
                        </Field>

                        <div className="form-row">
                            <Field label="Tipo de formato">
                                <select value={formData.tipo} onChange={e => setCampo('tipo', e.target.value)} disabled={esEdicion}>
                                    <option value="liga">Liga</option>
                                    <option value="torneo">Torneo</option>
                                </select>
                            </Field>

                            <Field label="Estado">
                                <select value={formData.estado} onChange={e => setCampo('estado', e.target.value)}>
                                    <option value="inscripcion">Inscripcion abierta</option>
                                    <option value="en_curso">En curso</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                            </Field>
                        </div>

                        <div className="form-row">
                            <Field label="Cantidad maxima de equipos" error={errores.maxEquipos}>
                                {formData.tipo === 'torneo' ? (
                                    <select value={formData.maxEquipos} onChange={e => setCampo('maxEquipos', Number(e.target.value))}>
                                        {opcionesTorneo.map(opcion => (
                                            <option key={opcion} value={opcion}>{opcion} equipos</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        min="2"
                                        max="20"
                                        value={formData.maxEquipos || 2}
                                        onChange={e => setCampo('maxEquipos', Number(e.target.value))}
                                    />
                                )}
                            </Field>

                            <Field label="Fecha de inicio" error={errores.fechaInicio}>
                                <input
                                    type="date"
                                    min={sumarDias(hoyISO(), 1)}
                                    value={formData.fechaInicio || ''}
                                    disabled={yaIniciada}
                                    onChange={e => setCampo('fechaInicio', e.target.value)}
                                />
                            </Field>
                        </div>

                        <Field label="Fecha de fin calculada">
                            <input type="date" value={formData.fechaFin || ''} disabled />
                        </Field>
                    </form>
                </div>

                <div className="dash-modal-footer">
                    <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="competencia-form" className="btn-modal-save">
                        <Icon name="save" /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
