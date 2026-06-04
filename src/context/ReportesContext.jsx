import { createContext, useContext, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = true;

const ReportesContext = createContext();

export function ReportesProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generarReporteIngresos = async (desde, hasta) => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(res => setTimeout(res, 300));
                return {
                    totalIngresos: 1250400,
                    ingresosPorConcepto: [
                        { concepto: 'Alquiler Canchas', monto: 750000, porcentaje: 60, color: 'fill-purple' },
                        { concepto: 'Cuotas Socios', monto: 300000, porcentaje: 24, color: 'fill-green' },
                    ]
                };
            }
            
            // Fetch real con Query Params
            const params = new URLSearchParams({ desde, hasta });
            const res = await fetch(`${API_URL}/reportes/ingresos?${params.toString()}`);
            if (!res.ok) throw new Error('Error al obtener reporte de ingresos');
            return await res.json();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generarReporteAsistencias = async (desde, hasta) => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(res => setTimeout(res, 300));
                return {
                    totalAsistencias: 845,
                    asistenciasPorClase: [
                        { clase: 'Fútbol Funcional', asistentes: 320, capacidad: 400, porcentaje: 80, color: 'fill-blue' }
                    ]
                };
            }
            
            const params = new URLSearchParams({ desde, hasta });
            const res = await fetch(`${API_URL}/reportes/asistencias?${params.toString()}`);
            if (!res.ok) throw new Error('Error al obtener reporte de asistencias');
            return await res.json();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generarReporteReservas = async (desde, hasta) => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(res => setTimeout(res, 300));
                return {
                    totalReservas: 312,
                    reservasPorEstado: [{ estado: 'Completadas', cantidad: 250, porcentaje: 80, color: 'fill-green' }],
                    reservasPorCancha: [{ cancha: 'Cancha 1', cantidad: 120, porcentaje: 100, color: 'fill-purple' }]
                };
            }

            const params = new URLSearchParams({ desde, hasta });
            const res = await fetch(`${API_URL}/reportes/reservas?${params.toString()}`);
            if (!res.ok) throw new Error('Error al obtener reporte de reservas');
            return await res.json();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <ReportesContext.Provider value={{ loading, error, generarReporteIngresos, generarReporteAsistencias, generarReporteReservas }}>
            {children}
        </ReportesContext.Provider>
    );
}

export const useReportes = () => useContext(ReportesContext);