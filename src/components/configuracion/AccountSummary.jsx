import { useEffect } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function AccountSummary({ user }) {

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    const initial = user?.nombre?.charAt(0)?.toUpperCase() ?? '?';

    const fullName = `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim();

    return (
        <div className="account-summary">

            <div className="account-summary-top">

                <div className="account-avatar">
                    {initial}
                </div>

                <div className="account-user-info">
                    <h3>{fullName || 'Usuario'}</h3>

                    <span className={`role-badge role-${user?.rol}`}>
                        {user?.rol ?? 'usuario'}
                    </span>
                </div>
            </div>

            <div className="account-meta">

                <div className="account-meta-item">
                    <Icon name="mail" />
                    <span>{user?.email}</span>
                </div>

                {user?.telefono && (
                    <div className="account-meta-item">
                        <Icon name="phone" />
                        <span>{user.telefono}</span>
                    </div>
                )}

                <div className="account-meta-item">
                    <Icon name="badge-check" />
                    <span>
                        Estado:{' '}
                        <strong className={user?.estado === 'activo' ? 'status-active' : 'status-inactive'}>
                            {user?.estado}
                        </strong>
                    </span>
                </div>

                {user?.rol === 'cliente' && user?.nroSocio && (
                    <div className="account-meta-item">
                        <Icon name="id-card" />
                        <span>Socio {user.nroSocio}</span>
                    </div>
                )}

                {user?.rol !== 'cliente' && user?.legajo && (
                    <div className="account-meta-item">
                        <Icon name="briefcase" />
                        <span>{user.legajo}</span>
                    </div>
                )}

            </div>
        </div>
    );
}