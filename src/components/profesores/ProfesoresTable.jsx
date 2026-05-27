// src/components/profesores/ProfesoresTable.jsx
import Can from '../Can';

function iniciales(p) {
    if (!p.nombre || !p.apellido) return '??';
    return (p.nombre[0] + p.apellido[0]).toUpperCase();
}

function BadgeEstado({ activo }) {
    return (
        <span className={`badge ${activo ? 'success' : 'danger'}`}>
            {activo ? 'Activo' : 'Inactivo'}
        </span>
    );
}

export default function ProfesoresTable({
    profesores,
    filtro,
    onLimpiarFiltro,
    onVer,
    onEditar,
    onBaja,
}) {
    if (!profesores || profesores.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="search-x" />
                <p>No se encontraron profesores{filtro ? ' con ese criterio' : ''}.</p>
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
                        <th>Profesor</th>
                        <th>Especialidad</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {profesores.map(p => {
                        const isActivo = p.activo ?? (p.estado === 'activo');

                        return (
                            <tr key={p.idUsuario || p.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className={`user-avatar-sm${!isActivo ? ' inactive' : ''}`}>
                                            {iniciales(p)}
                                        </div>
                                        <div className="user-cell-info">
                                            <strong>{p.nombre} {p.apellido}</strong>
                                            <span>@{p.userName || p.username}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{p.especialidad || '—'}</td>
                                <td>{p.telefono || '—'}</td>
                                <td>
                                    <BadgeEstado activo={isActivo} />
                                </td>
                                <td>
                                    <div className="action-btns">
                                        {/* Ver Detalle: visible para admin y empleado */}
                                        <Can roles={['admin', 'empleado']}>
                                            <button
                                                className="action-btn view"
                                                title="Ver detalle"
                                                onClick={() => onVer(p)}
                                            >
                                                <i data-lucide="eye" />
                                            </button>
                                        </Can>

                                        {/* Editar: Solo admin */}
                                        <Can roles={['admin']}>
                                            <button
                                                className="action-btn edit"
                                                title="Editar"
                                                onClick={() => onEditar(p)}
                                            >
                                                <i data-lucide="pencil" />
                                            </button>
                                        </Can>

                                        {/* Dar de baja / Reactivar: Solo admin */}
                                        <Can roles={['admin']}>
                                            <button
                                                className="action-btn toggle"
                                                title={isActivo ? 'Dar de baja' : 'Reactivar'}
                                                onClick={() => onBaja(p)}
                                            >
                                                <i data-lucide={isActivo ? 'user-x' : 'user-check'} />
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