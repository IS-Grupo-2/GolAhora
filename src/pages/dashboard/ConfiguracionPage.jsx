import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/configuracion.css';

export default function ConfiguracionPage() {
    const { user, updateProfile, logout } = useAuth(); // Asumiendo que tu AuthContext maneja esto
    const [activeTab, setActiveTab] = useState('perfil');
    
    // Estados para los formularios mapeados al UML
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        userName: user?.userName || '',
        // Campos específicos de la herencia UML
        nroSocio: user?.nroSocio || '',
        legajo: user?.legajo || '',
        cargo: user?.cargo || ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [supportMessage, setSupportMessage] = useState('');

    // RF02 / actualizarDatos()
    const handleUpdateDatos = (e) => {
        e.preventDefault();
        console.log('Invocando modificarDatos() / actualizarDatos() en backend con:', formData);
        alert('¡Datos actualizados con éxito!');
    };

    // cambiarPassword()
    const handleChangePassword = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        console.log('Invocando cambiarPassword()');
        alert('Contraseña modificada correctamente.');
    };

    // RF04 / darDeBaja()
    const handleDarDeBaja = () => {
        const confirmar = window.confirm(
            '¿Estás seguro de que deseas darte de baja? Esta acción cambiará tu estado a inactivo en el sistema.'
        );
        if (confirmar) {
            console.log('Invocando darDeBaja() -> activo: false');
            alert('Cuenta dada de baja correctamente.');
            logout();
        }
    };

    const handleSendSupport = (e) => {
        e.preventDefault();
        alert('Tu mensaje fue enviado al personal del club. ¡Gracias por escribirnos!');
        setSupportMessage('');
    };

    return (
        <div className="config-container">
            {/* Panel de Navegación Izquierdo Interno */}
            <aside className="config-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'perfil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('perfil')}
                >
                    <i data-lucide="user"></i> Mi Perfil
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'seguridad' ? 'active' : ''}`}
                    onClick={() => setActiveTab('seguridad')}
                >
                    <i data-lucide="lock"></i> Seguridad
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'soporte' ? 'active' : ''}`}
                    onClick={() => setActiveTab('soporte')}
                >
                    <i data-lucide="help-circle"></i> Soporte Técnico
                </button>
                <button 
                    className={`tab-btn tab-btn-danger ${activeTab === 'peligro' ? 'active' : ''}`}
                    onClick={() => setActiveTab('peligro')}
                >
                    <i data-lucide="trash-2"></i> Zona de Peligro
                </button>
            </aside>

            {/* Contenido Dinámico según la Pestaña */}
            <main className="config-content">
                
                {/* PESTAÑA 1: PERFIL (RF02 / actualizarDatos) */}
                {activeTab === 'perfil' && (
                    <form onSubmit={handleUpdateDatos} className="config-card animate-fade-in">
                        <h2>Información del Usuario</h2>
                        <p className="card-subtitle">Actualizá tus datos personales registrados en el club.</p>
                        
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Nombre</label>
                                <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Apellido</label>
                                <input type="text" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Teléfono</label>
                                <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                            </div>
                        </div>

                        {/* DEMOSTRACIÓN DE HERENCIA UML EN INTERFAZ */}
                        <div className="uml-badge-section">
                            <span className="uml-badge">Polimorfismo UML detectado: {user?.rol?.toUpperCase()}</span>
                            <div className="form-grid dynamic-grid">
                                {user?.rol === 'cliente' ? (
                                    <div className="input-group readonly">
                                        <label>Número de Socio (Exclusivo Cliente)</label>
                                        <input type="text" value={formData.nroSocio} readOnly />
                                    </div>
                                ) : (
                                    <>
                                        <div className="input-group readonly">
                                            <label>Legajo (PersonalClub)</label>
                                            <input type="text" value={formData.legajo} readOnly />
                                        </div>
                                        <div className="input-group readonly">
                                            <label>Cargo Asignado</label>
                                            <input type="text" value={formData.cargo} readOnly />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-save">Guardar Cambios</button>
                    </form>
                )}

                {/* PESTAÑA 2: SEGURIDAD (cambiarPassword) */}
                {activeTab === 'seguridad' && (
                    <form onSubmit={handleChangePassword} className="config-card animate-fade-in">
                        <h2>Seguridad de la Cuenta</h2>
                        <p className="card-subtitle">Cambiá tu contraseña de acceso regularmente.</p>
                        
                        <div className="input-group block">
                            <label>Contraseña Actual</label>
                            <input type="password" required value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} />
                        </div>
                        <div className="input-group block">
                            <label>Nueva Contraseña</label>
                            <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                        </div>
                        <div className="input-group block">
                            <label>Confirmar Nueva Contraseña</label>
                            <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                        </div>

                        <button type="submit" className="btn-save">Actualizar Contraseña</button>
                    </form>
                )}

                {/* PESTAÑA 3: SOPORTE */}
                {activeTab === 'soporte' && (
                    <div className="config-card animate-fade-in">
                        <h2>¿Tenés algún inconveniente?</h2>
                        <p className="card-subtitle">Escribinos. Nuestro staff técnico o los empleados de administración te responderán a la brevedad.</p>
                        
                        <form onSubmit={handleSendSupport}>
                            <div className="input-group block">
                                <label>Mensaje / Sugerencia / Reclamo</label>
                                <textarea 
                                    rows="5" 
                                    placeholder="Contanos detalladamente qué pasó con tu reserva, pago o asistencia..."
                                    value={supportMessage}
                                    onChange={e => setSupportMessage(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-save">Enviar Mensaje</button>
                        </form>
                    </div>
                )}

                {/* PESTAÑA 4: ZONA DE PELIGRO (RF04 / darseDeBaja) */}
                {activeTab === 'peligro' && (
                    <div className="config-card card-danger animate-fade-in">
                        <h2>Zona de Peligro Irreversible</h2>
                        <p className="card-subtitle">Acciones críticas sobre tu estado de usuario en Gol Ahora.</p>
                        
                        <div className="danger-box">
                            <div className="danger-text">
                                <strong>Solicitar Baja de Cuenta</strong>
                                <p>Tu usuario pasará a estar inactivo. No podrás reservar canchas ni inscribirte a ligas o clases hasta que un Admin reactive tu legajo o registro.</p>
                            </div>
                            <button type="button" onClick={handleDarDeBaja} className="btn-danger-action">
                                Dar de Baja Cuenta
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}