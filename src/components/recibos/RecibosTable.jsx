// src/components/recibos/RecibosTable.jsx

function BadgeEstado({ estado }) {
    const isEmitido = estado === 'emitido';
    return (
        <span className={`badge ${isEmitido ? 'success' : 'danger'}`}>
            {isEmitido ? 'Emitido' : 'Anulado'}
        </span>
    );
}

function formatMoneda(valor) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
}

export default function RecibosTable({ recibos, filtro, onLimpiarFiltro, isAdmin, onVer, onEditar, onBaja, onImprimir }) {
    if (recibos.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="receipt" />
                <p>No se encontraron recibos{filtro ? ' con ese criterio' : ''}.</p>
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
                        <th>N° Recibo</th>
                        <th>Cliente</th>
                        <th>Referencia (Cobro)</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {recibos.map((r) => (
                        <tr key={r.idRecibo}>
                            <td>{r.nroRecibo}</td>
                            <td>{r.cliente?.nombre} {r.cliente?.apellido}</td>
                            <td>{r.cobro?.concepto}</td>
                            <td>{r.fecha}</td>
                            <td>{formatMoneda(r.total)}</td>
                            <td><BadgeEstado estado={r.estado} /></td>
                            <td>
                                <div className="action-btns">
                                    <button className="action-btn view" title="Ver detalle" onClick={() => onVer(r)}>
                                        <i data-lucide="eye" />
                                    </button>

                                    {/* RBAC: Solo el administrador puede editar o anular recibos */}
                                    {isAdmin && (
                                        <>
                                            <button className="action-btn edit" title="Editar" onClick={() => onEditar(r)} disabled={r.estado === 'anulado'}>
                                                <i data-lucide="pencil" />
                                            </button>
                                            <button className="action-btn toggle" title={r.estado === 'emitido' ? 'Anular recibo' : 'Reactivar recibo'} onClick={() => onBaja(r)}>
                                                <i data-lucide={r.estado === 'emitido' ? 'ban' : 'check-circle'} />
                                            </button>
                                        </>
                                    )}

                                    <button className="action-btn" style={{ borderColor: 'var(--blue)', color: 'var(--blue)' }} title="Imprimir" onClick={() => onImprimir(r)} disabled={r.estado === 'anulado'}>
                                        <i data-lucide="printer" />
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