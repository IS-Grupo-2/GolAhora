// src/components/clases/ClasesTable.jsx
import Can from '../Can';

function BadgeEstado({ estado }) {
    const colores = {
        programada: 'info',
        en_curso:   'warning',
        finalizada: 'success',
        cancelada:  'danger',
    };
    return (
        <span className={`badge ${colores[estado] || 'info'}`} style={{ textTransform: 'capitalize' }}>
            {estado.replace('_', ' ')}
        </span>
    );
}

export default function ClasesTable({
    clases,
    filtro,
    onLimpiarFiltro,
    onVer,
    onEditar,
    onAsistencia,
    onCancelar,
}) {
    if (clases.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="calendar-x" />
                <p>No se encontraron clases{filtro ? ' con ese criterio' : ''}.</p>
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
                        <th>Clase</th>
                        <th>Horario</th>
                        <th>Profesor</th>
                        <th>Capacidad</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clases.map(c => (
                        <tr key={c.idClase}>
                            <td>
                                <div className="user-cell-info">
                                    <strong>{c.nombre}</strong>
                                    <span>{c.tipoClase} — {c.cancha}</span>
                                </div>
                            </td>
                            <td>
                                <div className="user-cell-info">
                                    <strong>{c.fecha}</strong>
                                    <span>{c.horario} ({c.duracionMin}m)</span>
                                </div>
                            </td>
                            <td>
                                {c.profesor ? (
                                    <div className="user-cell-info">
                                        <strong>{c.profesor.nombre} {c.profesor.apellido}</strong>
                                        {c.profesor.verificacionCertificacion && (
                                            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <i data-lucide="check-circle" style={{ width: '12px', height: '12px' }} /> Verificado
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>
                                )}
                            </td>
                            <td>
                                <strong>{c.alumnos?.length || 0}</strong> / {c.maxAlumnos}
                            </td>
                            <td>
                                <BadgeEstado estado={c.estado} />
                            </td>
                            <td>
                                <div className="action-btns">

                                    {/* Ver detalle — todos los roles */}
                                    <button
                                        className="action-btn view"
                                        title="Ver detalle"
                                        onClick={() => onVer(c)}
                                    >
                                        <i data-lucide="eye" />
                                    </button>

                                    {/* Editar — solo admin y empleado */}
                                    <Can roles={['admin', 'empleado']}>
                                        <button
                                            className="action-btn edit"
                                            title="Modificar clase"
                                            onClick={() => onEditar(c)}
                                            disabled={c.estado === 'cancelada'}
                                        >
                                            <i data-lucide="pencil" />
                                        </button>
                                    </Can>

                                    {/* Registrar asistencia — admin, empleado y profesor */}
                                    <Can roles={['admin', 'empleado', 'profesor']}>
                                        <button
                                            className="action-btn view"
                                            title="Registrar asistencia"
                                            onClick={() => onAsistencia(c)}
                                            disabled={c.estado === 'cancelada' || c.estado === 'finalizada'}
                                        >
                                            <i data-lucide="clipboard-check" />
                                        </button>
                                    </Can>

                                    {/* Cancelar — solo admin y empleado */}
                                    <Can roles={['admin', 'empleado']}>
                                        <button
                                            className="action-btn toggle"
                                            title={c.estado === 'cancelada' ? 'Reactivar clase' : 'Cancelar clase'}
                                            onClick={() => onCancelar(c)}
                                            disabled={c.estado === 'finalizada'}
                                        >
                                            <i data-lucide={c.estado === 'cancelada' ? 'calendar-check' : 'x-circle'} />
                                        </button>
                                    </Can>

                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}