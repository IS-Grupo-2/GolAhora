// src/pages/dashboard/ConfiguracionPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

import PerfilForm from '../../components/configuracion/PerfilForm';
import SeguridadForm from '../../components/configuracion/SeguridadForm';
import SoporteForm from '../../components/configuracion/SoporteForm';
import DangerZone from '../../components/configuracion/DangerZone';
import AccountSummary from '../../components/configuracion/AccountSummary';

import '../../styles/pages/configuracion.css';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

const CONFIG_TABS = [
    {
        id: 'perfil',
        label: 'Mi Perfil',
        icon: 'user',
    },
    {
        id: 'seguridad',
        label: 'Seguridad',
        icon: 'shield',
    },
    {
        id: 'soporte',
        label: 'Soporte',
        icon: 'life-buoy',
    },
    {
        id: 'peligro',
        label: 'Zona de Peligro',
        icon: 'triangle-alert',
        danger: true,
    },
];

export default function ConfiguracionPage() {

    const {
        user,
        updateProfile,
        changePassword,
        deactivateAccount,
        sendSupportMessage,
        logout,
    } = useAuth();

    const [activeTab, setActiveTab] = useState('perfil');

    // Re-render seguro de iconos
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [activeTab]);

    return (
        <div className="config-page">

            {/* PANEL IZQUIERDO */}
            <aside className="config-sidebar">

                <AccountSummary user={user} />

                <div className="config-tabs">
                    {CONFIG_TABS.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                config-tab
                                ${activeTab === tab.id ? 'active' : ''}
                                ${tab.danger ? 'danger' : ''}
                            `}
                        >
                            <Icon name={tab.icon} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* CONTENIDO */}
            <section className="config-content">

                {activeTab === 'perfil' && (
                    <PerfilForm
                        user={user}
                        onUpdateProfile={updateProfile}
                    />
                )}

                {activeTab === 'seguridad' && (
                    <SeguridadForm
                        onChangePassword={changePassword}
                    />
                )}

                {activeTab === 'soporte' && (
                    <SoporteForm
                        user={user}
                        onSendMessage={sendSupportMessage}
                    />
                )}

                {activeTab === 'peligro' && (
                    <DangerZone
                        user={user}
                        onDeactivate={deactivateAccount}
                        onLogout={logout}
                    />
                )}

            </section>
        </div>
    );
}