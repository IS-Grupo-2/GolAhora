import { useState } from 'react'
import { useClientes } from '../../context/ClientesContext';
import { useAuth } from '../../context/AuthContext'; // <-- Importamos Auth para impactar la sesión
import { Link, useNavigate } from 'react-router-dom' // <-- Importamos useNavigate
import '../../styles/pages/registro.css'

function RegistroPage() {
    const { crearCliente } = useClientes();
    const { loginDirect } = useAuth(); // <-- Traemos la acción de login directo
    const navigate = useNavigate(); // <-- Instanciamos el router
    
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false) // <-- Manejo de UI para los 4.3s de espera
    const [generalError, setGeneralError] = useState('');

    const [formData, setFormData] = useState({
        name: '', lastname: '', dni: '', userName: '', email: '', phoneNumber: '', password: '', role: 'Client'
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({...formData, [name]: value})
    }

    const validateForm = () => {
        const newErrors = {}
        if (formData.name.trim().length < 2) { newErrors.name = 'Nombre muy corto' }
        if (formData.lastname.trim().length < 2) { newErrors.lastname = 'Apellido muy corto' }
        if (formData.dni.length < 7 || formData.dni.length > 8 || isNaN(formData.dni)) { newErrors.dni = 'DNI inválido' }
        if (formData.phoneNumber.length < 8 || formData.phoneNumber.length > 15) { newErrors.phoneNumber = 'Teléfono inválido' }
        if (formData.userName.trim().length < 4 || formData.userName.trim().length > 20) {
            newErrors.userName = 'El usuario debe tener entre 4 y 20 caracteres'
        }
        if (!formData.email.includes('@') || !formData.email.includes('.')) { newErrors.email = 'Email inválido' }
        if (formData.password.length < 6) { newErrors.password = 'Mínimo 6 caracteres' }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setLoading(true);
            try {
                const nuevoCliente = {
                    name: formData.name,
                    lastname: formData.lastname,
                    dni: formData.dni,
                    phoneNumber: formData.phoneNumber,
                    userName: formData.userName,
                    email: formData.email,
                    password: formData.password,
                    role: 'Client',
                    fechaRegistro: new Date().toISOString().split('T')[0]
                };

                // 1. Envía los datos al servidor / mock
                const clienteCreado = await crearCliente(nuevoCliente);
                console.log('Cliente creado con éxito:', clienteCreado);

                // 2. Inyectamos los datos del nuevo cliente en el AuthContext
                // loginDirect(clienteCreado);

                // 3. Redirección al dashboard
                navigate('/dashboard');

            } catch (error) {
                console.error('Error al registrar cliente:', error);
                setGeneralError('Hubo un error al procesar el registro. Intente nuevamente.');
            } finally {
                setLoading(false);
                }
        }
    };

    return (
        <div className='backgroundLogin'>
            <header>
                <div className="contenedor-header">
                    <Link to="/" className="button-volver">Volver al inicio</Link>
                </div>
            </header>
            <main>
                <section className="contenedor-formulario">
                    <form className="formulario" onSubmit={handleSubmit} noValidate>
                        <h1>Crear cuenta</h1>
                        {generalError && <small className="error-message general-error">{generalError}</small>}

                        {/* NOMBRES Y APELLIDO */}
                        <div className="grupos-elem nom-ape">
                            <label htmlFor="name">Nombres:</label>
                            <input type="text" id="name" name="name" className={errors.name ? 'input-error' : ''}
                                value={formData.name} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.name}</small>

                            <label htmlFor="lastname">Apellido:</label>
                            <input type="text" id="lastname" name="lastname" className={errors.lastname ? 'input-error' : ''}
                                value={formData.lastname} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.lastname}</small>
                        </div>

                        {/* DNI */}
                        <div className="grupos-elem">
                            <label htmlFor="dni">Dni:</label>
                            <input type="text" id="dni" name="dni" className={errors.dni ? 'input-error' : ''}
                                placeholder="Ej: 40255711" value={formData.dni} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.dni}</small>
                        </div>

                        {/* TELEFONO */}
                        <div className="grupos-elem">
                            <label htmlFor="phoneNumber">Teléfono:</label>
                            <input type="text" id="phoneNumber" name="phoneNumber" className={errors.phoneNumber ? 'input-error' : ''}
                                placeholder="+54 11..." value={formData.phoneNumber} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.phoneNumber}</small>
                        </div>

                        {/* USER */}
                        <div className="grupos-elem">
                            <label htmlFor="userName">Nombre de Usuario:</label>
                            <input type="text" id="userName" name="userName" className={errors.userName ? 'input-error' : ''}
                                value={formData.userName} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.userName}</small>
                        </div>

                        {/* EMAIL */}
                        <div className="grupos-elem">
                            <label htmlFor="email">Correo:</label>
                            <input type="email" id="email" name="email" className={errors.email ? 'input-error' : ''}
                                value={formData.email} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.email}</small>
                        </div>

                        {/* PASSWORD */}
                        <div className="grupos-elem password-group">
                            <label htmlFor="password">Contraseña</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                                    className={errors.password ? 'input-error' : ''} value={formData.password}
                                    onChange={handleChange} required disabled={loading}/>
                                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small className="error-message">{errors.password}</small>
                        </div>

                        <div className="grupos-elem enlaces">
                            <Link to="/login" className="link-principal">¿Ya tenés una cuenta?</Link>
                        </div>

                        <div className="grupos-elem button-sub">
                            <button type="submit" className="button-submit" disabled={loading}>
                                {loading ? 'Procesando registro...' : 'Crear cuenta'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    )
}

export default RegistroPage