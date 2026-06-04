import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReservas } from '../../context/ReservasContext';
import { useClientes } from '../../context/ClientesContext';
import { useClases } from '../../context/ClasesContext';
import { useTorneos } from '../../context/TorneosContext';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

// ── Atajos Globales del Sistema Configurados por Rol ──────────────────────────
const ALL_SHORTCUTS = [
    { path: '/dashboard/reservas',     icon: 'calendar-days',   color: 'purple', label: 'Reservar Cancha', roles: ['Admin', 'Employee', 'Client'] },
    { path: '/dashboard/clases',       icon: 'dumbbell',        color: 'green',  label: 'Inscripción Clases',roles: ['Admin', 'Employee', 'Professor', 'Client'] },
    { path: '/dashboard/torneos',      icon: 'trophy',          color: 'purple', label: 'Torneos y Ligas', roles: ['Admin', 'Employee', 'Client'] },
    { path: '/dashboard/clientes',     icon: 'users',           color: 'blue',   label: 'Control Clientes', roles: ['Admin', 'Employee'] },
    { path: '/dashboard/canchas',      icon: 'goal',            color: 'green',  label: 'Gestión Canchas',  roles: ['Admin', 'Employee'] },
    { path: '/dashboard/cobros',       icon: 'wallet',          color: 'yellow', label: 'Caja y Cobros',    roles: ['Admin', 'Employee'] },
    { path: '/dashboard/asistencias',  icon: 'clipboard-check', color: 'yellow', label: 'Tomar Asistencia', roles: ['Admin', 'Employee', 'Professor'] },
    { path: '/dashboard/reportes',     icon: 'bar-chart-3',     color: 'blue',   label: 'Métricas/Auditoría',roles: ['Admin', 'Employee'] },
];

function StatCard({ icon, color, label, value }) {
    return (
        <article className="stat-card">
            <div className={`stat-icon ${color}`}>
                <Icon name={icon} />
            </div>
            <div>
                <span className="stat-label">{label}</span>
                <h2>{value}</h2>
            </div>
        </article>
    );
}

