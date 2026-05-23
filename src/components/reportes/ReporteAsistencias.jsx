// src/components/reportes/ReporteAsistencias.jsx
export default function ReporteAsistencias({ periodoDesde, periodoHasta }) {
    // MOCK DATA: Equivalente a calcularPresentes() y asistenciasPorClase de UML
    const totalAsistencias = 845;
    const asistenciasPorClase = [
        { clase: 'Fútbol Funcional', asistentes: 320, capacidad: 400, porcentaje: 80, color: 'fill-blue' },
        { clase: 'Escuelita Infantil', asistentes: 280, capacidad: 300, porcentaje: 93, color: 'fill-green' },
        { clase: 'Entrenamiento Arqueros', asistentes: 145, capacidad: 200, porcentaje: 72, color: 'fill-purple' },
        { clase: 'Fútbol Femenino', asistentes: 100, capacidad: 150, porcentaje: 66, color: 'fill-yellow' }
    ];

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
                    <div className="kpi-value" style={{ color: 'var(--blue)' }}>78%</div>
                </div>
            </div>

            <div className="bento-card chart-main" style={{ gridColumn: 'span 12' }}>
                <h3 className="kpi-title" style={{ color: 'var(--text)' }}>Asistencias por Clase</h3>
                <div className="css-chart">
                    {asistenciasPorClase.map((item, idx) => (
                        <div className="chart-row" key={idx}>
                            <div className="chart-label-group">
                                <span>{item.clase} <small style={{color:'var(--text-light)', fontWeight:400}}>({item.asistentes}/{item.capacidad})</small></span>
                                <span>{item.porcentaje}% Ocupación</span>
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