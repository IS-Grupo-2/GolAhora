export default function TiposTable({ tipos, canchas, filtro, setFiltro, onNuevo, onVer, onEditar, onBaja }) {
    const normalizarTexto = (texto) => {
        return texto
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };
    
    
    const filtrados = tipos.filter(t => {
        if (!filtro) return true;
        
        const q = normalizarTexto(filtro);
        const nombre = normalizarTexto(t.nombre || '');
        const superficie = normalizarTexto(t.superficie || '');
        
        return nombre.includes(q) || superficie.includes(q);
    });

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Tipos de Cancha</h2>
                    <span className="crud-count">{tipos.length} tipos</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input type="text" placeholder="Buscar tipo…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
                    </div>
                    <button className="btn-primary-action" onClick={onNuevo}>
                        <i data-lucide="plus" /> Nuevo tipo
                    </button>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                <div className="table-wrapper">
                    {filtrados.length === 0 ? (
                        <div className="tabla-empty"><p>No se encontraron tipos.</p></div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th><th>Superficie</th><th>Jugadores</th><th>Duración máx.</th><th>Precio/hora</th><th>En uso</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map(t => {
                                    const uso = canchas.filter(c => c.idTipo === t.id).length;
                                    return (
                                        <tr key={t.id}>
                                            <td><strong>{t.nombre}</strong></td>
                                            <td>{t.superficie}</td>
                                            <td>{t.capacidadJugadores}</td>
                                            <td>{t.duracionMaxReservaMin} min</td>
                                            <td>${t.precioHora.toLocaleString('es-AR')}</td>
                                            <td><span className={`badge ${uso > 0 ? 'info' : 'neutral'}`}>{uso} cancha{uso !== 1 ? 's' : ''}</span></td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="action-btn view" onClick={() => onVer(t)}><i data-lucide="eye" /></button>
                                                    <button className="action-btn edit" onClick={() => onEditar(t)}><i data-lucide="pencil" /></button>
                                                    <button className="action-btn toggle" onClick={() => onBaja(t)}><i data-lucide="trash-2" /></button>
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