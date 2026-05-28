import { useState } from 'react'
import { Link } from 'react-router-dom'
import LG from '../../assets/logo/LG.png'
import cancha1 from '../../assets/images/Cancha1.png'
import cancha2 from '../../assets/images/Cancha2.png'
import cancha3 from '../../assets/images/Cancha3.png'
import '../../styles/pages/home.css'

function HomePage() {

    const [menuOpen, setMenuOpen] = useState(false)
    const [galeriaOpen, setGaleriaOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <div className='home-page'>
            <header>
                <div className="container-header">
                    <div className="logo">
                        <img src={LG} alt="Logo de Gol Ahora" />
                    </div>
                    <nav className={`nav-header ${menuOpen ? 'active' : ''}`} aria-label="Navegación principal">
                        <ul className="ul-nav-header">
                            <li className="li-nav-header">
                                <a href="/" className="a-nav-header">Inicio</a>
                            </li>
                            <li className="li-nav-header">
                                <button className="a-nav-header contacto" onClick={() => setModalOpen(true)}>
                                    Contacto
                                </button>
                            </li>
                        </ul>
                    </nav>

                    <div className="buttons-header">
                        <Link className="button-header" to="/registro">
                            Registrarse
                        </Link>
                        <Link className="button-header" to="/login">
                            Iniciar Sesión
                        </Link>
                    </div>
                    <button className="menu-toggle" aria-label="Abrir menú" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}> ☰</button>
                </div>
            </header>

            {/* MODAL */}
            {modalOpen && (
                <div className="modal-contacto activo" onClick={() => setModalOpen(false)}>
                    <div className="modal-box" role="dialog" aria-modal= "true" onClick={(e) => e.stopPropagation()}>
                        <span className="cerrar-modal" onClick={() => setModalOpen(false)}> ✖</span>
                        <h3>Contacto</h3>
                        <p>📸 Instagram: @golahora</p>
                        <p>📞 Teléfono: 11-1234-5678</p>
                        <p>📧 Email: contacto@golahora.com</p>
                    </div>
                </div>
            )}

            <div className='backgroundHome'>
                <main>
                    {/* HERO */}
                    <section className="hero">
                        <div className="container">
                            <div className="presentacion-hero h2">
                                <h1>Reservá tu cancha en segundos ⚽</h1>
                                <p>Gestioná reservas, torneos, clases y mucho más en un solo lugar.</p>
                            </div>
                            <div className="hero-buttons">
                                <a href="/login" className="btn-primary">Reservar ahora</a>
                                <button className="btn-secondary" onClick={() => 
                                    setGaleriaOpen(!galeriaOpen)}> {galeriaOpen ? 'Ocultar' : 'Ver canchas'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* GALERIA */}
                    <section className={`galeria ${galeriaOpen ? 'abierta' : ''}`}>
                        <img src={cancha1} loading="lazy" alt="Cancha 1" />
                        <img src={cancha2} loading="lazy" alt="Cancha 2" />
                        <img src={cancha3} loading="lazy" alt="Cancha 3" />
                    </section>

                    {/* INFO */}
                    <section className="info">
                        <div className="container">
                            <div className="h2">
                                <h2>¿Qué esperás para empezar?</h2>
                            </div>
                            <div className="grid-info">
                                <div className="card">
                                    <h3>👤 Hacete cliente</h3>
                                    <p>Registro, modificación, consultas y administración ultra simple y completa del sistema.</p>
                                </div>
                                <div className="card">
                                    <h3>🏟️ Canchas</h3>
                                    <p>Alquilá distintos tipos de canchas con 100% de disponibilidad.</p>
                                </div>
                                <div className="card">
                                    <h3>📅 Reservas Inteligentes</h3>
                                    <p>Reservá o cancela en cualquier momento. (Consultar políticas de reembolso).</p>
                                </div>
                                <div className="card">
                                    <h3>🏆 Torneos y Ligas</h3>
                                    <p>Inscribite como jugador a torneos y ligas de diferentes categorias.</p>
                                </div>
                                <div className="card">
                                    <h3>🏃 Clases y Entrenamientos</h3>
                                    <p>Inscribite a clases y entrenamientos personalizadas con los mejores profesionales..</p>
                                </div>
                                <div className="card">
                                    <h3>💳 Cobros y Pagos</h3>
                                    <p>Aceptamos todos los medios de pago electrónicos y efectivo.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* COMO FUNCIONA */}
                    <section className="como-funciona">
                        <div className="container">
                            <div className="h2">
                                <h2>¿Cómo funciona?</h2>
                            </div>
                            <div className="steps">
                                <div className="step">
                                    <span>1</span>
                                    <h3>Elegí tu cancha</h3>
                                    <p>Consultá disponibilidad en tiempo real.</p>
                                </div>
                                <div className="step">
                                    <span>2</span>
                                    <h3>Reservá</h3>
                                    <p>Seleccioná fecha y horario en segundos.</p>
                                </div>
                                <div className="step">
                                    <span>3</span>
                                    <h3>Pagá y jugá</h3>
                                    <p>Confirmación automática con pago validado.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* BENEFICIOS */}
                    <section className="beneficios">
                        <div className="container">
                            <div className="h2">
                                <h2>¿Por qué usar Gol Ahora?</h2>
                            </div>
                            <ul className="beneficios-list">
                                <li>✔ Reservas con hasta 30 días de anticipación</li>
                                <li>✔ Elegí canchas de 5, 7 y 11 con alta disponibilidad</li>
                                <li>✔ Sistema rápido y seguro para el usuario</li>
                                <li>✔ Compatible con PC, Android e iOS</li>
                                <li>✔ Integración con pagos electrónicos</li>
                                <li>✔ Los mejores profesionales para tus clases y entrenamientos</li>
                            </ul>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="cta">
                        <div className="container-end">
                            <div className="h2-end">
                                <h2>Empezá a jugar hoy</h2>
                                <p>Unite a la mejor plataforma de gestión deportiva.</p>
                            </div>
                            <Link to="/registro" className="btn-primary">
                                Crear cuenta
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
            <footer>
                <p>© 2026 Gol Ahora. Todos los derechos reservados.</p>
                <p>Creado por el grupo 2 de la comisión 1</p>
                <p>Integrantes: Franco Díaz, Milena, Nahuel, Cristian, Mateo, Julieta, Joaquin</p>
            </footer>
        </div>
    )
}

export default HomePage