import { formatearFecha } from '../../utils/fechas';

function BadgeEstado({ estado }) {
    const isTomada = estado === 'registrada';
    return (
        <span className={`badge ${isTomada ? 'success' : 'warning'}`}>
            {isTomada ? 'Registrada' : 'Pendiente'}
        </span>
    );
}

export default function AsistenciasTable({
    clases = [],
    asistenciasPorClase = {},
    filtro,
    onLimpiarFiltro,
    onVer,
    onTomar,
}) {
    const clasesSeguras = Array.isArray(clases) ? clases : [];

    if (clasesSeguras.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="clipboard-x" />
                <p>No hay clases disponibles{filtro ? ' con ese criterio' : ''}.</p>
                {filtro && (
                    <button className="link-btn" onClick={onLimpiarFiltro}>
                        Limpiar búsqueda
                    </button>
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
                        <th>Profesor</th>
                        <th>Fecha y Hora</th>
                        <th>Cancha / Espacio</th>
                        <th>Alumnos</th>
                        <th>Estado Asistencia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clasesSeguras.map(c => {
                        const registros = asistenciasPorClase?.[c.idClase] || [];
                        const tieneAsistencia = registros.length > 0;
                        const estado = tieneAsistencia ? 'registrada' : 'pendiente';
                        const presentes = registros.filter(r => r.presente).length;

                        return (
                            <tr key={c.idClase}>
                                <td>
                                    <div className="user-cell-info">
                                        <strong>{c.nombre}</strong>
                                        <span style={{ color: 'var(--purple)', fontWeight: 600 }}>
                                            {c.tipoClase}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    {c.profesor ? (
                                        <span>{c.profesor.nombre} {c.profesor.apellido}</span>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>
                                    )}
                                </td>
                                <td>
                                    <div className="user-cell-info">
                                        <strong>{formatearFecha(c.fecha)}</strong>
                                        <span>{c.horario} hs ({c.duracionMin}m)</span>
                                    </div>
                                </td>
                                <td>{c.cancha}</td>
                                <td>
                                    <div className="user-cell-info">
                                        <strong>{c.alumnos?.length || 0}</strong>
                                        {tieneAsistencia && (
                                            <span style={{ color: '#16a34a', fontSize: '0.8rem' }}>
                                                {presentes} presentes
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <BadgeEstado estado={estado} />
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button
                                            className="action-btn view"
                                            title="Ver reporte de asistencia"
                                            onClick={() => onVer(c)}
                                            disabled={!tieneAsistencia}
                                            style={{ opacity: !tieneAsistencia ? 0.3 : 1 }}
                                        >
                                            <i data-lucide="eye" />
                                        </button>

                                        {/* Tomar o modificar lista */}
                                        <button
                                            className="action-btn edit"
                                            title={tieneAsistencia ? 'Modificar asistencia' : 'Pasar lista'}
                                            onClick={() => onTomar(c, tieneAsistencia)}
                                        >
                                            <i data-lucide={tieneAsistencia ? 'edit-3' : 'clipboard-check'} />
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
