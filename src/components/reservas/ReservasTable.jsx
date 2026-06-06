// src/components/reservas/ReservasTable.jsx
export default function ReservasTable({
    reservas,
    filtro,
    onVer,
    onEditar,
    onCancelar,
    onConfirmar,
    canVer = true,
    canEditar = false,
    canCancelar = false,
    canConfirmar = false,
}) {
    return (
        <div className="table-wrapper">
            {!reservas || reservas.length === 0 ? (
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
                            <th>Cobro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map(r => (
                            <tr key={r.idReserva}>
                                <td>
                                    <div className="user-cell">
                                        <div className="cancha-num-badge sm">{r.cancha?.numero}</div>
                                        <div className="user-cell-info">
                                            <strong>{r.cancha?.nombre}</strong>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div className="user-cell-info">
                                        <strong>{r.cliente?.nombre} {r.cliente?.apellido}</strong>
                                        <span className="td-email">{r.reservador?.email}</span>
                                    </div>
                                </td>

                                <td>
                                    <strong>{r.fechaUso}</strong>
                                    <br />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {r.horaInicio} – {r.horaFin} ({r.duracionMin}m)
                                    </span>
                                </td>

                                <td>
                                    <strong>${Number(r.montoTotal || 0).toLocaleString('es-AR')}</strong>
                                </td>

                                <td>
                                    <span className={`badge ${
                                        r.estado === 'confirmada' ? 'success'
                                        : r.estado === 'pendiente' ? 'warning'
                                        : 'danger'
                                    }`}>
                                        {r.estado?.charAt(0).toUpperCase() + r.estado?.slice(1)}
                                    </span>
                                </td>

                                <td>
                                    <span className={`badge ${
                                        r.cobro?.estado === 'pagado' ? 'success'
                                        : r.cobro?.estado === 'cancelado' ? 'danger'
                                        : r.cobro?.estado === 'recargo' ? 'danger'
                                        : 'warning'
                                    }`} style={{ fontSize: '0.72rem' }}>
                                        {r.cobro?.estado || 'pendiente'}
                                    </span>
                                </td>

                                <td>
                                    <div className="action-btns">
                                        {canVer && (
                                            <button
                                                className="action-btn view"
                                                title="Ver detalle"
                                                onClick={() => onVer(r)}
                                            >
                                                <i data-lucide="eye" />
                                            </button>
                                        )}

                                        {canEditar && (
                                            <button
                                                className="action-btn edit"
                                                title="Modificar"
                                                onClick={() => onEditar(r)}
                                                disabled={r.estado === 'cancelada'}
                                            >
                                                <i data-lucide="pencil" />
                                            </button>
                                        )}

                                        {canConfirmar && r.estado === 'pendiente' && (
                                            <button
                                                className="action-btn edit"
                                                title="Confirmar reserva"
                                                onClick={() => onConfirmar?.(r)}
                                            >
                                                <i data-lucide="check-circle" />
                                            </button>
                                        )}

                                        {canCancelar && (
                                            <button
                                                className="action-btn toggle"
                                                title="Cancelar"
                                                onClick={() => onCancelar(r)}
                                                disabled={r.estado === 'cancelada'}
                                            >
                                                <i data-lucide="x-circle" />
                                            </button>
                                        )}
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