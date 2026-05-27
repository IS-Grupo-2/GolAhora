import { createContext, useContext, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = true;

const ReportesContext = createContext();

export function ReportesProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mock funciones generadoras (En un escenario real, harían fetch a /reportes/ingresos?desde=X&hasta=Y)
    const generarReporteIngresos = async (desde, hasta) => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 300));
        setLoading(false);
        return {
            totalIngresos: 1250400,
            ingresosPorConcepto: [
                { concepto: 'Alquiler Canchas', monto: 750000, porcentaje: 60, color: 'fill-purple' },
                { concepto: 'Cuotas Socios', monto: 300000, porcentaje: 24, color: 'fill-green' },
            ]
        };
    };

    const generarReporteAsistencias = async (desde, hasta) => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 300));
        setLoading(false);
        return {
            totalAsistencias: 845,
            asistenciasPorClase: [
                { clase: 'Fútbol Funcional', asistentes: 320, capacidad: 400, porcentaje: 80, color: 'fill-blue' }
            ]
        };
    };

    const generarReporteReservas = async (desde, hasta) => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 300));
        setLoading(false);
        return {
            totalReservas: 312,
            reservasPorEstado: [{ estado: 'Completadas', cantidad: 250, porcentaje: 80, color: 'fill-green' }],
            reservasPorCancha: [{ cancha: 'Cancha 1', cantidad: 120, porcentaje: 100, color: 'fill-purple' }]
        };
    };

    return (
        <ReportesContext.Provider value={{ loading, error, generarReporteIngresos, generarReporteAsistencias, generarReporteReservas }}>
            {children}
        </ReportesContext.Provider>
    );
}

export const useReportes = () => useContext(ReportesContext);