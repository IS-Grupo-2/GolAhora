export default function ReservasTable({ reservas, filtro, onVer, onEditar, onCancelar }) {

    return (
        <div className="table-wrapper">
            {(!reservas || reservas.length === 0) ? (
                <div className="tabla-empty">
                    <i data-lucide="calendar-x" />
                    <p>No se encontraron reservas{filtro ? ' con ese criterio' : '.'}</p>
                </div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Cancha</th>
                            <th>Cliente</th>
                            <th>Fecha y Hora</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map(r => (
                            <tr key={r.idReserva}>
                                <td>
                                    <div className="user-cell">
                                        <div className="cancha-num-badge sm">{r.cancha.numero}</div>
                                        <div className="user-cell-info">
                                            <strong>{r.cancha.nombre}</strong>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="user-cell-info">
                                        <strong>{r.reservador.nombre}</strong>
                                        <span className="td-email">{r.reservador.email}</span>
                                        <span className="td-role">{r.reservador.rol}</span>
                                    </div>
                                </td>
                                <td>
                                    <strong>{r.fechaUso}</strong><br />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {r.horaInicio} - {r.horaFin} ({r.duracionMin}m)
                                    </span>
                                </td>
                                <td><strong>${r.montoTotal.toLocaleString('es-AR')}</strong></td>
                                <td>
                                    <span className={`badge ${r.estado === 'confirmada' ? 'success' : r.estado === 'pendiente' ? 'warning' : 'danger'}`}>
                                        {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button className="action-btn view" title="Ver detalle" onClick={() => onVer(r)}>
                                            <i data-lucide="eye" />
                                        </button>
                                        <button className="action-btn edit" title="Modificar" onClick={() => onEditar(r)} disabled={r.estado === 'cancelada'}>
                                            <i data-lucide="pencil" />
                                        </button>
                                        <button className="action-btn toggle" title="Cancelar/Dar de baja" onClick={() => onCancelar(r)} disabled={r.estado === 'cancelada'}>
                                            <i data-lucide="x-circle" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}