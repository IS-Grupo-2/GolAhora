import { useClases } from '../../context/ClasesContext';
import { useAsistencias } from '../../context/AsistenciasContext';

function enPeriodo(fecha, desde, hasta) {
    if (!fecha) return false;
    return fecha >= desde && fecha <= hasta;
}

export default function ReporteAsistencias({ periodoDesde, periodoHasta }) {
    const { clases = [] } = useClases();
    const { asistenciasPorClase: registrosPorClase = {} } = useAsistencias();

    const clasesPeriodo = clases.filter(c => enPeriodo(c.fecha, periodoDesde, periodoHasta));
    const resumenPorClase = clasesPeriodo.map((clase, idx) => {
        const alumnos = clase.alumnos || [];
        const registros = registrosPorClase[String(clase.idClase)] || registrosPorClase[clase.idClase];
        const asistentes = Array.isArray(registros)
            ? registros.filter(r => r.presente).length
            : alumnos.filter(a => a.presente).length;
        const capacidad = Number(clase.maxAlumnos || alumnos.length || 0);
        const porcentaje = capacidad ? Math.round((asistentes / capacidad) * 100) : 0;

        return {
            clase: clase.nombre,
            asistentes,
            capacidad,
            porcentaje,
            color: ['fill-blue', 'fill-green', 'fill-purple', 'fill-yellow'][idx % 4],
        };
    });

    const totalAsistencias = resumenPorClase.reduce((acc, item) => acc + item.asistentes, 0);
    const totalCapacidad = resumenPorClase.reduce((acc, item) => acc + item.capacidad, 0);
    const promedio = totalCapacidad ? Math.round((totalAsistencias / totalCapacidad) * 100) : 0;

    return (
        <div className="bento-grid">
            <div className="bento-card kpi" style={{ gridColumn: 'span 12', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center' }}>
                <div>
                    <div className="kpi-title">Total Presentes</div>
                    <div className="kpi-value">{totalAsistencias}</div>
                </div>
                <div style={{ width: '1px', height: '60px', background: 'var(--border)' }} />
                <div>
                    <div className="kpi-title">Promedio Asistencia General</div>
                    <div className="kpi-value" style={{ color: 'var(--blue)' }}>{promedio}%</div>
                </div>
            </div>

            <div className="bento-card chart-main" style={{ gridColumn: 'span 12' }}>
                <h3 className="kpi-title" style={{ color: 'var(--text)' }}>Asistencias por Clase</h3>
                <div className="css-chart">
                    {resumenPorClase.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No hay clases en el periodo seleccionado.</p>
                    ) : resumenPorClase.map((item, idx) => (
                        <div className="chart-row" key={idx}>
                            <div className="chart-label-group">
                                <span>{item.clase} <small style={{color:'var(--text-light)', fontWeight:400}}>({item.asistentes}/{item.capacidad})</small></span>
                                <span>{item.porcentaje}% Ocupacion</span>
                            </div>
                            <div className="chart-bar-bg">
                                <div className={`chart-bar-fill ${item.color}`} style={{ width: `${item.porcentaje}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
