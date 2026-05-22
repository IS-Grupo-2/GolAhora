import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/pages/login.css'

function LoginPage() {

    const { login } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const [errors, setErrors] = useState({})

    // =====================================================
    // MANEJO DE INPUTS
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    // =====================================================
    // VALIDACIONES
    // =====================================================

    const validateForm = () => {
        const newErrors = {}

        // USERNAME / EMAIL
        if (formData.username.trim().length < 4) {newErrors.username = 'Usuario o email inválido'}

        // PASSWORD
        if (formData.password.length < 6) {newErrors.password = 'Contraseña inválida'}

        return newErrors
    }

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = (e) => {
        e.preventDefault()
        const validationErrors = validateForm()

        setErrors(validationErrors)

        // SI TODO ESTÁ OK

        if (Object.keys(validationErrors).length === 0) {

            const result = login({
            email: formData.username,
            password: formData.password
        });

            if (result.ok) {
                console.log('Login válido 🚀');
                navigate('/dashboard');
            } 

            else {setErrors({general: result.error});}
        }
    }

    return (
        <div className="backgroundLogin">
            <header>
                <div className="contenedor-header">
                    <Link to="/" className="button-volver">
                        Volver al inicio
                    </Link>
                </div>
            </header>
            <main>
                <section className="contenedor-formulario" aria-labelledby="titulo-login">

                    <form className="formulario-login" onSubmit={handleSubmit} noValidate>
                        <h1 id="titulo-login">Iniciar sesión</h1>
                        {errors.general && (
                            <small className="error-message">
                                {errors.general}
                            </small>)}

                        {/* USERNAME / EMAIL */}
                        <div className="grupos-elem">
                            <label htmlFor="username">Usuario/Email:</label>

                            <input type="text" id="username" name="username"
                                className={`input-username ${errors.username ? 'input-error' : ''}`}
                                autoComplete="email" value={formData.username} onChange={handleChange} required/>

                            <small className="error-message">{errors.username}</small>
                        </div>

                        {/* PASSWORD */}
                        <div className="grupos-elem password-group">
                            <label htmlFor="password">Contraseña:</label>

                            <div className="password-wrapper">
                                <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                                    minLength="6" className={errors.password ? 'input-error' : ''}
                                    value={formData.password} onChange={handleChange}required/>

                                <button type="button" className="toggle-password" aria-label="Mostrar contraseña"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small className="error-message">{errors.password}</small>
                        </div>

                        {/* LINKS */}
                        <div className="grupos-elem enlaces">
                            <Link to="#" className="link-secundario">
                                ¿Olvidaste tu contraseña?
                            </Link>
                            <Link to="/registro" className="link-principal">
                                Crear cuenta
                            </Link>
                        </div>

                        {/* SUBMIT */}
                        <div className="grupos-elem button-sub">
                            <button type="submit" className="button-submit">
                                Ingresar
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    )
}

export default LoginPage