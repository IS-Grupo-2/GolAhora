import { useEffect } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

function Campo({ label, valor, full }) {
    return (
        <div className={`detalle-campo${full ? ' detalle-full' : ''}`}>
            <span className="detalle-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
            <div className="detalle-valor" style={{ fontWeight: '500', color: 'var(--text)', marginTop: '4px' }}>{valor}</div>
        </div>
    );
}

export default function EquipoModalDetalle({ open, equipo, competencias, onClose, onEditar }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    if (!open || !equipo) return null;

    const competiciones = competencias
        .filter(c => c.equipos?.includes(equipo.idEquipo))
        .map(c => `${c.nombre} (${c.tipo})`);

    return (
        <div className="dash-modal-overlay activo" onClick={onClose}>
            <div className="dash-modal" onClick={e => e.stopPropagation()}>
                <div className="dash-modal-header">
                    <h3>Detalle del Equipo</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <Icon name="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div className="user-avatar-sm" style={{ width: '64px', height: '64px', fontSize: '1.5rem', margin: '0 auto 10px auto' }}>
                            {equipo.nombre?.charAt(0) || '?'}
                        </div>
                        <h2 style={{ color: 'var(--text)', margin: '0' }}>{equipo.nombre}</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'var(--bg-card)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <Campo label="Capitán" valor={equipo.capitan || 'No asignado'} />
                        <Campo label="Fecha de creación" valor={equipo.fechaCreacion || '—'} />
                        <Campo label="Integrantes" valor={`${equipo.integrantes?.length || 0} jugadores`} />
                        <Campo label="ID Interno" valor={`#${equipo.idEquipo}`} />
                        <div className="detalle-campo detalle-full" style={{ gridColumn: '1 / -1' }}>
                            <span className="detalle-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lista de Integrantes</span>
                            <div style={{ marginTop: '8px' }}>
                                {equipo.integrantes && equipo.integrantes.length > 0 ? (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {equipo.integrantes.map((jugador, idx) => (
                                            <li key={idx} style={{ background: 'var(--bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                {jugador}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>Este equipo no tiene integrantes registrados aún.</p>
                                )}
                            </div>
                        </div>
                        <div className="detalle-campo detalle-full" style={{ gridColumn: '1 / -1' }}>
                            <span className="detalle-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Competiciones inscritas</span>
                            {competiciones.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {competiciones.map((texto, idx) => (
                                        <span key={idx} className="badge info" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6' }}>
                                            {texto}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>El equipo no está inscrito en ninguna competencia.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cerrar</button>
                    <button className="btn-modal-save" onClick={() => { onClose(); onEditar(equipo); }}>
                        <Icon name="pencil" />
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
}
