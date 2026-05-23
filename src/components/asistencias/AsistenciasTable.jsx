// src/components/asistencias/AsistenciasTable.jsx

function BadgeEstado({ estado }) {
    const isTomada = estado === 'registrada';
    return (
        <span className={`badge ${isTomada ? 'success' : 'warning'}`}>
            {isTomada ? 'Registrada' : 'Pendiente'}
        </span>
    );
}

export default function AsistenciasTable({ clases, asistenciasPorClase, filtro, onLimpiarFiltro, onVer, onTomar }) {
    if (clases.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="clipboard-x" />
                <p>No tenés clases asignadas{filtro ? ' con ese criterio' : ''}.</p>
                {filtro && (
                    <button className="link-btn" onClick={onLimpiarFiltro}>Limpiar búsqueda</button>
                )}
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Clase / Entrenamiento</th>
                        <th>Fecha y Hora</th>
                        <th>Cancha / Espacio</th>
                        <th>Alumnos</th>
                        <th>Estado Asistencia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clases.map(c => {
                        const tieneAsistencia = asistenciasPorClase[c.idClase] && asistenciasPorClase[c.idClase].length > 0;
                        const estado = tieneAsistencia ? 'registrada' : 'pendiente';

                        return (
                            <tr key={c.idClase}>
                                <td>
                                    <div className="user-cell-info">
                                        <strong>{c.nombre}</strong>
                                        <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{c.tipoClase}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="user-cell-info">
                                        <strong>{c.fecha}</strong>
                                        <span>{c.horario} hs ({c.duracionMin}m)</span>
                                    </div>
                                </td>
                                <td>{c.cancha}</td>
                                <td>
                                    <strong>{c.alumnos?.length || 0}</strong> inscriptos
                                </td>
                                <td>
                                    <BadgeEstado estado={estado} />
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button 
                                            className="action-btn view" 
                                            title="Ver listado" 
                                            onClick={() => onVer(c)}
                                            disabled={!tieneAsistencia}
                                            style={{ opacity: !tieneAsistencia ? 0.3 : 1 }}
                                        >
                                            <i data-lucide="eye" />
                                        </button>
                                        <button 
                                            className="action-btn edit" 
                                            title={tieneAsistencia ? "Modificar asistencia" : "Tomar asistencia"} 
                                            onClick={() => onTomar(c, tieneAsistencia)}
                                        >
                                            <i data-lucide={tieneAsistencia ? "edit-3" : "clipboard-check"} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}