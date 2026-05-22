import { useState } from 'react';

function Icon({ name }) {
    return <span dangerouslySetInnerHTML={{ __html: `<i data-lucide="${name}"></i>` }} />;
}

export default function FixturesTab({ competencias, fixtures, equipos, onGenerarFixture, onRegistrarResultado }) {
    const [selectedCompId, setSelectedCompId] = useState('');
    const [modalPartido, setModalPartido] = useState(null); // Partido seleccionado para modal de resultado
    const [golesLocal, setGolesLocal] = useState(0);
    const [golesVisitante, setGolesVisitante] = useState(0);
    const [faltas, setFaltas] = useState(0);
    const [observaciones, setObservaciones] = useState('');

    const currentFixture = fixtures.find(f => f.competenciaID === parseInt(selectedCompId));
    const currentCompetencia = competencias.find(c => c.id === parseInt(selectedCompId));

    const getEquipoNombre = (id) => {
        const eq = equipos.find(e => e.idEquipo === id);
        return eq ? eq.nombre : 'Equipo Libre';
    };

    const abrirModalResultado = (partido) => {
        setModalPartido(partido);
        if (partido.resultado) {
            setGolesLocal(partido.resultado.golesLocal);
            setGolesVisitante(partido.resultado.golesVisitante);
            setFaltas(partido.resultado.faltas);
            setObservaciones(partido.resultado.observaciones);
        } else {
            setGolesLocal(0);
            setGolesVisitante(0);
            setFaltas(0);
            setObservaciones('');
        }
    };

    const handleSubmitResultado = (e) => {
        e.preventDefault();
        onRegistrarResultado(parseInt(selectedCompId), modalPartido.idPartido, {
            golesLocal,
            golesVisitante,
            faltas,
            observaciones
        });
        setModalPartido(null);
    };

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Fixtures & Partidos</h2>
                </div>
                <div className="crud-toolbar-right">
                    <div className="form-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                        <label style={{ whiteSpace: 'nowrap', marginBottom: 0 }}>Filtro Competencia:</label>
                        <select value={selectedCompId} onChange={e => setSelectedCompId(e.target.value)} style={{ width: '220px' }}>
                            <option value="">-- Ver Competencia --</option>
                            {competencias.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
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
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Equipos inscriptos actualmente: {currentCompetencia?.equipos?.length || 0}
                        </p>
                        <button className="btn-primary-action" style={{ marginTop: '15px' }} onClick={() => onGenerarFixture(parseInt(selectedCompId))}>
                            <Icon name="git-branch" /> Generar Cuadro Automático
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Barra de progreso visual de fechas */}
                    <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ color: 'var(--text)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon name="target" />
                            Progreso del Fixture
                        </h4>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', overflowX: 'auto', paddingBottom: '8px' }}>
                            {currentFixture.rondas.map((ronda) => {
                                const todosFinalizados = ronda.partidos.every(p => p.estado === 'finalizado');
                                return (
                                    <div
                                        key={ronda.id}
                                        style={{
                                            flex: '0 0 auto',
                                            padding: '10px 16px',
                                            borderRadius: '6px',
                                            background: todosFinalizados ? 'rgba(22, 163, 74, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                            border: `1px solid ${todosFinalizados ? '#16a34a' : '#8b5cf6'}`,
                                            color: todosFinalizados ? '#16a34a' : '#8b5cf6',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                            {todosFinalizados && <Icon name="check-circle-2" />}
                                            {ronda.nombre}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                                            {ronda.partidos.filter(p => p.estado === 'finalizado').length}/{ronda.partidos.length} finalizados
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Listado de rondas y partidos */}
                    {currentFixture.rondas.map(ronda => (
                        <div key={ronda.id} className="panel-card" style={{ padding: '20px' }}>
                            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon name="zap" /> {ronda.nombre}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                                {ronda.partidos.map(partido => (
                                    <div key={partido.idPartido} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontWeight: '600', minWidth: '140px', textAlign: 'right', fontSize: '0.95rem' }}>
                                                {getEquipoNombre(partido.equipoLocalId)}
                                            </span>
                                            
                                            <span className={`badge ${partido.estado === 'finalizado' ? 'success' : 'warning'}`} style={{ fontSize: '1rem', padding: '8px 16px', minWidth: '80px', textAlign: 'center' }}>
                                                {partido.estado === 'finalizado' 
                                                    ? `${partido.resultado.golesLocal} - ${partido.resultado.golesVisitante}`
                                                    : 'VS'
                                                }
                                            </span>

                                            <span style={{ fontWeight: '600', minWidth: '140px', fontSize: '0.95rem' }}>
                                                {getEquipoNombre(partido.equipoVisitanteId)}
                                            </span>
                                        </div>

                                        <button className="action-btn edit" style={{ background: 'var(--purple)', color: '#fff', padding: '10px 16px', height: 'auto', borderRadius: '6px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }} onClick={() => abrirModalResultado(partido)}>
                                            <Icon name="clipboard-check" /> {partido.estado === 'finalizado' ? 'Editar Resultado' : 'Cargar Resultado'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DETALLE / REGISTRO DE RESULTADO (RF34) */}
            {modalPartido && (
                <div className="dash-modal-overlay activo" onClick={() => setModalPartido(null)}>
                    <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="dash-modal-header">
                            <h3>Registrar Marcador</h3>
                            <button className="dash-modal-close" onClick={() => setModalPartido(null)}>
                                <Icon name="x" />
                            </button>
                        </div>
                        <div className="dash-modal-body">
                            <form onSubmit={handleSubmitResultado}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginBottom: '15px' }}>
                                    <div className="form-group" style={{ flex: 1, textAlign: 'center' }}>
                                        <label>{getEquipoNombre(modalPartido.equipoLocalId)}</label>
                                        <input type="number" min="0" value={golesLocal} onChange={e => setGolesLocal(e.target.value)} required style={{ textAlign: 'center', fontSize: '1.2rem' }} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, textAlign: 'center' }}>
                                        <label>{getEquipoNombre(modalPartido.equipoVisitanteId)}</label>
                                        <input type="number" min="0" value={golesVisitante} onChange={e => setGolesVisitante(e.target.value)} required style={{ textAlign: 'center', fontSize: '1.2rem' }} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Cantidad de Faltas Totales del Encuentro</label>
                                    <input type="number" min="0" value={faltas} onChange={e => setFaltas(e.target.value)} />
                                </div>

                                <div className="form-group">
                                    <label>Observaciones / Amonestados</label>
                                    <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows="3" placeholder="Ej: Tarjeta roja al N° 10 local..."></textarea>
                                </div>

                                <div className="dash-modal-footer" style={{ padding: '15px 0 0 0' }}>
                                    <button type="button" className="btn-modal-cancel" onClick={() => setModalPartido(null)}>Cerrar</button>
                                    <button type="submit" className="btn-modal-save">Guardar Fin del Partido</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}