import { useState, useEffect } from 'react';
import Can from '../Can';

function Icon({ name }) {
    return <span dangerouslySetInnerHTML={{ __html: `<i data-lucide="${name}"></i>` }} />;
}

export default function FixturesTab({ competencias, fixtures, equipos, onGenerarFixture, onRegistrarResultado }) {
    const [selectedCompId, setSelectedCompId] = useState('');
    const [modalPartido, setModalPartido] = useState(null); 
    const [golesLocal, setGolesLocal] = useState(0);
    const [golesVisitante, setGolesVisitante] = useState(0);
    const [faltas, setFaltas] = useState(0);
    const [observaciones, setObservaciones] = useState('');

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    const currentFixture = fixtures.find(f => f.competenciaID === parseInt(selectedCompId));
    const currentCompetencia = competencias.find(c => c.id === parseInt(selectedCompId));

    const getEquipoNombre = (id) => {
        const eq = equipos.find(e => e.idEquipo === id);
        return eq ? eq.nombre : 'Equipo Libre';
    };

    const abrirModalResultado = (partido) => {
        setModalPartido(partido);
        if (partido.resultado) {
            setGolesLocal(partido.resultado.golesLocal); setGolesVisitante(partido.resultado.golesVisitante);
            setFaltas(partido.resultado.faltas); setObservaciones(partido.resultado.observaciones);
        } else {
            setGolesLocal(0); setGolesVisitante(0); setFaltas(0); setObservaciones('');
        }
    };

    const handleSubmitResultado = (e) => {
        e.preventDefault();
        onRegistrarResultado(parseInt(selectedCompId), modalPartido.idPartido, { golesLocal, golesVisitante, faltas, observaciones });
        setModalPartido(null);
    };

    return (
        <div className="tab-content-layout">
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Fixtures & Partidos</h2>
                </div>
                <div className="crud-toolbar-right">
                    <div className="form-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                        <label style={{ whiteSpace: 'nowrap', marginBottom: 0 }}>Filtro Competencia:</label>
                        <select value={selectedCompId} onChange={e => setSelectedCompId(e.target.value)} style={{ width: '220px' }}>
                            <option value="">-- Ver Competencia --</option>
                            {competencias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {!selectedCompId ? (
                <div className="panel-card tabla-panel">
                    <div className="tabla-empty">
                        <Icon name="calendar-days" />
                        <p>Por favor seleccione una competencia de la lista desplegable superior.</p>
                    </div>
                </div>
            ) : !currentFixture ? (
                <div className="panel-card tabla-panel">
                    <div className="tabla-empty">
                        <Icon name="alert-triangle" />
                        <p>Esta competencia aún no tiene su fixture generado.</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Equipos inscriptos actualmente: {currentCompetencia?.equipos?.length || 0}</p>
                        <Can roles={['Admin', 'Employee']}>
                            <button className="btn-primary-action" style={{ marginTop: '15px' }} onClick={() => onGenerarFixture(parseInt(selectedCompId))}>
                                <Icon name="git-branch" /> Generar Cuadro Automático
                            </button>
                        </Can>
                    </div>
                </div>
            ) : (
                <>
                    <div className="panel-card" style={{ padding: '20px' }}>
                        <h4 className="ronda-header" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                            <Icon name="target" /> Progreso del Fixture
                        </h4>
                        <div className="progreso-container">
                            {currentFixture.rondas.map((ronda) => {
                                const todosFinalizados = ronda.partidos.every(p => p.estado === 'finalizado');
                                return (
                                    <div key={ronda.id} className={`progreso-pill ${todosFinalizados ? 'green' : 'purple'}`}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                            {todosFinalizados && <Icon name="check-circle-2" />} {ronda.nombre}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                                            {ronda.partidos.filter(p => p.estado === 'finalizado').length}/{ronda.partidos.length} finalizados
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {currentFixture.rondas.map(ronda => (
                        <div key={ronda.id} className="panel-card" style={{ padding: '20px' }}>
                            <h3 className="ronda-header">
                                <Icon name="zap" /> {ronda.nombre}
                            </h3>
                            <div className="grid-cards">
                                {ronda.partidos.map(partido => (
                                    <div key={partido.idPartido} className="partido-card">
                                        <div className="partido-header">
                                            <span className="equipo-nombre equipo-local">{getEquipoNombre(partido.equipoLocalId)}</span>
                                            <span className={`badge ${partido.estado === 'finalizado' ? 'success' : 'warning'}`} style={{ fontSize: '1rem', padding: '8px 16px' }}>
                                                {partido.estado === 'finalizado' ? `${partido.resultado.golesLocal} - ${partido.resultado.golesVisitante}` : 'VS'}
                                            </span>
                                            <span className="equipo-nombre equipo-visitante">{getEquipoNombre(partido.equipoVisitanteId)}</span>
                                        </div>

                                        <Can roles={['Admin', 'Employee']}>
                                            <button className="btn-primary-action" style={{ width: '100%', justifyContent: 'center' }} onClick={() => abrirModalResultado(partido)}>
                                                <Icon name="clipboard-check" /> {partido.estado === 'finalizado' ? 'Editar Resultado' : 'Cargar Resultado'}
                                            </button>
                                        </Can>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}


            {modalPartido && (
                <div className="dash-modal-overlay activo" onClick={() => setModalPartido(null)}>
                    <div className="dash-modal dash-modal--sm" onClick={e => e.stopPropagation()}>
                        <div className="dash-modal-header">
                            <h3>Registrar Marcador</h3>
                            <button className="dash-modal-close" onClick={() => setModalPartido(null)}><Icon name="x" /></button>
                        </div>
                        <div className="dash-modal-body">
                            <form onSubmit={handleSubmitResultado}>
                                <div className="form-row" style={{ marginBottom: '15px' }}>
                                    <div className="form-group" style={{ textAlign: 'center' }}>
                                        <label>{getEquipoNombre(modalPartido.equipoLocalId)}</label>
                                        <input type="number" min="0" value={golesLocal} onChange={e => setGolesLocal(e.target.value)} required style={{ textAlign: 'center', fontSize: '1.2rem' }} />
                                    </div>
                                    <div className="form-group" style={{ textAlign: 'center' }}>
                                        <label>{getEquipoNombre(modalPartido.equipoVisitanteId)}</label>
                                        <input type="number" min="0" value={golesVisitante} onChange={e => setGolesVisitante(e.target.value)} required style={{ textAlign: 'center', fontSize: '1.2rem' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Cantidad de Faltas Totales</label>
                                    <input type="number" min="0" value={faltas} onChange={e => setFaltas(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Observaciones / Amonestados</label>
                                    <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows="3" className="form-group" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', color: 'var(--text)' }} placeholder="Ej: Tarjeta roja al N° 10 local..."></textarea>
                                </div>
                                <div className="dash-modal-footer" style={{ marginTop: '15px' }}>
                                    <button type="button" className="btn-modal-cancel" onClick={() => setModalPartido(null)}>Cerrar</button>
                                    <button type="submit" className="btn-modal-save">Guardar Marcador</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
