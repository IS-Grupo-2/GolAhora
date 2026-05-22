import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/pages/registro.css'

function RegistroPage() {

    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        fechaNacimiento: '',
        telefono: '',
        user: '',
        email: '',
        password: ''
    })

    const [errors, setErrors] = useState({})

    // =====================================================
    // MANEJO DE INPUTS
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData({...formData, [name]: value})
    }

    // =====================================================
    // VALIDACIONES
    // =====================================================

    const validateForm = () => {
        const newErrors = {}
        // NOMBRE
        if (formData.nombre.trim().length < 2) {newErrors.nombre = 'Nombre muy corto'}

        // APELLIDO
        if (formData.apellido.trim().length < 2) {newErrors.apellido = 'Apellido muy corto'}

        // DNI
        if (formData.dni.length < 7 || formData.dni.length > 8 || isNaN(formData.dni)) {newErrors.dni = 'DNI inválido'}

        // TELÉFONO
        if (formData.telefono.length < 8 || formData.telefono.length > 15) {newErrors.telefono = 'Teléfono inválido'}

        // USUARIO
        if (formData.user.trim().length < 4 || formData.user.trim().length > 20) {
            newErrors.user = 'El nombre de usuario debe tener entre 4 y 20 caracteres'
        }

        // EMAIL
        if (!formData.email.includes('@') || !formData.email.includes('.')) {newErrors.email = 'Email inválido'}

        // PASSWORD
        if (formData.password.length < 6) {newErrors.password = 'Mínimo 6 caracteres'}

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
            console.log('Formulario válido 🚀')
            console.log(formData)

            // FETCH AL BACKEND
        }
    }

    return (
        <div className='backgroundLogin'>
            <header>
                <div className="contenedor-header">
                    <Link to="/" className="button-volver">
                        Volver al inicio
                    </Link>
                </div>
            </header>
            <main>
                <section className="contenedor-formulario">
                    <form className="formulario" onSubmit={handleSubmit} noValidate>
                        <h1>Crear cuenta</h1>

                        {/* NOMBRE Y APELLIDO */}
                        <div className="grupos-elem nom-ape">

                            <label htmlFor="nombre">Nombres:</label>

                            <input type="text" id="nombre" name="nombre" className={`input-nombre ${errors.nombre ? 'input-error' : ''}`}
                                autoComplete="given-name" value={formData.nombre} onChange={handleChange} required/>
                            <small className="error-message">{errors.nombre}</small>

                            <label htmlFor="apellido">Apellido:</label>

                            <input type="text" id="apellido" name="apellido" className={`input-apellido ${errors.apellido ? 'input-error' : ''}`}
                                autoComplete="family-name" value={formData.apellido} onChange={handleChange} required/>
                            <small className="error-message">{errors.apellido}</small>
                        </div>

                        {/* DNI */}
                        <div className="grupos-elem">
                            <label htmlFor="dni">Dni:</label>

                            <input type="text" id="dni" name="dni" className={`input-dni ${errors.dni ? 'input-error' : ''}`}
                                inputMode="numeric" pattern="[0-9]{7,8}" placeholder="Ej: 40255711"
                                value={formData.dni} onChange={handleChange} required/>

                            <small className="error-message">{errors.dni}</small>
                        </div>

                        {/* FECHA NACIMIENTO */}
                        <div className="grupos-elem">
                            <label htmlFor="fechaNacimiento">Fecha de nacimiento:</label>

                            <input type="date" id="fechaNacimiento" name="fechaNacimiento"
                                className={`input-fecha-nacimiento ${errors.fechaNacimiento ? 'input-error' : ''}`}
                                value={formData.fechaNacimiento}onChange={handleChange}/>

                            <small className="error-message">{errors.fechaNacimiento}</small>
                        </div>

                        {/* TELEFONO */}
                        <div className="grupos-elem">

                            <label htmlFor="telefono">Teléfono:</label>

                            <input type="text" id="telefono" name="telefono"
                                className={`input-telefono ${errors.telefono ? 'input-error' : ''}`}
                                autoComplete="tel" placeholder="+54 11..."
                                value={formData.telefono} onChange={handleChange} required/>

                            <small className="error-message">{errors.telefono}</small>
                        </div>

                        {/* USER */}
                        <div className="grupos-elem">

                            <label htmlFor="user">Nombre de Usuario:</label>

                            <input type="text" id="user" name="user"
                                className={`input-user ${errors.user ? 'input-error' : ''}`}
                                autoComplete="username" value={formData.user} onChange={handleChange} required/>

                            <small className="error-message">{errors.user} </small>
                        </div>

                        {/* EMAIL */}
                        <div className="grupos-elem">

                            <label htmlFor="email">Correo:</label>

                            <input type="email" id="email" name="email"
                                className={`input-email ${errors.email ? 'input-error' : ''}`}
                                autoComplete="email" value={formData.email}
                                onChange={handleChange} required/>

                            <small className="error-message">{errors.email}</small>
                        </div>

                        {/* PASSWORD */}
                        <div className="grupos-elem password-group">

                            <label htmlFor="password">Contraseña</label>

                            <div className="password-wrapper">
                                <input type={showPassword? 'text' : 'password'} id="password" name="password" minLength="6"
                                    className={errors.password ? 'input-error' : ''} value={formData.password}
                                    onChange={handleChange} required/>

                                <button type="button" className="toggle-password" aria-label="Mostrar contraseña"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small className="error-message">
                                {errors.password}
                            </small>
                        </div>

                        {/* LINKS */}
                        <div className="grupos-elem enlaces">
                            <Link to="/login" className="link-principal">
                                ¿Ya tenes una cuenta?
                            </Link>
                        </div>

                        {/* SUBMIT */}
                        <div className="grupos-elem button-sub">
                            <button type="submit" className="button-submit">Crear cuenta</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    )
}

export default RegistroPage