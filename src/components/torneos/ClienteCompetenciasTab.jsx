// src/components/torneos/ClienteCompetenciasTab.jsx
import { useEffect } from 'react';
import { formatearFecha } from '../../utils/fechas';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function ClienteCompetenciasTab({ competencias, onDetalle }) {
    // Solo mostramos los que están en etapa de inscripción
    const torneosDisponibles = competencias.filter(c => c.estado === 'inscripcion');

    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    });

    return (
        <div className="panel-card tabla-panel">
            <div className="crud-toolbar toolbar-bordered">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title" style={{padding: '1rem'}}>
                        <span>
                            <Icon name="trophy" /> Torneos con Inscripción Abierta
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Crea tu equipo en la pestaña "Equipos" para que el administrador pueda inscribirte.
                    </p>
                </div>
            </div>

            {torneosDisponibles.length === 0 ? (
                <div className="tabla-empty">
                    <Icon name="calendar-x" />
                    <p>Actualmente no hay torneos ni ligas con inscripción abierta.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="crud-table">
                        <thead>
                            <tr>
                                <th>Competencia</th>
                                <th>Formato</th>
                                <th>Cupos</th>
                                <th>Fechas</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {torneosDisponibles.map(comp => (
                                <tr key={comp.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-sm" style={{ background: 'var(--purple)', color: '#fff' }}>
                                                {comp.nombre?.charAt(0) || '?'}
                                            </div>
                                            <div className="user-cell-info">
                                                <strong>{comp.nombre}</strong>
                                                <small style={{ color: 'var(--text-muted)' }}>{comp.descripcion || 'Sin descripción'}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${comp.tipo === 'liga' ? 'success' : 'warning'}`}>
                                            {comp.tipo?.charAt(0).toUpperCase() + comp.tipo?.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{comp.equipos?.length || 0} / {comp.maxEquipos || '-'}</strong> inscriptos
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <small>Inicio: {formatearFecha(comp.fechaInicio)}</small>
                                            <small>Fin: {formatearFecha(comp.fechaFin)}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button type="button" className="action-btn view" title="Ver información" onClick={() => onDetalle(comp)}>
                                                <Icon name="info" />
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
    );
}
