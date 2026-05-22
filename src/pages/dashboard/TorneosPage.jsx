import { useState, useEffect } from 'react';
import CompetenciasTable from '../../components/torneos/CompetenciasTable';
import CompetenciaModal from '../../components/torneos/CompetenciaModal';
import CompetenciaModalDetalle from '../../components/torneos/CompetenciaModalDetalle'; // Importamos el nuevo modal
import EquiposTable from '../../components/torneos/EquiposTable';
import EquipoModal from '../../components/torneos/EquipoModal';
import EquipoModalDetalle from '../../components/torneos/EquipoModalDetalle';
import FixturesTab from '../../components/torneos/FixturesTab';
import { useTorneos } from '../../hooks/useTorneos';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function TorneosPage() {
    const { 
        competencias, 
        equipos, 
        fixtures,
        guardarCompetencia, 
        eliminarCompetencia,
        guardarEquipo,
        eliminarEquipo,
        inscribirEquipoEnCompetencia,
        generarFixture,
        registrarResultadoPartido
    } = useTorneos();

    const [activeTab, setActiveTab] = useState('competencias');
    
    // Estados Modales Competencias
    const [modalCompOpen, setModalCompOpen] = useState(false);
    const [competenciaAEditar, setCompetenciaAEditar] = useState(null);
    
    const [modalDetalleCompOpen, setModalDetalleCompOpen] = useState(false);
    const [competenciaDetalle, setCompetenciaDetalle] = useState(null);

    // Estados Modales Equipos
    const [modalEquipoOpen, setModalEquipoOpen] = useState(false);
    const [equipoAEditar, setEquipoAEditar] = useState(null);
    const [modalDetalleEquipoOpen, setModalDetalleEquipoOpen] = useState(false);
    const [equipoDetalle, setEquipoDetalle] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [activeTab, modalCompOpen, modalDetalleCompOpen, modalEquipoOpen, modalDetalleEquipoOpen, competencias, equipos]);

    // Handlers Competencias
    const handleNuevaCompetenciaClick = () => {
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

    // Handlers Equipos
    const handleEditarEquipoClick = (equipo) => {
        setEquipoAEditar(equipo);
        setModalEquipoOpen(true);
    };

    const handleNuevoEquipoClick = () => {
        setEquipoAEditar(null);
        setModalEquipoOpen(true);
    };

    const handleVerDetalleEquipoClick = (equipo) => {
        setEquipoDetalle(equipo);
        setModalDetalleEquipoOpen(true);
    };

    return (
        <div className="torneos-page">
            <div className="module-tabs">
                <button className={`module-tab ${activeTab === 'competencias' ? 'active' : ''}`} onClick={() => setActiveTab('competencias')}>
                    <Icon name="trophy" /> Competencias
                </button>
                <button className={`module-tab ${activeTab === 'equipos' ? 'active' : ''}`} onClick={() => setActiveTab('equipos')}>
                    <Icon name="users" /> Equipos
                </button>
                <button className={`module-tab ${activeTab === 'fixtures' ? 'active' : ''}`} onClick={() => setActiveTab('fixtures')}>
                    <Icon name="calendar-range" /> Fixtures & Resultados
                </button>
            </div>

            <div id="torneos-tab-content" style={{ marginTop: '20px' }}>
                {activeTab === 'competencias' && (
                    <CompetenciasTable 
                        competencias={competencias} 
                        onNuevo={handleNuevaCompetenciaClick} 
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
                        onNuevo={handleNuevoEquipoClick}
                        onEditar={handleEditarEquipoClick}
                        onEliminar={eliminarEquipo}
                        onInscribir={inscribirEquipoEnCompetencia}
                        onDetalle={handleVerDetalleEquipoClick}
                    />
                )}

                {activeTab === 'fixtures' && (
                    <FixturesTab 
                        competencias={competencias}
                        fixtures={fixtures}
                        equipos={equipos}
                        onGenerarFixture={generarFixture}
                        onRegistrarResultado={registrarResultadoPartido}
                    />
                )}
            </div>

            {/* Modales Competencias */}
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

            {/* Modales Equipos */}
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