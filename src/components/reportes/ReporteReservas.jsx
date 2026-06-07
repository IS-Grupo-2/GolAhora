import { useReservas } from '../../context/ReservasContext';

function enPeriodo(fecha, desde, hasta) {
    if (!fecha) return false;
    return fecha >= desde && fecha <= hasta;
}

function porcentaje(valor, total) {
    return total ? Math.round((valor / total) * 100) : 0;
}

function colorEstado(estado) {
    if (estado === 'confirmada') return 'fill-green';
    if (estado === 'cancelada') return 'fill-red';
    return 'fill-yellow';
}

export default function ReporteReservas({ periodoDesde, periodoHasta }) {
    const { reservas = [] } = useReservas();
    const reservasPeriodo = reservas.filter(r => enPeriodo(r.fechaUso, periodoDesde, periodoHasta));
    const totalReservas = reservasPeriodo.length;

    const porEstado = reservasPeriodo.reduce((acc, r) => {
        const estado = r.estado || 'pendiente';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
    }, {});

    const reservasPorEstado = Object.entries(porEstado).map(([estado, cantidad]) => ({
        estado: estado.charAt(0).toUpperCase() + estado.slice(1),
        cantidad,
        porcentaje: porcentaje(cantidad, totalReservas),
        color: colorEstado(estado),
    }));

    const porCancha = reservasPeriodo.reduce((acc, r) => {
        const cancha = r.cancha?.nombre || `Cancha ${r.cancha?.numero || '-'}`;
        acc[cancha] = (acc[cancha] || 0) + 1;
        return acc;
    }, {});
    const maxCancha = Math.max(...Object.values(porCancha), 0);

    const reservasPorCancha = Object.entries(porCancha).map(([cancha, cantidad]) => ({
        cancha,
        cantidad,
        porcentaje: porcentaje(cantidad, maxCancha),
        color: 'fill-purple',
    }));

    return (
        <div className="bento-grid">
            <div className="bento-card chart-half">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="kpi-title" style={{ color: 'var(--text)', margin: 0 }}>Estado de Reservas</h3>
                    <span className="kpi-value" style={{ fontSize: '1.5rem' }}>{totalReservas} <small style={{fontSize:'0.8rem', color:'var(--text-light)'}}>totales</small></span>
                </div>
                <div className="css-chart">
                    {reservasPorEstado.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No hay reservas en el periodo seleccionado.</p>
                    ) : reservasPorEstado.map((item, idx) => (
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
                    {reservasPorCancha.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No hay uso de canchas en el periodo seleccionado.</p>
                    ) : reservasPorCancha.map((item, idx) => (
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
