// src/components/reportes/ReporteIngresos.jsx
export default function ReporteIngresos({ periodoDesde, periodoHasta }) {
    // MOCK DATA: Equivalente al método calcularTotales() y agruparPorConcepto() del UML
    const totalIngresos = 1250400;
    const ingresosPorConcepto = [
        { concepto: 'Alquiler Canchas', monto: 750000, porcentaje: 60, color: 'fill-purple' },
        { concepto: 'Cuotas Socios', monto: 300000, porcentaje: 24, color: 'fill-green' },
        { concepto: 'Inscripción Torneos', monto: 150000, porcentaje: 12, color: 'fill-blue' },
        { concepto: 'Buffet', monto: 50400, porcentaje: 4, color: 'fill-yellow' }
    ];

    const formatMoneda = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    return (
        <div className="bento-grid">
            <div className="bento-card kpi">
                <span className="kpi-title">Ingresos Totales</span>
                <span className="kpi-value small">{formatMoneda(totalIngresos)}</span>
                <span className="kpi-trend up">
                    <i data-lucide="trending-up" /> +15.2% vs mes anterior
                </span>
            </div>

            <div className="bento-card chart-main">
                <h3 className="kpi-title" style={{ color: 'var(--text)' }}>Ingresos por Concepto</h3>
                <div className="css-chart">
                    {ingresosPorConcepto.map((item, idx) => (
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