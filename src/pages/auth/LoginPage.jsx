import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/pages/login.css'

function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false) // <-- Estado de carga para el backend
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.email.includes('@') || !formData.email.includes('.')) {
            newErrors.email = 'Email inválido'
        }
        if (formData.password.length < 6) { newErrors.password = 'Contraseña inválida' }
        return newErrors
    }

    const handleSubmit = async (e) => { // <-- Se vuelve async
        e.preventDefault()
        const validationErrors = validateForm()
        setErrors(validationErrors)

        if (Object.keys(validationErrors).length === 0) {
            setLoading(true);
            try {
                // Consumimos el login asíncrono
                const result = await login(formData);

                if (result.ok) {
                    console.log('Login válido');
                    navigate('/dashboard');
                } else {
                    setErrors({ general: result.error });
                }
            } catch {
                setErrors({ general: 'Error al intentar conectar con el servidor.' });
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div className="backgroundLogin">
            <header>
                <div className="contenedor-header">
                    <Link to="/" className="button-volver">Volver al inicio</Link>
                </div>
            </header>
            <main>
                <section className="contenedor-formulario" aria-labelledby="titulo-login">
                    <form className="formulario-login" onSubmit={handleSubmit} noValidate>
                        <h1 id="titulo-login">Iniciar sesión</h1>
                        {errors.general && <small className="error-message">{errors.general}</small>}

                        <div className="grupos-elem">
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email"
                                className={`input-username ${errors.email ? 'input-error' : ''}`}
                                autoComplete="email" value={formData.email} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.email}</small>
                        </div>

                        <div className="grupos-elem password-group">
                            <label htmlFor="password">Contraseña:</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                                    className={errors.password ? 'input-error' : ''}
                                    value={formData.password} onChange={handleChange} required disabled={loading}/>
                                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small className="error-message">{errors.password}</small>
                        </div>

                        <div className="grupos-elem enlaces">
                            <Link to="#" className="link-secundario">¿Olvidaste tu contraseña?</Link>
                            <Link to="/registro" className="link-principal">Crear cuenta</Link>
                        </div>

                        <div className="grupos-elem button-sub">
                            <button type="submit" className="button-submit" disabled={loading}>
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    )
}

export default LoginPage
