// src/components/canchas/CanchasTable.jsx
export default function CanchasTable({ canchas, tipos, filtro, setFiltro, onNuevo, onVer, onEditar, onBaja, onVerDisp }) {
    const activas = canchas.filter(c => c.estado === 'activa').length;
    const inactivas = canchas.filter(c => c.estado === 'inactiva').length;

    const filtradas = canchas.filter(c => {
        if (!filtro) return true;
        const q = filtro.toLowerCase();
        const tipo = tipos.find(t => t.id === c.idTipo);
        return c.nombre.toLowerCase().includes(q) || (tipo?.nombre || '').toLowerCase().includes(q);
    });

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Canchas</h2>
                    <span className="crud-count">{canchas.length} registradas</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input type="text" placeholder="Buscar por nombre o tipo…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
                    </div>
                    <button className="btn-primary-action" onClick={onNuevo}>
                        <i data-lucide="plus" /> Nueva cancha
                    </button>
                </div>
            </div>

            <div className="crud-mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-num">{canchas.length}</span>
                    <span className="mini-stat-label">Total</span>
                </div>
                <div className="mini-stat green">
                    <span className="mini-stat-num">{activas}</span>
                    <span className="mini-stat-label">Activas</span>
                </div>
                <div className="mini-stat red">
                    <span className="mini-stat-num">{inactivas}</span>
                    <span className="mini-stat-label">Inactivas</span>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                <div className="table-wrapper">
                    {filtradas.length === 0 ? (
                        <div className="tabla-empty">
                            <i data-lucide="search-x" />
                            <p>No se encontraron canchas{filtro ? ' con ese criterio' : ''}.</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Cancha</th>
                                    <th>Superficie</th>
                                    <th>Capacidad</th>
                                    <th>Precio/h</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtradas.map(c => {
                                    const tipo = tipos.find(t => t.id === c.idTipo);
                                    return (
                                        <tr key={c.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="cancha-num-badge">{c.numero}</div>
                                                    <div className="user-cell-info">
                                                        <strong>{c.nombre}</strong>
                                                        <span>{tipo?.nombre || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{tipo?.superficie || '—'}</td>
                                            <td><span className="badge info">{tipo?.capacidadJugadores || '—'} jug.</span></td>
                                            <td>{tipo ? `$${tipo.precioHora.toLocaleString('es-AR')}/h` : '—'}</td>
                                            <td>
                                                <span className={`badge ${c.estado === 'activa' ? 'success' : 'danger'}`}>
                                                    {c.estado === 'activa' ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="action-btn view" title="Ver detalle" onClick={() => onVer(c)}>
                                                        <i data-lucide="eye" />
                                                    </button>
                                                    <button className="action-btn edit" title="Editar" onClick={() => onEditar(c)}>
                                                        <i data-lucide="pencil" />
                                                    </button>
                                                    <button className="action-btn view" title={c.estado === 'activa' ? 'Ver disponibilidad' : 'Cancha inactiva'} style={{ opacity: c.estado !== 'activa' ? 0.5 : 1 }} onClick={() => onVerDisp(c)}>
                                                        <i data-lucide="calendar-clock" />
                                                    </button>
                                                    <button className="action-btn toggle" title={c.estado === 'activa' ? 'Dar de baja' : 'Reactivar'} onClick={() => onBaja(c)}>
                                                        <i data-lucide={c.estado === 'activa' ? 'x-circle' : 'check-circle'} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}