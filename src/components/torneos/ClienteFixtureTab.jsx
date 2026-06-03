import { useState, useEffect } from 'react';

function Icon({ name }) {
    return <span dangerouslySetInnerHTML={{ __html: `<i data-lucide="${name}"></i>` }} />;
}

export default function ClienteFixturesTab({ competencias, fixtures, equipos }) {
    const [selectedCompId, setSelectedCompId] = useState('');
    
    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    });
    
    const competenciasActivas = competencias.filter(c => c.estado === 'en_curso' || c.estado === 'finalizado');
    const currentFixture = fixtures.find(f => f.competenciaID === parseInt(selectedCompId));

    const getEquipoNombre = (id) => {
        const eq = equipos.find(e => e.idEquipo === id);
        return eq ? eq.nombre : 'Equipo Libre';
    };

    return (
        <div className="tab-content-layout">
            <div className="panel-card" style={{ padding: '20px' }}>
                <h3 className="ronda-header" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                    <Icon name="medal" /> Seguimiento de Torneos
                </h3>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Selecciona un torneo en curso para ver sus resultados:</label>
                    <select 
                        value={selectedCompId} 
                        onChange={e => setSelectedCompId(e.target.value)} 
                        style={{ maxWidth: '400px' }}
                    >
                        <option value="">-- Seleccionar Torneo --</option>
                        {competenciasActivas.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedCompId ? (
                null 
            ) : !currentFixture ? (
                <div className="panel-card tabla-panel">
                    <div className="tabla-empty">
                        <Icon name="clock" />
                        <p>El fixture para este torneo aún no ha sido publicado por la administración.</p>
                    </div>
                </div>
            ) : (
                <>
                    {currentFixture.rondas.map(ronda => {
                        const todosFinalizados = ronda.partidos.every(p => p.estado === 'finalizado');
                        
                        return (
                            <div key={ronda.id} className="panel-card" style={{ padding: '20px', borderLeft: todosFinalizados ? '4px solid #16a34a' : '4px solid var(--purple)' }}>
                                <div className="toolbar-bordered" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className="ronda-header" style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>
                                        <Icon name="calendar-days" /> {ronda.nombre}
                                    </h3>
                                    {todosFinalizados && <span className="badge success">Fecha Completada</span>}
                                </div>
                                
                                <div className="grid-cards">
                                    {ronda.partidos.map(partido => (
                                        <div key={partido.idPartido} className="partido-card">
                                            
                                            <div className="partido-header">
                                                <span className={`equipo-nombre equipo-local ${partido.resultado?.golesLocal > partido.resultado?.golesVisitante ? 'bold-text' : ''}`}>
                                                    {getEquipoNombre(partido.equipoLocalId)}
                                                </span>
                                                
                                                <div style={{ padding: '0 16px', flex: '0 0 auto' }}>
                                                    {partido.estado === 'finalizado' ? (
                                                        <span className="badge success" style={{ fontSize: '1.2rem', padding: '6px 12px' }}>
                                                            {partido.resultado.golesLocal} - {partido.resultado.golesVisitante}
                                                        </span>
                                                    ) : (
                                                        <span className="badge info" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>VS</span>
                                                    )}
                                                </div>

                                                <span className={`equipo-nombre equipo-visitante ${partido.resultado?.golesVisitante > partido.resultado?.golesLocal ? 'bold-text' : ''}`}>
                                                    {getEquipoNombre(partido.equipoVisitanteId)}
                                                </span>
                                            </div>

                                            {partido.estado === 'finalizado' && partido.resultado?.observaciones && (
                                                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    <Icon name="info" /> {partido.resultado.observaciones}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}