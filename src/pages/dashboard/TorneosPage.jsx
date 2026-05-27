import { useEffect, useState } from 'react';
import { TorneosProvider, useTorneos } from '../../context/TorneosContext';
import CompetenciasTable from '../../components/torneos/CompetenciasTable';
import CompetenciaModal from '../../components/torneos/CompetenciaModal';
import CompetenciaModalDetalle from '../../components/torneos/CompetenciaModalDetalle';
import EquiposTable from '../../components/torneos/EquiposTable';
import EquipoModal from '../../components/torneos/EquipoModal';
import EquipoModalDetalle from '../../components/torneos/EquipoModalDetalle';
import FixturesTab from '../../components/torneos/FixturesTab';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

export default function TorneosPage() {
    return (
        <TorneosProvider>
            <TorneosPageContent />
        </TorneosProvider>
    );
}

function TorneosPageContent() {
    const { 
        competencias, equipos, fixtures, loading, error, 
        guardarCompetencia, eliminarCompetencia, 
        guardarEquipo, eliminarEquipo, inscribirEquipo, 
        generarFixture, registrarResultado 
    } = useTorneos();

    const [activeTab, setActiveTab] = useState('competencias');

    // ESTADOS MODALES
    const [modalCompOpen, setModalCompOpen] = useState(false);
    const [competenciaAEditar, setCompetenciaAEditar] = useState(null);
    const [modalDetalleCompOpen, setModalDetalleCompOpen] = useState(false);
    const [competenciaDetalle, setCompetenciaDetalle] = useState(null);

    const [modalEquipoOpen, setModalEquipoOpen] = useState(false);
    const [equipoAEditar, setEquipoAEditar] = useState(null);
    const [modalDetalleEquipoOpen, setModalDetalleEquipoOpen] = useState(false);
    const [equipoDetalle, setEquipoDetalle] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [activeTab, modalCompOpen, modalDetalleCompOpen, modalEquipoOpen, modalDetalleEquipoOpen, competencias, equipos, fixtures]);

    // HANDLERS COMPETENCIAS
    const handleNuevaCompetenciaClick = () => { setCompetenciaAEditar(null); setModalCompOpen(true); };
    const handleEditarCompetenciaClick = (competencia) => { setCompetenciaAEditar(competencia); setModalCompOpen(true); };
    const handleVerDetalleComp = (competencia) => { setCompetenciaDetalle(competencia); setModalDetalleCompOpen(true); };

    // HANDLERS EQUIPOS
    const handleNuevoEquipoClick = () => { setEquipoAEditar(null); setModalEquipoOpen(true); };
    const handleEditarEquipoClick = (equipo) => { setEquipoAEditar(equipo); setModalEquipoOpen(true); };
    const handleVerDetalleEquipoClick = (equipo) => { setEquipoDetalle(equipo); setModalDetalleEquipoOpen(true); };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="dashboard-page-container">
            
            {/* TABS DE NAVEGACIÓN */}
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                {['competencias', 'equipos', 'fixtures'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 4px', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '1rem', fontWeight: '600', textTransform: 'capitalize',
                            color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
                            borderBottom: activeTab === tab ? '2px solid var(--purple)' : '2px solid transparent'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* VISTAS CONDICIONALES */}
            {activeTab === 'competencias' && (
                <CompetenciasTable 
                    competencias={competencias} onNuevo={handleNuevaCompetenciaClick}
                    onEditar={handleEditarCompetenciaClick} onEliminar={eliminarCompetencia} onDetalle={handleVerDetalleComp}
                />
            )}
            
            {activeTab === 'equipos' && (
                <EquiposTable 
                    equipos={equipos} competencias={competencias} fixtures={fixtures}
                    onInscribir={inscribirEquipo} onNuevo={handleNuevoEquipoClick}
                    onEditar={handleEditarEquipoClick} onEliminar={eliminarEquipo} onDetalle={handleVerDetalleEquipoClick}
                />
            )}

            {activeTab === 'fixtures' && (
                <FixturesTab 
                    competencias={competencias} fixtures={fixtures} equipos={equipos}
                    onGenerarFixture={generarFixture} onRegistrarResultado={registrarResultado}
                />
            )}

            {/* RENDERIZADO DE MODALES */}
            <CompetenciaModal isOpen={modalCompOpen} onClose={() => setModalCompOpen(false)} onSave={guardarCompetencia} competenciaEditar={competenciaAEditar} />
            <CompetenciaModalDetalle open={modalDetalleCompOpen} competencia={competenciaDetalle} onClose={() => setModalDetalleCompOpen(false)} onEditar={handleEditarCompetenciaClick} />
            
            <EquipoModal isOpen={modalEquipoOpen} onClose={() => setModalEquipoOpen(false)} onSave={guardarEquipo} equipoEditar={equipoAEditar} />
            <EquipoModalDetalle open={modalDetalleEquipoOpen} equipo={equipoDetalle} competencias={competencias} onClose={() => setModalDetalleEquipoOpen(false)} onEditar={handleEditarEquipoClick} />
            
        </div>
    );
}