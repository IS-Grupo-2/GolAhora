import { useEffect, useState } from 'react';
import { useTorneos } from '../../context/TorneosContext';
import { useAuth } from '../../context/AuthContext';
import ClienteCompetenciasTab from './ClienteCompetenciasTab';
import ClienteFixturesTab from './ClienteFixtureTab';
import EquiposTable from './EquiposTable';
import EquipoModal from './EquipoModal';
import CompetenciaModalDetalle from './CompetenciaModalDetalle';
import EquipoModalDetalle from './EquipoModalDetalle';
import CompetenciasFooter from './CompetenciasFooter';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

function nombreUsuario(usuario) {
    return `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim() || usuario?.username || usuario?.email || '';
}

function equipoPerteneceAlUsuario(equipo, user) {
    if (!user) return false;

    const idsUsuario = [user.idUsuario, user.id].filter(Boolean).map(String);
    const creadoPor = equipo.creadoPor || {};
    const idsEquipo = [creadoPor.idUsuario, creadoPor.id].filter(Boolean).map(String);

    if (idsUsuario.some(id => idsEquipo.includes(id))) return true;

    const emailUsuario = user.email?.toLowerCase();
    if (emailUsuario && creadoPor.email?.toLowerCase() === emailUsuario) return true;

    const usernameUsuario = (user.username || user.userName)?.toLowerCase();
    if (usernameUsuario && (creadoPor.username || creadoPor.userName)?.toLowerCase() === usernameUsuario) return true;

    const nombreActual = nombreUsuario(user);
    return Boolean(nombreActual && (
        equipo.capitan === nombreActual ||
        equipo.integrantes?.includes(nombreActual)
    ));
}

function usuarioEsCapitan(equipo, user) {
    const nombreActual = nombreUsuario(user);
    return Boolean(nombreActual && equipo?.capitan === nombreActual);
}

export default function ClienteTorneosView() {
    const { 
        competencias, equipos, fixtures, loading, error, 
        guardarEquipo,
        inscribirEquipo,
    } = useTorneos();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('disponibles');

    // Estados para Modales
    const [modalEquipoOpen, setModalEquipoOpen] = useState(false);
    const [equipoAEditar, setEquipoAEditar] = useState(null);
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
    const handleEditarEquipoClick = (equipo) => { setEquipoAEditar(equipo); setModalEquipoOpen(true); };
    const misEquipos = equipos.filter(equipo => equipoPerteneceAlUsuario(equipo, user));

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
                    equipos={misEquipos} 
                    competencias={competencias} 
                    fixtures={fixtures}
                    onNuevo={() => { setEquipoAEditar(null); setModalEquipoOpen(true); }}
                    onDetalle={handleVerDetalleEquipoClick}
                    // Pasamos props vacías para funciones que el cliente no tiene acceso
                    onEditar={handleEditarEquipoClick} 
                    onEliminar={() => {}} 
                    onInscribir={inscribirEquipo}
                    puedeEditarEquipo={(equipo) => usuarioEsCapitan(equipo, user)}
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
                onClose={() => { setModalEquipoOpen(false); setEquipoAEditar(null); }} 
                onSave={guardarEquipo} 
                equipoEditar={equipoAEditar}
                usuarioActual={user}
                modoCliente
            />
            
            <CompetenciaModalDetalle 
                open={modalDetalleCompOpen} 
                competencia={competenciaDetalle} 
                onClose={() => setModalDetalleCompOpen(false)} 
                onEditar={usuarioEsCapitan(equipoDetalle, user) ? handleEditarEquipoClick : null} 
            />
            
            <EquipoModalDetalle 
                open={modalDetalleEquipoOpen} 
                equipo={equipoDetalle} 
                competencias={competencias} 
                onClose={() => setModalDetalleEquipoOpen(false)} 
                onEditar={null} 
            />

            <CompetenciasFooter />
        </div>
    );
}
