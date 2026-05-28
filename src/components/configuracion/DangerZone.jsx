import { useEffect, useState } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function DangerZone({
    user,
    onDeactivate,
    onLogout,
}) {

    const [confirmText, setConfirmText] = useState('');
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    function handleDeactivate() {

        if (confirmText !== 'DAR DE BAJA') {
            return;
        }

        const result = onDeactivate();

        if (!result.ok) return;

        setCompleted(true);

        setTimeout(() => {
            onLogout();
        }, 1800);
    }

    return (
        <div className="config-card card-danger animate-fade-in">

            <div className="config-card-header">
                <div>
                    <h2>Zona de Peligro</h2>

                    <p className="card-subtitle">
                        Acciones críticas relacionadas con tu cuenta.
                    </p>
                </div>

                <div className="danger-badge">
                    <Icon name="triangle-alert" />
                    <span>Acción irreversible</span>
                </div>
            </div>

            <div className="danger-section">

                <div className="danger-box">

                    <div className="danger-box-content">

                        <h3>Dar de baja cuenta</h3>

                        <p>
                            Tu usuario pasará a estado inactivo y no podrás
                            operar dentro del sistema hasta que un administrador
                            reactive tu cuenta.
                        </p>

                        <ul>
                            <li>Se cancelará el acceso al dashboard</li>
                            <li>Tu cuenta quedará marcada como inactiva</li>
                            <li>Los datos históricos seguirán almacenados</li>
                        </ul>

                    </div>

                </div>

                <div className="danger-confirmation">

                    <label>
                        Escribí <strong>DAR DE BAJA</strong> para confirmar
                    </label>

                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DAR DE BAJA"
                    />

                </div>

                {completed && (
                    <div className="form-alert success">
                        <Icon name="check-circle" />
                        <span>
                            La cuenta de {user?.nombre} fue dada de baja.
                        </span>
                    </div>
                )}

                <div className="config-actions">
                    <button
                        type="button"
                        className="btn-danger-action"
                        disabled={confirmText !== 'DAR DE BAJA'}
                        onClick={handleDeactivate}
                    >
                        Dar de Baja Cuenta
                    </button>
                </div>

            </div>
        </div>
    );
}