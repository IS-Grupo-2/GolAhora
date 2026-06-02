import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import { NAV_CONFIG } from '../config/navConfig';
import '../styles/layout/dashboard.css';

// ── Mapa path → meta (título + subtítulo del topbar) ──────────────────────────
const PATH_META = Object.fromEntries(
    NAV_CONFIG.flatMap(s => s.items).map(item => [
        item.path,
        { title: item.label, subtitle: buildSubtitle(item.label) },
    ])
);

function buildSubtitle(label) {
    const map = {
        Dashboard:      'Bienvenido al panel de administración.',
        Reservas:       'Gestión de reservas de canchas.',
        Canchas:        'Administración de canchas.',
        Torneos:        'Ligas y torneos activos.',
        Clases:         'Clases y entrenamientos.',
        Clientes:       'Gestión de usuarios del sistema.',
        Profesores:     'Gestión de profesores y entrenadores.',
        Empleados:      'Gestión de empleados del club.',
        Asistencias:    'Registro de asistencias.',
        Cobros:         'Gestión de cobros y pagos.',
        Recibos:        'Gestión de recibos.',
        Reportes:       'Reportes e informes del sistema.',
        Configuración:  'Configuración del sistema.',
    };
    return map[label] ?? '';
}

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const meta = PATH_META[location.pathname] ?? {
        title: 'Dashboard',
        subtitle: 'Bienvenido al panel de administración.',
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [location.pathname]);

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>

            <main className="main-content" id="main-content">
                {/* TOPBAR */}
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            className="menu-toggle"
                            id="menu-toggle"
                            aria-label="Abrir menú"
                            onClick={() => setSidebarOpen(prev => !prev)}
                        >
                            <Icon name="menu" />
                        </button>
                        <div>
                            <h1 id="topbar-title">{meta.title}</h1>
                            <p id="topbar-subtitle">{meta.subtitle}</p>
                        </div>
                    </div>

                    <div className="topbar-actions">
                        <button className="icon-btn" aria-label="Notificaciones">
                            <Icon name="bell" />
                        </button>
                        <button className="icon-btn" aria-label="Configuración">
                            <Icon name="settings-2" />
                        </button>
                    </div>
                </header>

                {/* CONTENIDO — cada sub-ruta renderiza acá */}
                <section className="dashboard-content" id="dashboard-content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}