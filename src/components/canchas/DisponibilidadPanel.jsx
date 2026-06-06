import Can from '../Can';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DisponibilidadPanel({ canchas, tipos, disps, canchaActivaId, setCanchaActivaId, onNuevaDisp, onToggleDisp, onEditarDisp, onEliminarDisp }) {
    const canchasActivas = canchas.filter(c => c.estado === 'activa');
    const cancha = canchasActivas.find(c => c.id === canchaActivaId) || canchasActivas[0];
    const tipo = cancha ? tipos.find(t => t.id === cancha.idTipo) : null;
    
    const dispsCancha = disps.filter(d => d.idCancha === cancha?.id).sort((a, b) => {
        const d1 = DIAS.indexOf(a.diaSemana);
        const d2 = DIAS.indexOf(b.diaSemana);
        return d1 !== d2 ? d1 - d2 : a.horaInicio - b.horaInicio;
    });

    let hsDisp = 0, hsBloq = 0;
    dispsCancha.forEach(d => {
        const hs = d.horaFin - d.horaInicio;
        if (d.disponible) hsDisp += hs; else hsBloq += hs;
    });

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left"><h2 className="crud-title">Disponibilidad de Canchas</h2></div>
                <div className="crud-toolbar-right">
                    <Can roles={['admin', 'empleado', 'Employee']}>
                        <button className="btn-primary-action" onClick={onNuevaDisp} disabled={!cancha} style={{ opacity: !cancha ? 0.5 : 1 }}>
                            <i data-lucide="plus" /> Agregar franja
                        </button>
                    </Can>
                </div>
            </div>

            {/* NUEVO LAYOUT: Contenedor vertical */}
            <div className="disp-layout-vertical">
                
                {/* SELECTOR HORIZONTAL ARRIBA */}
                <div className="cancha-selector-horizontal">
                    {canchasActivas.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No hay canchas operativas.</p>}
                    {canchasActivas.map(c => {
                        const t = tipos.find(x => x.id === c.idTipo);
                        return (
                            <button key={c.id} className={`cancha-selector-item ${c.id === cancha?.id ? 'selected' : ''}`} onClick={() => setCanchaActivaId(c.id)}>
                                <span className="cancha-num-badge sm">{c.numero}</span>
                                <div className="cancha-selector-text">
                                    <strong>{c.nombre}</strong>
                                    <span>{t?.nombre || ''}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* TABLA PRINCIPAL DEBAJO OCUPANDO 100% */}
                <div className="disp-main-full">
                    {!cancha ? (
                        <div className="tabla-empty"><p>Seleccione una cancha activa para configurar su disponibilidad.</p></div>
                    ) : (
                        <>
                            <div className="cancha-info-banner">
                                <div className="cancha-info-left">
                                    <div className="cancha-num-badge lg">{cancha.numero}</div>
                                    <div>
                                        <h3>{cancha.nombre}</h3>
                                        <p>{tipo?.nombre || '—'} · {tipo?.superficie || '—'} · {tipo?.capacidadJugadores || '—'} jugadores</p>
                                    </div>
                                </div>
                                <div className="cancha-info-stats">
                                    <span className="mini-stat-inline green">{hsDisp} hs habilitadas</span>
                                    <span className="mini-stat-inline red">{hsBloq} hs bloqueadas</span>
                                </div>
                            </div>
                            
                            <div className="panel-card tabla-panel" style={{ marginTop: '16px' }}>
                                {/* El table-wrapper ahora maneja el scroll */}
                                <div className="table-wrapper scroll-x-fix">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Día</th>
                                                <th>Inicio</th>
                                                <th>Fin</th>
                                                <th>Estado</th>
                                                <Can roles={['Admin', 'Employee']}>
                                                    <th>Acciones</th>
                                                </Can>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dispsCancha.length === 0 ? (
                                                <tr><td colSpan="5" className="tabla-empty"><p>Sin franjas configuradas.</p></td></tr>
                                            ) : (
                                                dispsCancha.map(f => (
                                                    <tr key={f.id}>
                                                        <td><strong>{f.diaSemana}</strong></td>
                                                        <td>{String(f.horaInicio).padStart(2, '0')}:00</td>
                                                        <td>{String(f.horaFin).padStart(2, '0')}:00</td>
                                                        <td>
                                                            <span className={`badge ${f.disponible ? 'success' : 'danger'}`}>
                                                                {f.disponible ? 'Habilitada' : 'Bloqueada'}
                                                            </span>
                                                        </td>
                                                        <Can roles={['Admin', 'Employee']}>
                                                            <td>
                                                                <div className="action-btns">
                                                                    <button className="action-btn view" onClick={() => onToggleDisp(f)}><i data-lucide={f.disponible ? 'eye-off' : 'eye'} /></button>
                                                                    <button className="action-btn edit" onClick={() => onEditarDisp(f)}><i data-lucide="pencil" /></button>
                                                                    <button className="action-btn toggle" onClick={() => onEliminarDisp(f)}><i data-lucide="trash-2" /></button>
                                                                </div>
                                                            </td>
                                                        </Can>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}