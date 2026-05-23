// src/pages/dashboard/ReportesPage.jsx
import { useState, useEffect } from 'react';
import ReporteIngresos from '../../components/reportes/ReporteIngresos';
import ReporteAsistencias from '../../components/reportes/ReporteAsistencias';
import ReporteReservas from '../../components/reportes/ReporteReservas';
import '../../styles/pages/reportes.css';

export default function ReportesPage() {
    const [tabActiva, setTabActiva] = useState('ingresos');
    
    // Fechas por defecto: Inicio y fin del mes actual (UML: periodoDesde, periodoHasta)
    const date = new Date();
    const primerDia = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [fechaDesde, setFechaDesde] = useState(primerDia);
    const [fechaHasta, setFechaHasta] = useState(ultimoDia);

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [tabActiva]);

    // Método exportar() del UML
    const handleExportarPDF = () => {
        window.print(); // Solución rápida y nativa para exportar la vista actual
    };

    // Renderizado dinámico según el tab
    const renderReporte = () => {
        switch (tabActiva) {
            case 'ingresos':    return <ReporteIngresos periodoDesde={fechaDesde} periodoHasta={fechaHasta} />;
            case 'asistencias': return <ReporteAsistencias periodoDesde={fechaDesde} periodoHasta={fechaHasta} />;
            case 'reservas':    return <ReporteReservas periodoDesde={fechaDesde} periodoHasta={fechaHasta} />;
            default:            return null;
        }
    };

    return (
        <div className="reportes-container">
            {/* Header de controles */}
            <div className="reportes-header">
                <div className="reportes-tabs">
                    <button 
                        className={`tab-btn ${tabActiva === 'ingresos' ? 'active' : ''}`}
                        onClick={() => setTabActiva('ingresos')}
                    >
                        <i data-lucide="dollar-sign" /> Ingresos
                    </button>
                    <button 
                        className={`tab-btn ${tabActiva === 'reservas' ? 'active' : ''}`}
                        onClick={() => setTabActiva('reservas')}
                    >
                        <i data-lucide="calendar-check" /> Reservas
                    </button>
                    <button 
                        className={`tab-btn ${tabActiva === 'asistencias' ? 'active' : ''}`}
                        onClick={() => setTabActiva('asistencias')}
                    >
                        <i data-lucide="users" /> Asistencia
                    </button>
                </div>

                <div className="reportes-filtros">
                    <div className="filtro-fecha">
                        <label>Desde:</label>
                        <input 
                            type="date" 
                            value={fechaDesde} 
                            onChange={(e) => setFechaDesde(e.target.value)} 
                        />
                    </div>
                    <div className="filtro-fecha">
                        <label>Hasta:</label>
                        <input 
                            type="date" 
                            value={fechaHasta} 
                            onChange={(e) => setFechaHasta(e.target.value)} 
                        />
                    </div>
                    <button className="btn-primary-action" onClick={handleExportarPDF}>
                        <i data-lucide="download" /> Exportar PDF
                    </button>
                </div>
            </div>

            {/* Contenido Dinámico del Reporte */}
            <div className="reportes-body">
                {renderReporte()}
            </div>
        </div>
    );
}