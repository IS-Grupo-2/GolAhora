import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNavForRole } from '../../config/navConfig';
import '../../styles/layout/sidebar.css';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

// Avatar con inicial y boton de Logout
function SidebarUser({ user, onLogoutClick }) {
    const initial = user?.nombre?.charAt(0)?.toUpperCase() ?? '?';

    return (
        <div className="sidebar-user">
            <div className="user-avatar">{initial}</div>
            <div className="user-info">
                <strong>{user?.nombre ?? 'Usuario'}</strong>
                <span style={{ textTransform: 'capitalize' }}>{user?.rol ?? ''}</span>
            </div>
            <button className="logout-btn" aria-label="Cerrar sesión" onClick={onLogoutClick}>
                <Icon name="log-out" />
            </button>
        </div>
    );
}

function NavSection({ section, items, onNavClick }) {
    return (
        <div className="nav-section">
            <p className="nav-title">{section}</p>
            {items.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end ?? false}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    onClick={onNavClick}
                >
                    <Icon name={item.icon} />
                    {item.label}
                </NavLink>
            ))}
        </div>
    );
}

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();
    const navSections      = getNavForRole(user?.rol ?? 'cliente');
    
    // Estado para controlar el modal de cierre de sesión
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Re-inicializar íconos cada vez que cambia el menú o se abre el modal
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [isOpen, navSections, showLogoutModal]);

    function handleConfirmLogout() {
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    }

    return (
        <>
            <div
                className={`sidebar-overlay${isOpen ? ' active' : ''}`}
                onClick={onClose}
            />

            <aside className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
                <div className="sidebar-top">
                    <a href="/" className="logo">
                        <span className="logo-ball">⚽</span>
                        <span>Gol Ahora</span>
                    </a>

                    <nav className="sidebar-nav">
                        {navSections.map(({ section, items }) => (
                            <NavSection
                                key={section}
                                section={section}
                                items={items}
                                onNavClick={onClose}
                            />
                        ))}
                    </nav>
                </div>

                {/* Pasamos la función para abrir el modal */}
                <SidebarUser user={user} onLogoutClick={() => setShowLogoutModal(true)} />
            </aside>

            {/* ── MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN ── */}
            <div className={`dash-modal-overlay ${showLogoutModal ? 'activo' : ''}`}>
                <div className="dash-modal dash-modal--sm">
                    <div className="dash-modal-header">
                        <h3>Cerrar Sesión</h3>
                        <button 
                            className="dash-modal-close" 
                            onClick={() => setShowLogoutModal(false)}
                            aria-label="Cerrar modal"
                        >
                            <Icon name="x" />
                        </button>
                    </div>
                    
                    <div className="dash-modal-body" style={{ textAlign: 'center', padding: '1.5rem 1.4rem' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)' }}>
                            ¿Estás seguro de que deseas salir de <strong>Gol Ahora</strong>?
                        </p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                            Tendrás que volver a ingresar tus credenciales para acceder.
                        </span>
                    </div>
                    
                    <div className="dash-modal-footer">
                        <button 
                            className="btn-modal-cancel" 
                            onClick={() => setShowLogoutModal(false)}
                        >
                            Cancelar
                        </button>
                        <button 
                            className="btn-modal-danger" 
                            onClick={handleConfirmLogout}
                        >
                            <Icon name="log-out" /> Salir
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}