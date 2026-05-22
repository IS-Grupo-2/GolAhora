// src/components/empleados/EmpleadosTable.jsx

function iniciales(e) {
    return (e.nombre[0] + e.apellido[0]).toUpperCase();
}

function BadgeEstado({ activo }) {
    return (
        <span className={`badge ${activo ? 'success' : 'danger'}`}>
            {activo ? 'Activo' : 'Inactivo'}
        </span>
    );
}

export default function EmpleadosTable({
    empleados,
    filtro,
    onLimpiarFiltro,
    onVer,
    onEditar,
    onBaja,
}) {
    if (empleados.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="search-x" />
                <p>No se encontraron empleados{filtro ? ' con ese criterio' : ''}.</p>
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
                        <th>Empleado</th>
                        <th>Cargo</th>
                        <th>Turno</th>
                        <th>Sector</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map(e => (
                        <tr key={e.id}>
                            <td>
                                <div className="user-cell">
                                    <div className={`user-avatar-sm${!e.activo ? ' inactive' : ''}`}>
                                        {iniciales(e)}
                                    </div>
                                    <div className="user-cell-info">
                                        <strong>{e.nombre} {e.apellido}</strong>
                                        <span>{e.legajo}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{e.cargo}</td>
                            <td>{e.turno}</td>
                            <td>{e.sector}</td>
                            <td>
                                <BadgeEstado activo={e.activo} />
                            </td>
                            <td>
                                <div className="action-btns">
                                    <button
                                        className="action-btn view"
                                        title="Ver detalle"
                                        onClick={() => onVer(e)}
                                    >
                                        <i data-lucide="eye" />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        title="Editar"
                                        onClick={() => onEditar(e)}
                                    >
                                        <i data-lucide="pencil" />
                                    </button>
                                    <button
                                        className="action-btn toggle"
                                        title={e.activo ? 'Dar de baja' : 'Reactivar'}
                                        onClick={() => onBaja(e)}
                                    >
                                        <i data-lucide={e.activo ? 'user-x' : 'user-check'} />
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