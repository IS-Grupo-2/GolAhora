import Can from '../Can';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const horaTexto = (hora) => `${String(Number(hora)).padStart(2, '0')}:00`;

export default function DisponibilidadPanel({
    canchas,
    tipos,
    disps,
    canchaActivaId,
    setCanchaActivaId,
    onNuevaDisp,
    onToggleDisp,
    onEditarDisp,
    onEliminarDisp
}) {
    const canchasOperativas = canchas.filter(c => c.estado !== 'inactiva');
    const cancha = canchasOperativas.find(c => c.id === canchaActivaId) || canchasOperativas[0];
    const tipo = cancha ? tipos.find(t => t.id === cancha.idTipo) : null;

    const dispsCancha = disps
        .filter(d => Number(d.idCancha ?? d.canchaId) === cancha?.id)
        .sort((a, b) => {
            const d1 = DIAS.indexOf(a.diaSemana);
            const d2 = DIAS.indexOf(b.diaSemana);
            return d1 !== d2 ? d1 - d2 : Number(a.horaInicio) - Number(b.horaInicio);
        });

    let hsDisp = 0;
    let hsBloq = 0;
    dispsCancha.forEach(d => {
        const hs = Number(d.horaFin) - Number(d.horaInicio);
        if (d.disponible) hsDisp += hs;
        else hsBloq += hs;
    });

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Disponibilidad de Canchas</h2>
                </div>
                <div className="crud-toolbar-right">
                    <Can roles={['Admin', 'admin', 'empleado', 'Employee']}>
                        <button
                            className="btn-primary-action"
                            onClick={onNuevaDisp}
                            disabled={!cancha}
                            style={{ opacity: !cancha ? 0.5 : 1 }}
                        >
                            <i data-lucide="plus" /> Agregar franja
                        </button>
                    </Can>
                </div>
            </div>

            <div className="disp-layout-vertical">
                <div className="cancha-selector-horizontal">
                    {canchasOperativas.length === 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No hay canchas operativas.</p>
                    )}
                    {canchasOperativas.map(c => {
                        const t = tipos.find(x => x.id === c.idTipo);
                        return (
                            <button
                                key={c.id}
                                className={`cancha-selector-item ${c.id === cancha?.id ? 'selected' : ''} ${c.estado === 'mantenimiento' ? 'maintenance' : ''}`}
                                onClick={() => setCanchaActivaId(c.id)}
                            >
                                <span className="cancha-num-badge sm">{c.numero}</span>
                                <div className="cancha-selector-text">
                                    <strong>{c.nombre}</strong>
                                    <span>{t?.nombre || ''}{c.estado === 'mantenimiento' ? ' - Mantenimiento' : ''}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="disp-main-full">
                    {!cancha ? (
                        <div className="tabla-empty"><p>Seleccione una cancha operativa para configurar su disponibilidad.</p></div>
                    ) : (
                        <>
                            <div className="cancha-info-banner">
                                <div className="cancha-info-left">
                                    <div className="cancha-num-badge lg">{cancha.numero}</div>
                                    <div>
                                        <h3>{cancha.nombre}</h3>
                                        <p>{tipo?.nombre || '-'} - {tipo?.superficie || '-'} - {tipo?.capacidadJugadores || '-'} jugadores</p>
                                    </div>
                                </div>
                                <div className="cancha-info-stats">
                                    <span className="mini-stat-inline green">{hsDisp} hs habilitadas</span>
                                    <span className="mini-stat-inline red">{hsBloq} hs bloqueadas</span>
                                </div>
                            </div>

                            <div className="panel-card tabla-panel" style={{ marginTop: '16px' }}>
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
                                                        <td>{horaTexto(f.horaInicio)}</td>
                                                        <td>{horaTexto(f.horaFin)}</td>
                                                        <td>
                                                            <span className={`badge ${f.disponible ? 'success' : 'danger'}`}>
                                                                {f.disponible ? 'Habilitada' : 'Bloqueada'}
                                                            </span>
                                                        </td>
                                                        <Can roles={['Admin', 'Employee']}>
                                                            <td>
                                                                <div className="action-btns">
                                                                    <button
                                                                        className="action-btn view"
                                                                        title={f.disponible ? 'Bloquear disponibilidad' : 'Habilitar disponibilidad'}
                                                                        onClick={() => onToggleDisp(f)}
                                                                    >
                                                                        <i data-lucide={f.disponible ? 'eye-off' : 'eye'} />
                                                                    </button>
                                                                    <button
                                                                        className="action-btn edit"
                                                                        title="Editar disponibilidad"
                                                                        onClick={() => onEditarDisp(f)}
                                                                    >
                                                                        <i data-lucide="pencil" />
                                                                    </button>
                                                                    <button
                                                                        className="action-btn toggle"
                                                                        title="Eliminar disponibilidad"
                                                                        onClick={() => onEliminarDisp(f)}
                                                                    >
                                                                        <i data-lucide="trash-2" />
                                                                    </button>
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