function ShortcutCard({ icon, color, label, path, navigate }) {
    return (
        <button className="shortcut-card" onClick={() => navigate(path)}>
            <div className={`shortcut-icon ${color}`}>
                <Icon name={icon} />
            </div>
            <span>{label}</span>
        </button>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Conexión segura a los Contextos reales de la aplicación
    const { reservas, fetchReservas, loading: loadingRes } = useReservas();
    const { clientes, fetchClientes, loading: loadingCli } = useClientes();
    const { clases, fetchClases, loading: loadingCla } = useClases();
    const { competencias } = useTorneos();

    const rol = user?.role ?? 'Client';
    const isAdminOrEmployee = rol === 'Admin' || rol === 'Employee';
    const isProfessor = rol === 'Professor';
    const isClient = rol === 'Client';

    // Fecha actual simulada en base al contexto del sistema (2026-06-04)
    const HOY_STR = '2026-06-04';

    // Carga inicial y reactiva de los contextos según los privilegios del token del usuario
    useEffect(() => {
        if (fetchReservas) fetchReservas();
        if (fetchClases) fetchClases();
        if (isAdminOrEmployee && fetchClientes) {
            fetchClientes();
        }
    }, [fetchReservas, fetchClases, fetchClientes, isAdminOrEmployee]);

    // Efecto para re-inicializar los iconos vectoriales de Lucide tras cargas dinámicas
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    });

    const shortcuts = ALL_SHORTCUTS.filter(s => s.roles.includes(rol));
    const isLoading = loadingRes || loadingCla || (isAdminOrEmployee && loadingCli);

    if (isLoading) {
        return (
            <div className="coming-soon-view">
                <div className="coming-soon-icon">
                    <Icon name="refresh-cw" />
                </div>
                <h3>Cargando información</h3>
                <p>Sincronizando los datos de Gol Ahora con el servidor...</p>
            </div>
        );
    }

    // ── PROCESAMIENTO DE ESTADÍSTICAS EN TIEMPO REAL ───────────────────────────
    let statsData = [];
    let panelIzquierdo = null;
    let panelDerecho = null;

    if (isAdminOrEmployee) {
        // --- MÉTRICAS DE ADMINISTRACIÓN GLOBAL ---
        const reservasHoy = reservas.filter(r => r.fechaUso === HOY_STR && r.estado !== 'cancelada');
        
        const ingresosTotales = reservas
            .filter(r => r.cobro?.estado === 'pagado')
            .reduce((sum, r) => sum + (r.montoTotal || 0), 0);

        const canchasActivasCount = new Set(
            reservas.filter(r => r.fechaUso === HOY_STR && r.estado === 'confirmada').map(r => r.cancha?.idCancha)
        ).size;

        const clientesActivosCount = clientes.filter(c => c.activo).length;

        statsData = [
            { icon: 'calendar-check', color: 'purple', label: 'Reservas Hoy', value: reservasHoy.length.toString() },
            { icon: 'wallet-cards', color: 'yellow', label: 'Ingresos Totales', value: `$${ingresosTotales.toLocaleString('es-AR')}` },
            { icon: 'goal', color: 'green', label: 'Canchas Ocupadas Hoy', value: canchasActivasCount.toString() },
            { icon: 'users', color: 'blue', label: 'Clientes Activos', value: clientesActivosCount.toString() }
        ];

        // --- PANELES ADMINISTRATIVOS ---
        const proximasReservasGlobal = reservas
            .filter(r => r.estado !== 'cancelada')
            .slice(0, 5);

        panelIzquierdo = (
            <article className="panel-card">
                <div className="panel-header">
                    <div>
                        <h3>Próximas Reservas Globales</h3>
                        <p>Últimos turnos registrados en el complejo.</p>
                    </div>
                    <button className="panel-btn" onClick={() => navigate('/dashboard/reservas')}>Ver todas</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Cancha</th>
                                <th>Horario</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proximasReservasGlobal.map((r, i) => (
                                <tr key={r.idReserva || i}>
                                    <td>{r.cliente?.nombre} {r.cliente?.apellido}</td>
                                    <td>{r.cancha?.nombre || `Nro ${r.cancha?.numero}`}</td>
                                    <td>{r.horaInicio} hs ({r.fechaUso})</td>
                                    <td>
                                        <span className={`badge ${r.estado === 'confirmada' ? 'success' : 'warning'}`}>
                                            {r.estado.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </article>
        );

        panelDerecho = (
            <article className="panel-card">
                <div className="panel-header">
                    <div>
                        <h3>Actividad del Sistema</h3>
                        <p>Estado de competencias y ligas vigentes.</p>
                    </div>
                    <button className="panel-btn" onClick={() => navigate('/dashboard/torneos')}>Ligas</button>
                </div>
                <div className="activity-list">
                    {competencias.map((c, i) => (
                        <div className="activity-item" key={c.id || i}>
                            <div className={`activity-dot ${c.estado === 'en_curso' ? 'purple' : 'yellow'}`} />
                            <p>
                                <strong>{c.nombre}</strong> ({c.tipo.toUpperCase()}): Actualmente en estado de{' '}
                                <span className="td-email">{c.estado}</span> con {c.equipos?.length || 0} equipos listos.
                            </p>
                        </div>
                    ))}
                </div>
            </article>
        );

    } else if (isProfessor) {
        // Filtrar clases asignadas al profesor logueado
        const misClases = clases.filter(c => c.profesor?.idUsuario === user?.idUsuario || c.profesor === null);
        const clasesPendientes = misClases.filter(c => c.estado === 'programada' || c.estado === 'en_curso');
        
        const totalAlumnosAsignados = misClases.reduce((sum, c) => sum + (c.alumnos?.length || 0), 0);

        statsData = [
            { icon: 'dumbbell', color: 'green', label: 'Mis Clases Totales', value: misClases.length.toString() },
            { icon: 'calendar-days', color: 'purple', label: 'Clases Pendientes', value: clasesPendientes.length.toString() },
            { icon: 'users', color: 'blue', label: 'Alumnos a Cargo', value: totalAlumnosAsignados.toString() },
            { icon: 'clipboard-check', color: 'yellow', label: 'Hoy (Fecha)', value: HOY_STR }
        ];

        // --- PANELES DEL PROFESOR ---
        panelIzquierdo = (
            <article className="panel-card">
                <div className="panel-header">
                    <div>
                        <h3>Cronograma de Clases</h3>
                        <p>Tus módulos y entrenamientos asignados en la agenda.</p>
                    </div>
                    <button className="panel-btn" onClick={() => navigate('/dashboard/clases')}>Ver grilla</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Clase / Torneo</th>
                                <th>Ubicación / Cancha</th>
                                <th>Horario / Fecha</th>
                                <th>Alumnos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {misClases.slice(0, 5).map((c, i) => (
                                <tr key={c.idClase || i}>
                                    <td><strong>{c.nombre}</strong> <span className="td-email">({c.tipoClase})</span></td>
                                    <td>{c.cancha}</td>
                                    <td>{c.horario} hs ({c.fecha})</td>
                                    <td>
                                        <span className="badge success">
                                            {c.alumnos?.length || 0} / {c.maxAlumnos} Inscriptos
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </article>
        );

        panelDerecho = (
            <article className="panel-card">
                <div className="panel-header">
                    <div>
                        <h3>Novedades de Asistencia</h3>
                        <p>Últimos reportes de alumnos en canchas.</p>
                    </div>
                </div>
                <div className="activity-list">
                    {misClases.filter(c => c.alumnos?.length > 0).slice(0, 4).map((c, i) => (
                        <div className="activity-item" key={i}>
                            <div className="activity-dot green" />
                            <p>
                                Módulo <strong>{c.nombre}</strong> cuenta con alumnos confirmados esperando inicio del entrenamiento.
                            </p>
                        </div>
                    ))}
                </div>
            </article>
        );

    } else if (isClient) {

        // Filtrar reservas que pertenezcan al cliente actual
        const misReservas = reservas.filter(r => r.cliente?.idUsuario === user?.idUsuario || r.reservador?.id === user?.idUsuario);
        const misReservasActivas = misReservas.filter(r => r.estado === 'confirmada' || r.estado === 'pendiente');
        
        // Clases donde el cliente se encuentra inscripto
        const misClasesInscripto = clases.filter(c => 
            c.alumnos?.some(al => al.id === user?.idUsuario || al.nombre?.includes(user?.nombre))
        );

        statsData = [
            { icon: 'calendar-days', color: 'purple', label: 'Mis Reservas Activas', value: misReservasActivas.length.toString() },
            { icon: 'dumbbell', color: 'green', label: 'Mis Clases Semanales', value: misClasesInscripto.length.toString() },
            { icon: 'trophy', color: 'yellow', label: 'Mis Torneos Activos', value: '1' },
            { icon: 'wallet', color: 'blue', label: 'Historial de Pagos', value: misReservas.length.toString() }
        ];

        // --- PANELES DEL CLIENTE ---
        panelIzquierdo = (
            <article className="panel-card">
                <div className="panel-header">
                    <div>
                        <h3>Mis Próximos Turnos</h3>
                        <p>Tus reservas de canchas vigentes en Gol Ahora.</p>
                    </div>
                    <button className="panel-btn" onClick={() => navigate('/dashboard/reservas')}>Reservar otra</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Cancha Reservada</th>
                                <th>Fecha de Uso</th>
                                <th>Horario</th>
                                <th>Estado del Turno</th>
                            </tr>
                        </thead>
                        <tbody>
                            {misReservasActivas.length > 0 ? (
                                misReservasActivas.slice(0, 5).map((r, i) => (
                                    <tr key={r.idReserva || i}>
                                        <td><strong>{r.cancha?.nombre || `Cancha N° ${r.cancha?.numero}`}</strong></td>
                                        <td>{r.fechaUso}</td>
                                        <td>{r.horaInicio} a {r.horaFin} hs</td>
                                        <td>
                                            <span className={`badge ${r.estado === 'confirmada' ? 'success' : 'warning'}`}>
                                                {r.estado.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px 0' }}>
                                        No tenés reservas activas de canchas para los próximos días.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </article>
        );

        panelDerecho = (
            <article className="panel-card">
                <div className="panel-header">
                    <div>
                        <h3>Mis Clases e Inscripciones</h3>
                        <p>Turnos fijos de entrenamiento de esta semana.</p>
                    </div>
                    <button className="panel-btn" onClick={() => navigate('/dashboard/clases')}>Explorar</button>
                </div>
                <div className="activity-list">
                    {misClasesInscripto.length > 0 ? (
                        misClasesInscripto.map((c, i) => (
                            <div className="activity-item" key={c.idClase || i}>
                                <div className="activity-dot green" />
                                <p>
                                    Estás inscripto a <strong>{c.nombre}</strong> los días {c.fecha} a las {c.horario} hs en {c.cancha}.
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="coming-soon-view" style={{ minHeight: 'auto', padding: '10px 0' }}>
                            <p style={{ fontSize: '0.88rem' }}>No estás anotado a ninguna clase grupal o escuelita todavía.</p>
                        </div>
                    )}
                </div>
            </article>
        );
    }

    return (
        <div className="dashboard-content">
            {/* RENDERIZADO DINÁMICO DE MÉTRICAS */}
            <section className="stats-grid">
                {statsData.map(s => <StatCard key={s.label} {...s} />)}
            </section>

            {/* ACCESOS RÁPIDOS DINÁMICOS BASADOS EN PERMISOS */}
            {shortcuts.length > 0 && (
                <section className="shortcuts-section">
                    <h3 className="section-subtitle">Atajos Rápidos del Sistema</h3>
                    <div className="shortcuts-grid">
                        {shortcuts.map(s => (
                            <ShortcutCard key={s.path} {...s} navigate={navigate} />
                        ))}
                    </div>
                </section>
            )}

            {/* GRILLA DE PANELES DE INFORMACIÓN PRINCIPAL */}
            <section className="content-grid">
                {panelIzquierdo}
                {panelDerecho}
            </section>
        </div>
    );
}