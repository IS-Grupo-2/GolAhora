// src/components/torneos/CompetenciaModalDetalle.jsx
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

export default function CompetenciaModalDetalle({ open, competencia, equipos = [], onClose, onEditar }) {
    
    // Cerrar con Escape y bloquear scroll
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

    if (!open || !competencia) return null;

    const nombreEquipo = (idEquipo) => {
        const equipo = equipos.find(e => e.idEquipo === idEquipo);
        return equipo?.nombre || `Equipo #${idEquipo}`;
    };

    return (
        <div className="dash-modal-overlay activo" onClick={onClose}>
            <div className="dash-modal" onClick={e => e.stopPropagation()}>
                
                <div className="dash-modal-header">
                    <h3>Detalle de Competencia</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <Icon name="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div className="user-avatar-sm" style={{ width: '64px', height: '64px', fontSize: '1.5rem', margin: '0 auto 10px auto' }}>
                            {competencia.nombre.charAt(0) || '?'}
                        </div>
                        <h2 style={{ color: 'var(--text)', margin: '0' }}>{competencia.nombre}</h2>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <span className={`badge ${competencia.tipo === 'liga' ? 'success' : 'warning'}`}>
                                Formato: {competencia.tipo ? (competencia.tipo.charAt(0).toUpperCase() + competencia.tipo.slice(1)) : competencia.tipo}
                            </span>
                            <span className={`badge ${competencia.estado === 'activo' ? 'success' : 'danger'}`}>
                                Estado: {competencia.estado ? (competencia.estado.charAt(0).toUpperCase() + competencia.estado.slice(1)) : competencia.estado}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'var(--bg-card)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <Campo label="ID Interno" valor={`#${competencia.id}`} />
                        <Campo label="Cantidad de Equipos" valor={competencia.equipos?.length || 0} />
                        
                        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '5px' }}>
                            <span className="detalle-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Equipos Inscriptos</span>
                            {competencia.equipos && competencia.equipos.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {/* Aquí mostramos los IDs. En un futuro podrías cruzarlo con el array de equipos para mostrar los nombres */}
                                    {competencia.equipos.map((eqId, idx) => (
                                        <span key={idx} className="badge info" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6' }}>
                                            {nombreEquipo(eqId)}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>Ningún equipo inscripto aún.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button type="button" className="btn-modal-cancel" onClick={onClose}>Cerrar</button>
                    {onEditar && (
                        <button type="button" className="btn-modal-save" onClick={() => { onClose(); onEditar(competencia); }}>
                            <Icon name="pencil" />
                            Editar
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
