import Can from '../Can';

export default function CanchasTable({ canchas, tipos, filtro, setFiltro, onNuevo, onVer, onEditar, onBaja, onVerDisp }) {
    const activas = canchas.filter(c => c.estado === 'activa' || c.activa === true).length;
    const inactivas = canchas.filter(c => c.estado === 'inactiva').length;
    const estadoCancha = (c) => {
        if (c.estado === 'mantenimiento') return { clase: 'warning', texto: 'Mantenimiento' };
        if (c.estado === 'activa' || c.activa === true) return { clase: 'success', texto: 'Activa' };
        return { clase: 'danger', texto: 'Inactiva' };
    };

    const normalizarTexto = (texto) => {
        return texto
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

    const filtradas = canchas.filter(c => {
        if (!filtro) return true;
        
        const q = normalizarTexto(filtro);
        const nombreCancha = normalizarTexto(c.nombre || '');
        const tipo = tipos.find(t => t.id === c.idTipo);
        const nombreTipo = normalizarTexto(tipo?.nombre || '');
        
        return nombreCancha.includes(q) || nombreTipo.includes(q);
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
                    <Can roles={['Admin']}>
                        <button className="btn-primary-action" onClick={onNuevo}>
                            <i data-lucide="plus" /> Nueva cancha
                        </button>
                    </Can>
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
                                    const estado = estadoCancha(c);
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
                                                <span className={`badge ${estado.clase}`}>
                                                    {estado.texto}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="action-btn view" title="Ver detalle" onClick={() => onVer(c)}>
                                                        <i data-lucide="eye" />
                                                    </button>
                                                    <Can roles={['Admin', 'Employee']}>
                                                        <button className="action-btn edit" title="Editar" onClick={() => onEditar(c)}>
                                                            <i data-lucide="pencil" />
                                                        </button>
                                                    </Can>
                                                    <button className="action-btn view" title={c.estado !== 'inactiva' ? 'Ver disponibilidad' : 'Cancha inactiva'} style={{ opacity: c.estado === 'inactiva' ? 0.5 : 1 }} onClick={() => onVerDisp(c)}>
                                                        <i data-lucide="calendar-clock" />
                                                    </button>
                                                    <Can roles={['Admin']}>
                                                        <button className="action-btn toggle" title={c.estado === 'inactiva' ? 'Reactivar' : 'Dar de baja'} onClick={() => onBaja(c)}>
                                                            <i data-lucide={c.estado === 'inactiva' ? 'check-circle' : 'x-circle'} />
                                                        </button>
                                                    </Can>
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
