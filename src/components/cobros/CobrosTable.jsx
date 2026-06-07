function BadgeEstado({ estado }) {
    if (estado === 'pagado') {
        return <span className="badge success">Pagado / Acreditado</span>;
    }
    //if (estado === 'pendiente') {
    //    return <span className="badge warning">Pendiente de Pago</span>;
    //}
    return <span className="badge danger">Anulado</span>;
}

function formatMoneda(valor) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
}

export default function CobrosTable({ cobros, filtro, onLimpiarFiltro, isAdmin, onVer, onEditar, onBaja, onImprimir }) {
    if (cobros.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="search-x" />
                <p>No se encontraron cobros{filtro ? ' con ese criterio' : ''}.</p>
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
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Concepto</th>
                        <th>Fecha</th>
                        <th>Monto Final</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cobros.map((c) => (
                        <tr key={c.idCobro}>
                            <td>#{String(c.idCobro).padStart(5, '0')}</td>
                            <td>{c.cliente?.nombre} {c.cliente?.apellido}</td>
                            <td>{c.concepto}</td>
                            <td>{c.fecha}</td>
                            <td>{formatMoneda(c.montoFinal)}</td>
                            <td><BadgeEstado estado={c.estado} /></td>
                            <td>
                                <div className="action-btns">
                                    <button className="action-btn view" title="Ver detalle" onClick={() => onVer(c)}>
                                        <i data-lucide="eye" />
                                    </button>
                                    
                                    {/* RBAC: Solo el administrador puede editar o dar de baja/anular cobros */}
                                    {isAdmin && (
                                        <>
                                            <button className="action-btn edit" title="Editar" onClick={() => onEditar(c)} disabled={c.estado === 'anulado'}>
                                                <i data-lucide="pencil" />
                                            </button>
                                            <button className="action-btn toggle" title={c.estado === 'pagado' ? 'Anular cobro' : 'Reactivar cobro'} onClick={() => onBaja(c)}>
                                                <i data-lucide={c.estado === 'pagado' ? 'ban' : 'check-circle'} />
                                            </button>
                                        </>
                                    )}

                                    
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}