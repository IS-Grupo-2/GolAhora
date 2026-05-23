// src/components/reportes/ReporteReservas.jsx
export default function ReporteReservas({ periodoDesde, periodoHasta }) {
    // MOCK DATA: Equivalente a calcularOcupacion(), reservasPorCancha y reservasPorEstado de UML
    const totalReservas = 312;
    
    const reservasPorEstado = [
        { estado: 'Completadas', cantidad: 250, porcentaje: 80, color: 'fill-green' },
        { estado: 'Canceladas', cantidad: 42, porcentaje: 13.5, color: 'fill-red' },
        { estado: 'Pendientes', cantidad: 20, porcentaje: 6.5, color: 'fill-yellow' }
    ];

    const reservasPorCancha = [
        { cancha: 'Cancha 1 (F5 Cubierta)', cantidad: 120, porcentaje: 100, color: 'fill-purple' },
        { cancha: 'Cancha 2 (F5 Descubierta)', cantidad: 95, porcentaje: 79, color: 'fill-purple' },
        { cancha: 'Cancha 3 (F7 Sintético)', cantidad: 75, porcentaje: 62, color: 'fill-purple' },
        { cancha: 'Cancha 4 (F11 Pasto)', cantidad: 22, porcentaje: 18, color: 'fill-purple' }
    ];

    return (
        <div className="bento-grid">
            <div className="bento-card chart-half">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="kpi-title" style={{ color: 'var(--text)', margin: 0 }}>Estado de Reservas</h3>
                    <span className="kpi-value" style={{ fontSize: '1.5rem' }}>{totalReservas} <small style={{fontSize:'0.8rem', color:'var(--text-light)'}}>totales</small></span>
                </div>
                <div className="css-chart">
                    {reservasPorEstado.map((item, idx) => (
                        <div className="chart-row" key={idx}>
                            <div className="chart-label-group">
                                <span>{item.estado}</span>
                                <span>{item.cantidad}</span>
                            </div>
                            <div className="chart-bar-bg">
                                <div className={`chart-bar-fill ${item.color}`} style={{ width: `${item.porcentaje}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bento-card chart-half">
                <h3 className="kpi-title" style={{ color: 'var(--text)' }}>Uso por Cancha</h3>
                <div className="css-chart">
                    {reservasPorCancha.map((item, idx) => (
                        <div className="chart-row" key={idx}>
                            <div className="chart-label-group">
                                <span>{item.cancha}</span>
                                <span>{item.cantidad} res.</span>
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