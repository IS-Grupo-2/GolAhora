import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNavForRole } from '../../config/navConfig';
import '../../styles/layout/sidebar.css';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

function SidebarUser({ user, onLogout }) {
    const initial = user?.nombre?.charAt(0)?.toUpperCase() ?? '?';

    return (
        <div className="sidebar-user">
            <div className="user-avatar">{initial}</div>
            <div className="user-info">
                <strong>{user?.nombre ?? 'Usuario'}</strong>
                <span style={{ textTransform: 'capitalize' }}>{user?.rol ?? ''}</span>
            </div>
            <button className="logout-btn" aria-label="Cerrar sesión" onClick={onLogout}>
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

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [isOpen, navSections]);

    function handleLogout() {
        if (window.confirm('¿Cerrar sesión?')) {
            logout();
            navigate('/login');
        }
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

                <SidebarUser user={user} onLogout={handleLogout} />
            </aside>
        </>
    );
}