import { useNavigate } from 'react-router-dom';
import { useAuth }   from '../../context/AuthContext';


// ── Íconos vía Lucide CDN ─────────────────────────────────────────────────────
function Icon({ name }) {
    return <i data-lucide={name} />;
}

// ── Datos ─────────────────────────────────────────────────────────────────────
const STATS = [
    { icon: 'calendar-check', color: 'purple', label: 'Reservas Hoy',    value: '128'          },
    { icon: 'wallet-cards',   color: 'yellow', label: 'Ingresos del Día', value: '$1.485.000'   },
    { icon: 'goal',           color: 'green',  label: 'Canchas Activas',  value: '12'           },
    { icon: 'users',          color: 'blue',   label: 'Clientes Activos', value: '324'          },
];

const ALL_SHORTCUTS = [
    { path: '/dashboard/clientes',  icon: 'users',        color: 'blue',   label: 'Clientes',  roles: ['admin', 'empleado']                    },
    { path: '/dashboard/reservas',  icon: 'calendar-days',color: 'purple', label: 'Reservas',  roles: ['admin', 'empleado', 'cliente']          },
    { path: '/dashboard/canchas',   icon: 'goal',         color: 'green',  label: 'Canchas',   roles: ['admin', 'empleado']                    },
    { path: '/dashboard/cobros',    icon: 'wallet',       color: 'yellow', label: 'Cobros',    roles: ['admin', 'empleado']                    },
    { path: '/dashboard/torneos',   icon: 'trophy',       color: 'purple', label: 'Torneos',   roles: ['admin', 'empleado']                    },
    { path: '/dashboard/clases',    icon: 'dumbbell',     color: 'green',  label: 'Clases',    roles: ['admin', 'empleado', 'profesor','cliente'] },
    { path: '/dashboard/reportes',  icon: 'bar-chart-3',  color: 'blue',   label: 'Reportes',  roles: ['admin']                                },
    { path: '/dashboard/asistencias',icon:'clipboard-check',color:'yellow',label:'Asistencias',roles: ['admin', 'empleado', 'profesor']         },
];

const PROXIMAS_RESERVAS = [
    { cliente: 'Juan Pérez',    cancha: 'Cancha 3', horario: '18:00', estado: 'success', estadoLabel: 'Confirmada' },
    { cliente: 'Martín López',  cancha: 'Cancha 1', horario: '19:30', estado: 'warning', estadoLabel: 'Pendiente' },
    { cliente: 'Lucas Díaz',    cancha: 'Cancha 5', horario: '21:00', estado: 'success', estadoLabel: 'Confirmada' },
];

const ACTIVIDAD = [
    { color: 'purple', text: 'Nueva reserva registrada para Cancha 2.' },
    { color: 'yellow', text: 'Cobro validado correctamente.'            },
    { color: 'green',  text: 'Nuevo cliente registrado.'               },
    { color: 'blue',   text: 'Fixture actualizado en torneo apertura.' },
];

// ── Sub-componentes ────────────────────────────────────────────────────────────
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

// ── Página principal ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const { user }   = useAuth();
    const navigate   = useNavigate();
    const rol        = user?.role ?? 'Client';

    const shortcuts = ALL_SHORTCUTS.filter(s => s.roles.includes(rol));


    return (
        <>
            {/* STATS */}
            <section className="stats-grid">
                {STATS.map(s => <StatCard key={s.label} {...s} />)}
            </section>

            {/* ACCESOS RÁPIDOS */}
            {shortcuts.length > 0 && (
                <section className="shortcuts-section">
                    <h3 className="section-subtitle">Accesos rápidos</h3>
                    <div className="shortcuts-grid">
                        {shortcuts.map(s => (
                            <ShortcutCard key={s.path} {...s} navigate={navigate} />
                        ))}
                    </div>
                </section>
            )}

            {/* CONTENT GRID */}
            <section className="content-grid">
                {/* Próximas reservas */}
                <article className="panel-card">
                    <div className="panel-header">
                        <div>
                            <h3>Próximas Reservas</h3>
                            <p>Reservas confirmadas para hoy.</p>
                        </div>
                        <button className="panel-btn" onClick={() => navigate('/dashboard/reservas')}>
                            Ver todas
                        </button>
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
                                {PROXIMAS_RESERVAS.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.cliente}</td>
                                        <td>{r.cancha}</td>
                                        <td>{r.horario}</td>
                                        <td>
                                            <span className={`badge ${r.estado}`}>
                                                {r.estadoLabel}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </article>

                {/* Actividad reciente */}
                <article className="panel-card">
                    <div className="panel-header">
                        <div>
                            <h3>Actividad Reciente</h3>
                            <p>Últimos movimientos del sistema.</p>
                        </div>
                    </div>
                    <div className="activity-list">
                        {ACTIVIDAD.map((a, i) => (
                            <div className="activity-item" key={i}>
                                <div className={`activity-dot ${a.color}`} />
                                <p>{a.text}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </>
    );
}