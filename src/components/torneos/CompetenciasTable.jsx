// src/components/torneos/CompetenciasTable.jsx
import { useState } from 'react';
import ModalEliminar from '../common/ModalEliminar';
import Can from '../Can';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function CompetenciasTable({
    competencias,
    onNuevo,
    onEditar,
    onEliminar,
    onDetalle
}) {
    const [modalEliminar, setModalEliminar] = useState({
        open: false,
        competencia: null
    });

    // Estadísticas
    const competenciasActivas = competencias.filter(c => c.estado === 'en_curso').length;
    const competenciasFinalizadas = competencias.filter(c => c.estado === 'finalizado').length;
    const competenciasInscripcion = competencias.filter(c => c.estado === 'inscripcion').length;

    // Handlers
    const handleEliminar = (competencia) => {
        setModalEliminar({ open: true, competencia });
    };

    const confirmarEliminar = () => {
        if (!modalEliminar.competencia) return;
        onEliminar(modalEliminar.competencia.id);
        setModalEliminar({ open: false, competencia: null });
    };

    return (
        <>
            {/* Toolbar */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Competencias</h2>
                    <span className="crud-count">{competencias.length}</span>
                </div>

                <div className="crud-toolbar-right">
                    {/* Mini Stats */}
                    <div className="crud-mini-stats">
                        <div className="mini-stat green">
                            <span className="mini-stat-num">{competenciasActivas}</span>
                            <span className="mini-stat-label">En Curso</span>
                        </div>
                        <div className="mini-stat purple">
                            <span className="mini-stat-num">{competenciasInscripcion}</span>
                            <span className="mini-stat-label">Inscripción</span>
                        </div>
                        <div className="mini-stat danger">
                            <span className="mini-stat-num">{competenciasFinalizadas}</span>
                            <span className="mini-stat-label">Finalizadas</span>
                        </div>
                    </div>

                    <Can roles={['admin', 'empleado']}>
                        <button className="btn-primary-action" onClick={onNuevo}>
                            <Icon name="plus" /> Nueva Competencia
                        </button>
                    </Can>
                </div>
            </div>

            {/* Tabla */}
            <div className="panel-card tabla-panel">
                {competencias.length === 0 ? (
                    <div className="tabla-empty">
                        <Icon name="trophy" />
                        <p>No hay competencias registradas.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Competencia</th>
                                    <th>Tipo</th>
                                    <th>Equipos</th>
                                    <th>Estado</th>
                                    <th>Fechas</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competencias.map(comp => {
                                    const totalEquipos = comp.equipos?.length || 0;
                                    return (
                                        <tr key={comp.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-sm">
                                                        {comp.nombre?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="user-cell-info">
                                                        <strong>{comp.nombre}</strong>
                                                        <small style={{ color: 'var(--text-muted)' }}>
                                                            {comp.descripcion || 'Sin descripción'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`badge ${comp.tipo === 'liga' ? 'success' : 'warning'}`}>
                                                    {comp.tipo?.charAt(0).toUpperCase() + comp.tipo?.slice(1)}
                                                </span>
                                            </td>

                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <strong>{totalEquipos} equipos</strong>
                                                    <small style={{ color: 'var(--text-muted)' }}>
                                                        Máx: {comp.maxEquipos || '-'}
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`badge ${
                                                    comp.estado === 'finalizado' ? 'danger' :
                                                    comp.estado === 'en_curso' ? 'success' : 'warning'
                                                }`}>
                                                    {comp.estado === 'inscripcion' && 'Inscripción'}
                                                    {comp.estado === 'en_curso' && 'En Curso'}
                                                    {comp.estado === 'finalizado' && 'Finalizado'}
                                                </span>
                                            </td>

                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <small>Inicio: {comp.fechaInicio || '-'}</small>
                                                    <small>Fin: {comp.fechaFin || '-'}</small>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="action-btn eye"
                                                        title="Ver detalle"
                                                        onClick={() => onDetalle(comp)}
                                                    >
                                                        <Icon name="eye" />
                                                    </button>

                                                    <Can roles={['admin', 'empleado']}>
                                                        <button
                                                            className="action-btn edit"
                                                            title="Editar"
                                                            onClick={() => onEditar(comp)}
                                                        >
                                                            <Icon name="pencil" />
                                                        </button>
                                                    </Can>

                                                    <Can roles={['admin']}>
                                                        <button
                                                            className="action-btn toggle"
                                                            title="Eliminar"
                                                            style={{ color: '#ef4444' }}
                                                            onClick={() => handleEliminar(comp)}
                                                        >
                                                            <Icon name="trash-2" />
                                                        </button>
                                                    </Can>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Eliminar */}
            <ModalEliminar
                open={modalEliminar.open}
                titulo="Eliminar Competencia"
                mensaje="¿Estás seguro de que deseas eliminar esta competencia? Esta acción no se puede deshacer."
                nombreElemento={modalEliminar.competencia?.nombre}
                onConfirmar={confirmarEliminar}
                onCerrar={() => setModalEliminar({ open: false, competencia: null })}
            />
        </>
    );
}