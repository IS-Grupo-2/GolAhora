import { useState } from 'react';
import ModalEliminar from '../common/ModalEliminar';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function EquiposTable({ equipos, competencias, onNuevo, onEditar, onEliminar, onInscribir, onDetalle, fixtures }) {
    const [selectedEquipo, setSelectedEquipo] = useState('');
    const [selectedTorneo, setSelectedTorneo] = useState('');
    const [modalEliminar, setModalEliminar] = useState({ open: false, equipo: null });

    const handleEliminar = (eq) => {
        setModalEliminar({ open: true, equipo: eq });
    };

    const confirmarEliminar = () => {
        if (modalEliminar.equipo) {
            onEliminar(modalEliminar.equipo.idEquipo);
            setModalEliminar({ open: false, equipo: null });
        }
    };

    const handleInscripcionSubmit = (e) => {
        e.preventDefault();
        if (!selectedEquipo || !selectedTorneo) return;
        onInscribir(parseInt(selectedTorneo), parseInt(selectedEquipo));
        setSelectedEquipo('');
        setSelectedTorneo('');
    };

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Gestión de Equipos</h2>
                    <span className="crud-count">{equipos.length}</span>
                </div>
                <div className="crud-toolbar-right">
                    <button className="btn-primary-action" onClick={onNuevo}>
                        <Icon name="plus" /> Nuevo Equipo
                    </button>
                </div>
            </div>

            {/* Panel Rápido de Inscripción de Equipos a Torneos (RF32) */}
            <div className="panel-card" style={{ marginBottom: '24px', marginTop: '24px', padding: '18px' }}>
                <h4 style={{ color: 'var(--text)', marginBottom: '16px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                    <Icon name="user-plus" /> Inscripción Rápida a Competencia
                </h4>
                <form onSubmit={handleInscripcionSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Seleccionar Equipo</label>
                        <select value={selectedEquipo} onChange={e => setSelectedEquipo(e.target.value)} required>
                            <option value="">-- Seleccionar --</option>
                            {equipos.map(e => (
                                <option key={e.idEquipo} value={e.idEquipo}>{e.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Seleccionar Liga / Torneo</label>
                        <select value={selectedTorneo} onChange={e => setSelectedTorneo(e.target.value)} required>
                            <option value="">-- Seleccionar --</option>
                            {competencias.map(c => {
                                const isClosed = fixtures?.some(f => f.competenciaID === c.id) || c.estado === 'finalizado';
                                const tipoLabel = c.tipo ? (c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)) : c.tipo;
                                return (
                                    <option key={c.id} value={c.id} disabled={isClosed}>
                                        {c.nombre} ({tipoLabel}){isClosed ? ' — Cerrada' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <button type="submit" className="btn-primary-action" style={{ height: '42px', background: '#16a34a' }}>
                        Inscribir Equipo
                    </button>
                </form>
            </div>

            {/* Tabla Principal */}
            <div className="panel-card tabla-panel">
                {equipos.length === 0 ? (
                    <div className="tabla-empty">
                        <Icon name="users" />
                        <p>No hay equipos registrados en el sistema.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>Nombre del Equipo</th>
                                    <th>Capitán</th>
                                    <th>Integrantes</th>
                                    <th>Fecha Creación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipos.map(eq => (
                                    <tr key={eq.idEquipo}>
                                        <td className="bold-text">{eq.nombre}</td>
                                        <td>
                                            <span className="badge info">{eq.capitan || 'No asignado'}</span>
                                        </td>
                                        <td>{eq.integrantes?.length || 0} Jugadores</td>
                                        <td>{eq.fechaCreacion}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="action-btn eye" title="Ver Detalle" onClick={() => onDetalle?.(eq)}>
                                                    <Icon name="eye" />
                                                </button>
                                                <button className="action-btn edit" title="Editar" onClick={() => onEditar(eq)}>
                                                    <Icon name="pencil" />
                                                </button>
                                                <button className="action-btn toggle" style={{ color: '#ef4444' }} title="Eliminar" onClick={() => handleEliminar(eq)}>
                                                    <Icon name="trash-2" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ModalEliminar
                open={modalEliminar.open}
                titulo="Eliminar Equipo"
                mensaje="¿Estás seguro de que deseas eliminar este equipo? No hay vuelta atrás."
                nombreElemento={modalEliminar.equipo?.nombre}
                onConfirmar={confirmarEliminar}
                onCerrar={() => setModalEliminar({ open: false, equipo: null })}
            />
        </>
    );
}