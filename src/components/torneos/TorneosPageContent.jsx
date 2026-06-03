import { useState } from 'react';
import { useTorneos } from '../../context/TorneosContext';
import CompetenciasTable from '../../components/torneos/CompetenciasTable';
import CompetenciaModal from '../../components/torneos/CompetenciaModal';
import CompetenciaModalDetalle from '../../components/torneos/CompetenciaModalDetalle';
import EquiposTable from '../../components/torneos/EquiposTable';
import EquipoModal from '../../components/torneos/EquipoModal';
import EquipoModalDetalle from '../../components/torneos/EquipoModalDetalle';
import FixturesTab from '../../components/torneos/FixturesTab';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

export default function TorneosPageContent() {
    const { 
        competencias, equipos, fixtures, loading, error, 
        guardarCompetencia, eliminarCompetencia, 
        guardarEquipo, eliminarEquipo, inscribirEquipo, 
        generarFixture, registrarResultado 
    } = useTorneos();

    // Estado para controlar la pestaña activa: 'competencias', 'equipos' o 'fixtures'
    const [activeTab, setActiveTab] = useState('competencias');

    // ESTADOS PARA MODALES DE COMPETENCIAS
    const [modalCompOpen, setModalCompOpen] = useState(false);
    const [competenciaAEditar, setCompetenciaAEditar] = useState(null);
    const [modalDetalleCompOpen, setModalDetalleCompOpen] = useState(false);
    const [competenciaDetalle, setCompetenciaDetalle] = useState(null);

    // ESTADOS PARA MODALES DE EQUIPOS
    const [modalEquipoOpen, setModalEquipoOpen] = useState(false);
    const [equipoAEditar, setEquipoAEditar] = useState(null);
    const [modalDetalleEquipoOpen, setModalDetalleEquipoOpen] = useState(false);
    const [equipoDetalle, setEquipoDetalle] = useState(null);

    // Handlers para Competencias
    const handleNuevoCompetenciaClick = () => {
        setCompetenciaAEditar(null);
        setModalCompOpen(true);
    };

    const handleEditarCompetenciaClick = (competencia) => {
        setCompetenciaAEditar(competencia);
        setModalCompOpen(true);
    };

    const handleVerDetalleCompetenciaClick = (competencia) => {
        setCompetenciaDetalle(competencia);
        setModalDetalleCompOpen(true);
    };

    // Handlers para Equipos
    const handleNuevoEquipoClick = () => {
        setEquipoAEditar(null);
        setModalEquipoOpen(true);
    };

    const handleEditarEquipoClick = (equipo) => {
        setEquipoAEditar(equipo);
        setModalEquipoOpen(true);
    };

    const handleVerDetalleEquipoClick = (equipo) => {
        setEquipoDetalle(equipo);
        setModalDetalleEquipoOpen(true);
    };

    // Renderizados condicionales de carga y error
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="torneos-page-container" style={{ padding: '20px' }}>
            
            {/* Sistema de Pestañas (Tabs) */}
            <div className="tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    className={`tab-btn ${activeTab === 'competencias' ? 'active' : ''}`}
                    onClick={() => setActiveTab('competencias')}
                >
                    Competencias
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'equipos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('equipos')}
                >
                    Equipos
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'fixtures' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fixtures')}
                >
                    Fixtures
                </button>
            </div>

            {/* Contenido dinámico según la pestaña seleccionada */}
            {activeTab === 'competencias' && (
                <CompetenciasTable 
                    competencias={competencias}
                    onNuevo={handleNuevoCompetenciaClick}
                    onEditar={handleEditarCompetenciaClick}
                    onEliminar={eliminarCompetencia}
                    onDetalle={handleVerDetalleCompetenciaClick}
                />
            )}

            {activeTab === 'equipos' && (
                <EquiposTable 
                    equipos={equipos} 
                    competencias={competencias} 
                    fixtures={fixtures}
                    onInscribir={inscribirEquipo} 
                    onNuevo={handleNuevoEquipoClick}
                    onEditar={handleEditarEquipoClick} 
                    onEliminar={eliminarEquipo} 
                    onDetalle={handleVerDetalleEquipoClick}
                />
            )}

            {activeTab === 'fixtures' && (
                <FixturesTab 
                    competencias={competencias} 
                    fixtures={fixtures} 
                    equipos={equipos}
                    onGenerarFixture={generarFixture} 
                    onRegistrarResultado={registrarResultado}
                />
            )}

            {/* RENDERIZADO DE MODALES */}
            
            {/* Modales de Competencias */}
            <CompetenciaModal 
                isOpen={modalCompOpen} 
                onClose={() => setModalCompOpen(false)} 
                onSave={guardarCompetencia} 
                competenciaEditar={competenciaAEditar} 
            />
            <CompetenciaModalDetalle 
                open={modalDetalleCompOpen} 
                competencia={competenciaDetalle} 
                onClose={() => setModalDetalleCompOpen(false)} 
                onEditar={handleEditarCompetenciaClick} 
            />
            
            {/* Modales de Equipos */}
            <EquipoModal 
                isOpen={modalEquipoOpen} 
                onClose={() => setModalEquipoOpen(false)} 
                onSave={guardarEquipo} 
                equipoEditar={equipoAEditar} 
            />
            <EquipoModalDetalle 
                open={modalDetalleEquipoOpen} 
                equipo={equipoDetalle} 
                competencias={competencias} 
                onClose={() => setModalDetalleEquipoOpen(false)} 
                onEditar={handleEditarEquipoClick} 
            />
            
        </div>
    );
}