// src/components/clases/ClasesTable.jsx

function BadgeEstado({ estado }) {
    const colores = {
        programada: 'info',      // Azul/Purple
        en_curso:   'warning',   // Amarillo
        finalizada: 'success',   // Verde
        cancelada:  'danger'     // Rojo
    };
    const color = colores[estado] || 'info';
    return (
        <span className={`badge ${color}`} style={{ textTransform: 'capitalize' }}>
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
                                    <span>{c.tipoClase} - {c.cancha}</span>
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
                                    <button className="action-btn view" title="Ver detalle" onClick={() => onVer(c)}>
                                        <i data-lucide="eye" />
                                    </button>
                                    <button className="action-btn edit" title="Modificar" onClick={() => onEditar(c)} disabled={c.estado === 'cancelada'}>
                                        <i data-lucide="pencil" />
                                    </button>
                                    <button className="action-btn view" title="Registrar Asistencia" onClick={() => onAsistencia(c)} disabled={c.estado === 'cancelada'}>
                                        <i data-lucide="clipboard-check" />
                                    </button>
                                    <button className="action-btn toggle" title="Cancelar Clase" onClick={() => onCancelar(c)} disabled={c.estado === 'cancelada' || c.estado === 'finalizada'}>
                                        <i data-lucide="x-circle" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}