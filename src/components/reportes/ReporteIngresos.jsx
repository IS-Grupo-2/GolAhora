import { useCobros } from '../../context/CobrosContext';

function enPeriodo(fecha, desde, hasta) {
    if (!fecha) return false;
    return fecha >= desde && fecha <= hasta;
}

function colorPorIndice(idx) {
    return ['fill-purple', 'fill-green', 'fill-blue', 'fill-yellow', 'fill-red'][idx % 5];
}

export default function ReporteIngresos({ periodoDesde, periodoHasta }) {
    const { items: cobros = [] } = useCobros();
    const cobrosPeriodo = cobros.filter(c =>
        enPeriodo(c.fecha, periodoDesde, periodoHasta) &&
        c.estado === 'pagado'
    );

    const totalIngresos = cobrosPeriodo.reduce((acc, c) => acc + Number(c.montoFinal ?? c.monto ?? 0), 0);
    const agrupados = cobrosPeriodo.reduce((acc, c) => {
        const concepto = c.tipoCobro || c.concepto || 'Otros';
        acc[concepto] = (acc[concepto] || 0) + Number(c.montoFinal ?? c.monto ?? 0);
        return acc;
    }, {});

    const ingresosPorConcepto = Object.entries(agrupados).map(([concepto, monto], idx) => ({
        concepto,
        monto,
        porcentaje: totalIngresos ? Math.round((monto / totalIngresos) * 100) : 0,
        color: colorPorIndice(idx),
    }));

    const formatMoneda = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    return (
        <div className="bento-grid">
            <div className="bento-card kpi">
                <span className="kpi-title">Ingresos Totales</span>
                <span className="kpi-value small">{formatMoneda(totalIngresos)}</span>
                <span className="kpi-trend up">
                    <i data-lucide="receipt" /> {cobrosPeriodo.length} cobros pagados
                </span>
            </div>

            <div className="bento-card chart-main">
                <h3 className="kpi-title" style={{ color: 'var(--text)' }}>Ingresos por Concepto</h3>
                <div className="css-chart">
                    {ingresosPorConcepto.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No hay cobros pagados en el periodo seleccionado.</p>
                    ) : ingresosPorConcepto.map((item, idx) => (
                        <div className="chart-row" key={idx}>
                            <div className="chart-label-group">
                                <span>{item.concepto}</span>
                                <span>{formatMoneda(item.monto)}</span>
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
