// src/components/profesores/ProfesoresTable.jsx

function iniciales(p) {
    return (p.nombre[0] + p.apellido[0]).toUpperCase();
}

function BadgeEstado({ estado }) {
    return (
        <span className={`badge ${estado === 'activo' ? 'success' : 'danger'}`}>
            {estado === 'activo' ? 'Activo' : 'Inactivo'}
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
    if (profesores.length === 0) {
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
                        <th>Turno</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {profesores.map(p => (
                        <tr key={p.id}>
                            <td>
                                <div className="user-cell">
                                    <div className={`user-avatar-sm${p.estado === 'inactivo' ? ' inactive' : ''}`}>
                                        {iniciales(p)}
                                    </div>
                                    <div className="user-cell-info">
                                        <strong>{p.nombre} {p.apellido}</strong>
                                        <span>@{p.username}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{p.especialidad}</td>
                            <td>{p.turno}</td>
                            <td>
                                <BadgeEstado estado={p.estado} />
                            </td>
                            <td>
                                <div className="action-btns">
                                    <button
                                        className="action-btn view"
                                        title="Ver detalle"
                                        onClick={() => onVer(p)}
                                    >
                                        <i data-lucide="eye" />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        title="Editar"
                                        onClick={() => onEditar(p)}
                                    >
                                        <i data-lucide="pencil" />
                                    </button>
                                    <button
                                        className="action-btn toggle"
                                        title={p.estado === 'activo' ? 'Dar de baja' : 'Reactivar'}
                                        onClick={() => onBaja(p)}
                                    >
                                        <i data-lucide={p.estado === 'activo' ? 'user-x' : 'user-check'} />
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