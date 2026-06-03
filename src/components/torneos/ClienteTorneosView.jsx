import { useEffect, useState } from 'react';
import { useTorneos } from '../../context/TorneosContext';
import ClienteCompetenciasTab from './ClienteCompetenciasTab';
import ClienteFixturesTab from './ClienteFixtureTab';
import EquiposTable from './EquiposTable';
import EquipoModal from './EquipoModal';
import CompetenciaModalDetalle from './CompetenciaModalDetalle';
import EquipoModalDetalle from './EquipoModalDetalle';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

export default function ClienteTorneosView() {
    const { 
        competencias, equipos, fixtures, loading, error, 
        guardarEquipo 
    } = useTorneos();

    const [activeTab, setActiveTab] = useState('disponibles');

    // Estados para Modales
    const [modalEquipoOpen, setModalEquipoOpen] = useState(false);
    const [modalDetalleCompOpen, setModalDetalleCompOpen] = useState(false);
    const [competenciaDetalle, setCompetenciaDetalle] = useState(null);
    const [modalDetalleEquipoOpen, setModalDetalleEquipoOpen] = useState(false);
    const [equipoDetalle, setEquipoDetalle] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [activeTab, modalEquipoOpen, modalDetalleCompOpen, modalDetalleEquipoOpen, competencias, equipos, fixtures]);

    const handleVerDetalleComp = (competencia) => { setCompetenciaDetalle(competencia); setModalDetalleCompOpen(true); };
    const handleVerDetalleEquipoClick = (equipo) => { setEquipoDetalle(equipo); setModalDetalleEquipoOpen(true); };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="dashboard-page-container">
            
            {/* TABS DE NAVEGACIÓN PARA CLIENTES */}
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                {['disponibles', 'mis equipos', 'resultados y fixtures'].map((tab) => (
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

            {/* VISTAS */}
            {activeTab === 'disponibles' && (
                <ClienteCompetenciasTab 
                    competencias={competencias} 
                    onDetalle={handleVerDetalleComp} 
                />
            )}
            
            {activeTab === 'mis equipos' && (
                <EquiposTable 
                    equipos={equipos} 
                    competencias={competencias} 
                    fixtures={fixtures}
                    onNuevo={() => setModalEquipoOpen(true)}
                    onDetalle={handleVerDetalleEquipoClick}
                    // Pasamos props vacías para funciones que el cliente no tiene acceso
                    onEditar={() => {}} 
                    onEliminar={() => {}} 
                    onInscribir={() => {}}
                />
            )}

            {activeTab === 'resultados y fixtures' && (
                <ClienteFixturesTab 
                    competencias={competencias} 
                    fixtures={fixtures} 
                    equipos={equipos}
                />
            )}

            {/* MODALES DEL CLIENTE */}
            <EquipoModal 
                isOpen={modalEquipoOpen} 
                onClose={() => setModalEquipoOpen(false)} 
                onSave={guardarEquipo} 
                equipoEditar={null} // El cliente solo crea equipos nuevos
            />
            
            <CompetenciaModalDetalle 
                open={modalDetalleCompOpen} 
                competencia={competenciaDetalle} 
                onClose={() => setModalDetalleCompOpen(false)} 
                onEditar={null} 
            />
            
            <EquipoModalDetalle 
                open={modalDetalleEquipoOpen} 
                equipo={equipoDetalle} 
                competencias={competencias} 
                onClose={() => setModalDetalleEquipoOpen(false)} 
                onEditar={null} 
            />
        </div>
    );
}