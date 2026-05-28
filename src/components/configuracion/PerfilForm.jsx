import { useEffect, useState } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function PerfilForm({
    user,
    onUpdateProfile,
}) {

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        username: '',
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {

        setFormData({
            nombre: user?.nombre || '',
            apellido: user?.apellido || '',
            email: user?.email || '',
            telefono: user?.telefono || '',
            username: user?.username || '',
        });

    }, [user]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    function handleChange(e) {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(e) {

        e.preventDefault();

        setSuccessMessage('');
        setErrorMessage('');

        const result = onUpdateProfile(formData);

        if (!result.ok) {
            setErrorMessage(result.error);
            return;
        }

        setSuccessMessage(result.message);

        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    }

    return (
        <div className="config-card animate-fade-in">

            <div className="config-card-header">
                <div>
                    <h2>Información Personal</h2>

                    <p className="card-subtitle">
                        Administrá los datos de tu cuenta y perfil.
                    </p>
                </div>

                <div className="profile-status">
                    <Icon name="shield-check" />
                    <span>Cuenta verificada</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>

                <div className="form-grid">

                    <div className="input-group">
                        <label>Nombre</label>

                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Apellido</label>

                        <input
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Teléfono</label>

                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                <div className="readonly-section">

                    <h3>Información del Sistema</h3>

                    <div className="form-grid">

                        <div className="input-group readonly">
                            <label>Usuario</label>

                            <input
                                type="text"
                                value={formData.username}
                                readOnly
                            />
                        </div>

                        <div className="input-group readonly">
                            <label>Rol</label>

                            <input
                                type="text"
                                value={user?.rol || ''}
                                readOnly
                            />
                        </div>

                        {user?.rol === 'cliente' && (
                            <div className="input-group readonly">
                                <label>Número de Socio</label>

                                <input
                                    type="text"
                                    value={user?.nroSocio || ''}
                                    readOnly
                                />
                            </div>
                        )}

                        {user?.rol !== 'cliente' && (
                            <>
                                <div className="input-group readonly">
                                    <label>Legajo</label>

                                    <input
                                        type="text"
                                        value={user?.legajo || ''}
                                        readOnly
                                    />
                                </div>

                                <div className="input-group readonly">
                                    <label>Cargo</label>

                                    <input
                                        type="text"
                                        value={user?.cargo || ''}
                                        readOnly
                                    />
                                </div>
                            </>
                        )}

                    </div>
                </div>

                {successMessage && (
                    <div className="form-alert success">
                        <Icon name="check-circle" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="form-alert error">
                        <Icon name="circle-alert" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="config-actions">
                    <button
                        type="submit"
                        className="btn-save"
                    >
                        Guardar Cambios
                    </button>
                </div>

            </form>
        </div>
    );
}