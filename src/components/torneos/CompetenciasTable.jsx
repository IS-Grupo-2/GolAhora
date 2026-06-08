// src/components/torneos/CompetenciasTable.jsx
import { useState, useEffect} from 'react';
import ModalEliminar from '../common/ModalEliminar';
import Can from '../Can';
import { formatearFecha } from '../../utils/fechas';

function Icon({ name }) {
    return <span dangerouslySetInnerHTML={{ __html: `<i data-lucide="${name}"></i>` }} />;
}

export default function CompetenciasTable({
    competencias,
    equipos = [],
    fixtures = [],
    onNuevo,
    onEditar,
    onEliminar,
    onDetalle,
    onInscribirEquipo
}) {
    const [modalEliminar, setModalEliminar] = useState({
        open: false,
        competencia: null
    });
    const [modalEquipo, setModalEquipo] = useState({
        open: false,
        competencia: null,
        equipoId: ''
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

    const abrirAgregarEquipo = (competencia) => {
        setModalEquipo({ open: true, competencia, equipoId: '' });
    };

    const confirmarAgregarEquipo = (e) => {
        e.preventDefault();
        if (!modalEquipo.competencia || !modalEquipo.equipoId) return;
        onInscribirEquipo(modalEquipo.competencia.id, Number(modalEquipo.equipoId));
        setModalEquipo({ open: false, competencia: null, equipoId: '' });
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [modalEliminar.open, modalEquipo.open, competencias]);

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

                    <Can roles={['Admin', 'Employee']}>
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
                                    const tieneFixture = fixtures.some(f => f.competenciaID === comp.id);
                                    const estaCerrada = comp.estado === 'finalizado' || tieneFixture;
                                    const equiposDisponibles = equipos.filter(e => !comp.equipos?.includes(e.idEquipo));
                                    const cupoCompleto = totalEquipos >= Number(comp.maxEquipos || Infinity);
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
                                                    <small>Inicio: {formatearFecha(comp.fechaInicio)}</small>
                                                    <small>Fin: {formatearFecha(comp.fechaFin)}</small>
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

                                                    

                                                    <Can roles={['Admin', 'Employee']}>
                                                        <button
                                                            className="action-btn edit"
                                                            title="Modificar datos"
                                                            onClick={() => onEditar(comp)}
                                                        >
                                                            <Icon name="pencil" />
                                                        </button>
                                                    </Can>

                                                    <Can roles={['Admin']}>
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

            {modalEquipo.open && (
                <div className="dash-modal-overlay activo" onClick={() => setModalEquipo({ open: false, competencia: null, equipoId: '' })}>
                    <div className="dash-modal dash-modal--sm" onClick={e => e.stopPropagation()}>
                        <div className="dash-modal-header">
                            <h3>Agregar equipo a competencia</h3>
                            <button className="dash-modal-close" onClick={() => setModalEquipo({ open: false, competencia: null, equipoId: '' })}>
                                <Icon name="x" />
                            </button>
                        </div>

                        <form onSubmit={confirmarAgregarEquipo}>
                            <div className="dash-modal-body">
                                <div className="form-group">
                                    <label>Competencia</label>
                                    <input value={modalEquipo.competencia?.nombre || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Equipo disponible</label>
                                    <select
                                        value={modalEquipo.equipoId}
                                        onChange={e => setModalEquipo(prev => ({ ...prev, equipoId: e.target.value }))}
                                        required
                                    >
                                        <option value="">Seleccionar equipo</option>
                                        {equipos
                                            .filter(e => !modalEquipo.competencia?.equipos?.includes(e.idEquipo))
                                            .map(e => (
                                                <option key={e.idEquipo} value={e.idEquipo}>{e.nombre}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="dash-modal-footer">
                                <button type="button" className="btn-modal-cancel" onClick={() => setModalEquipo({ open: false, competencia: null, equipoId: '' })}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-modal-save">
                                    <Icon name="user-plus" /> Agregar equipo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
