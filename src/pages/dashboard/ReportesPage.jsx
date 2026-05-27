import { useState, useEffect } from 'react';
import { ReportesProvider, useReportes } from '../../context/ReportesContext';
import Can from '../../components/Can';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ReporteIngresos from '../../components/reportes/ReporteIngresos';
import ReporteAsistencias from '../../components/reportes/ReporteAsistencias';
import ReporteReservas from '../../components/reportes/ReporteReservas';
import '../../styles/pages/reportes.css';

// Agrega los imports de los otros contextos si realmente los necesitas inyectar a nivel de proveedor
import { CobrosProvider } from '../../context/CobrosContext';
import { ReservasProvider } from '../../context/ReservasContext';
// import { AsistenciasProvider } from '../../context/AsistenciasContext';

function ReportesPageContent() {
    const [tabActiva, setTabActiva] = useState('ingresos');
    const { loading } = useReportes();
    const date = new Date();
    const [fechaDesde, setFechaDesde] = useState(new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]);
    const [fechaHasta, setFechaHasta] = useState(new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]);

     useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    if (loading) return <LoadingSpinner />;

    return (
        <Can roles={['admin', 'empleado']}>
            <div className="reportes-container">
                <div className="reportes-header">
                    <div className="reportes-tabs">
                        <button className={`tab-btn ${tabActiva === 'ingresos' ? 'active' : ''}`} onClick={() => setTabActiva('ingresos')}>
                            <i data-lucide="dollar-sign" /> Ingresos
                        </button>
                        <button className={`tab-btn ${tabActiva === 'reservas' ? 'active' : ''}`} onClick={() => setTabActiva('reservas')}>
                            <i data-lucide="calendar-check" /> Reservas
                        </button>
                        <button className={`tab-btn ${tabActiva === 'asistencias' ? 'active' : ''}`} onClick={() => setTabActiva('asistencias')}>
                            <i data-lucide="users" /> Asistencia
                        </button>
                    </div>
                    <div className="reportes-filtros">
                        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
                        <button className="btn-primary-action" onClick={() => window.print()}>
                            <i data-lucide="download" /> PDF
                        </button>
                    </div>
                </div>

                <div className="reportes-body">
                    {tabActiva === 'ingresos' && <ReporteIngresos periodoDesde={fechaDesde} periodoHasta={fechaHasta} />}
                    {tabActiva === 'asistencias' && <ReporteAsistencias periodoDesde={fechaDesde} periodoHasta={fechaHasta} />}
                    {tabActiva === 'reservas' && <ReporteReservas periodoDesde={fechaDesde} periodoHasta={fechaHasta} />}
                </div>
            </div>
        </Can>
    );
}

export default function ReportesPage() {
    return (
        // Anidamos los contextos necesarios según tu UML
        <ReportesProvider>
            <CobrosProvider>
                <ReservasProvider>
                    <ReportesPageContent />
                </ReservasProvider>
            </CobrosProvider>
        </ReportesProvider>
    );
}