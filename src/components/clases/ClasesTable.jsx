// src/components/clases/ClasesTable.jsx
import Can from '../Can';
import { useAuth } from '../../context/AuthContext';
import useRole from '../../hooks/useRole';

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
    clases, filtro, onLimpiarFiltro, onVer, onEditar, onAsistencia, onCancelar, onSolicitarInscripcion
}) {
    const { user } = useAuth();
    const { isClient } = useRole();

    if (clases.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="calendar-x" />
                <p>No se encontraron clases{filtro ? ' con ese criterio' : ''}.</p>
                {filtro && <button className="link-btn" onClick={onLimpiarFiltro}>Limpiar búsqueda</button>}
            </div>
        );
    }

    const currentUserId = user?.idUsuario || user?.id;

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
                    {clases.map(c => {
                        // Comprobaciones para el rol de Cliente
                        const yaInscripto = c.alumnos?.some(al => al.id === currentUserId);
                        const tieneCupo = (c.alumnos?.length || 0) < c.maxAlumnos;

                        return (
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
                                        {/* ACCIÓN EXCLUSIVA CLIENTE: Botón de Inscripción/Pago */}
                                        {isClient && (
                                            yaInscripto ? (
                                                <span className="badge success" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                                                    <i data-lucide="check" style={{ width: 12, height: 12, marginRight: 4 }} /> Ya Inscripto
                                                </span>
                                            ) : c.estado !== 'programada' ? (
                                                <span className="badge neutral" style={{ fontSize: '0.75rem' }}>No disponible</span>
                                            ) : !tieneCupo ? (
                                                <span className="badge danger" style={{ fontSize: '0.75rem' }}>Cupo Lleno</span>
                                            ) : (
                                                <button
                                                    className="btn-primary-action"
                                                    style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'var(--purple)', height: 'auto' }}
                                                    onClick={() => onSolicitarInscripcion?.(c)}
                                                >
                                                    <i data-lucide="credit-card" style={{ width: 12, height: 12 }} /> Inscribirse (${c.precio})
                                                </button>
                                            )
                                        )}

                                        {/* Ver detalle — todos los roles */}
                                        <button className="action-btn view" title="Ver detalle" onClick={() => onVer(c)}>
                                            <i data-lucide="eye" />
                                        </button>

                                        {/* Editar — solo admin y empleado */}
                                        <Can roles={['Admin', 'Employee']}>
                                            <button className="action-btn edit" title="Modificar clase" onClick={() => onEditar(c)} disabled={c.estado === 'cancelada'}>
                                                <i data-lucide="pencil" />
                                            </button>
                                        </Can>

                                        {/* Registrar asistencia — admin, empleado y profesor */}
                                        <Can roles={['Admin', 'Employee']}>
                                            <button className="action-btn view" title="Registrar asistencia" onClick={() => onAsistencia(c)} disabled={c.estado === 'cancelada' || c.estado === 'finalizada'}>
                                                <i data-lucide="clipboard-check" />
                                            </button>
                                        </Can>

                                        {/* Cancelar — solo admin y empleado */}
                                        <Can roles={['Admin', 'Employee']}>
                                            <button className="action-btn toggle" title={c.estado === 'cancelada' ? 'Reactivar clase' : 'Cancelar clase'} onClick={() => onCancelar(c)} disabled={c.estado === 'finalizada'}>
                                                <i data-lucide={c.estado === 'cancelada' ? 'calendar-check' : 'x-circle'} />
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
    );
}
