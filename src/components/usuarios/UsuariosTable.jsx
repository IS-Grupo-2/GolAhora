// src/components/usuarios/UsuariosTable.jsx

// ── Helpers ───────────────────────────────────────────────────────────────────
function iniciales(u) {
    return (u.nombre[0] + u.apellido[0]).toUpperCase();
}

function BadgeEstado({ estado }) {
    return (
        <span className={`badge ${estado === 'activo' ? 'success' : 'danger'}`}>
            {estado === 'activo' ? 'Activo' : 'Inactivo'}
        </span>
    );
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function UsuariosTable({ usuarios, filtro, onLimpiarFiltro, onVer, onEditar, onBaja }) {

    if (usuarios.length === 0) {
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
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id}>
                            <td>
                                <div className="user-cell">
                                    <div className={`user-avatar-sm${u.estado === 'inactivo' ? ' inactive' : ''}`}>
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
                            <td><BadgeEstado estado={u.estado} /></td>
                            <td>
                                <div className="action-btns">
                                    <button
                                        className="action-btn view"
                                        title="Ver detalle"
                                        onClick={() => onVer(u)}
                                    >
                                        <i data-lucide="eye" />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        title="Editar"
                                        onClick={() => onEditar(u)}
                                    >
                                        <i data-lucide="pencil" />
                                    </button>
                                    <button
                                        className="action-btn toggle"
                                        title={u.estado === 'activo' ? 'Dar de baja' : 'Reactivar'}
                                        onClick={() => onBaja(u)}
                                    >
                                        <i data-lucide={u.estado === 'activo' ? 'user-x' : 'user-check'} />
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