// src/components/usuarios/UsuariosTable.jsx
import Can from '../Can';

// ── Helpers ───────────────────────────────────────────────────────────────────
function iniciales(u) {
    if (!u.nombre || !u.apellido) return '??';
    return (u.nombre[0] + u.apellido[0]).toUpperCase();
}

function BadgeEstado({ activo }) {
    return (
        <span className={`badge ${activo ? 'success' : 'danger'}`}>
            {activo ? 'Activo' : 'Inactivo'}
        </span>
    );
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function UsuariosTable({ usuarios, filtro, onLimpiarFiltro, onVer, onEditar, onBaja }) {

    if (!usuarios || usuarios.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="search-x" />
                <p>No se encontraron clientes{filtro ? ' con ese criterio' : ''}.</p>
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
                        <th>Cliente</th>
                        <th>DNI</th>
                        <th className="td-email">Email</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(u => {

                        const isActivo = u.activo ?? (u.estado === 'activo');

                        return (
                            <tr key={u.idUsuario || u.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className={`user-avatar-sm${!isActivo ? ' inactive' : ''}`}>
                                            {iniciales(u)}
                                        </div>
                                        <div className="user-cell-info">
                                            <strong>{u.nombre} {u.apellido}</strong>
                                            <span>@{u.username}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{u.dni}</td>
                                <td className="td-email">{u.email}</td>
                                <td>{u.telefono}</td>
                                <td><BadgeEstado activo={isActivo} /></td>
                                <td>
                                    <div className="action-btns">
                                        {/* Ver Detalle: visible para todos los que accedan a la tabla */}
                                        <button
                                            className="action-btn view"
                                            title="Ver detalle"
                                            onClick={() => onVer(u)}
                                        >
                                            <i data-lucide="eye" />
                                        </button>
                                        
                                        {/* Editar: Solo admin y empleado */}
                                        <Can roles={['Admin', 'Employee']}>
                                            <button
                                                className="action-btn edit"
                                                title="Editar"
                                                onClick={() => onEditar(u)}
                                            >
                                                <i data-lucide="pencil" />
                                            </button>
                                        </Can>

                                        {/* Dar de baja / Reactivar: Solo admin */}
                                        <Can roles={['Admin']}>
                                            <button
                                                className="action-btn toggle"
                                                title={isActivo ? 'Dar de baja' : 'Reactivar'}
                                                onClick={() => onBaja(u)}
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
