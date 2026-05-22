import { useState } from 'react';
import ModalEliminar from '../common/ModalEliminar';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function CompetenciasTable({ competencias, onNuevo, onEditar, onEliminar, onDetalle }) {
    const [modalEliminar, setModalEliminar] = useState({ open: false, competencia: null });
    const activas = competencias.filter(c => c.estado === 'activo').length;

    const handleEliminar = (comp) => {
        setModalEliminar({ open: true, competencia: comp });
    };

    const confirmarEliminar = () => {
        if (modalEliminar.competencia) {
            onEliminar(modalEliminar.competencia.id);
            setModalEliminar({ open: false, competencia: null });
        }
    };

    return (
        <>
            {/* ... toolbar ... (se mantiene igual) */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Competencias</h2>
                    <span className="crud-count">{competencias.length}</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="crud-mini-stats">
                        <div className="mini-stat green">
                            <span className="mini-stat-num">{activas}</span>
                            <span className="mini-stat-label">Activas</span>
                        </div>
                    </div>
                    <button className="btn-primary-action" onClick={onNuevo}>
                        <Icon name="plus" />
                        Nueva Competencia
                    </button>
                </div>
            </div>

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
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competencias.map(comp => (
                                    <tr key={comp.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-sm">{comp.nombre.charAt(0) || '?'}</div>
                                                <div className="user-cell-info">
                                                    <strong>{comp.nombre}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                                <span className={`badge ${comp.tipo === 'liga' ? 'success' : 'warning'}`}>
                                                    {comp.tipo ? (comp.tipo.charAt(0).toUpperCase() + comp.tipo.slice(1)) : comp.tipo}
                                                </span>
                                        </td>
                                        <td>{comp.equipos?.length || 0} equipos</td>
                                        <td>
                                            <span className={`badge ${comp.estado === 'activo' ? 'success' : 'danger'}`}>
                                                {comp.estado ? (comp.estado.charAt(0).toUpperCase() + comp.estado.slice(1)) : comp.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                {/* Nuevo botón de detalle */}
                                                <button className="action-btn eye" title="Ver Detalle" onClick={() => onDetalle(comp)}>
                                                    <Icon name="eye" />
                                                </button>
                                                {/* Botones con onClick agregados */}
                                                <button className="action-btn edit" title="Editar" onClick={() => onEditar(comp)}>
                                                    <Icon name="pencil" />
                                                </button>
                                                <button className="action-btn toggle" title="Eliminar" style={{ color: '#ef4444' }} onClick={() => handleEliminar(comp)}>
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
                titulo="Eliminar Competencia"
                mensaje="¿Estás seguro de que deseas eliminar esta competencia? No hay vuelta atrás."
                nombreElemento={modalEliminar.competencia?.nombre}
                onConfirmar={confirmarEliminar}
                onCerrar={() => setModalEliminar({ open: false, competencia: null })}
            />
        </>
    );
}