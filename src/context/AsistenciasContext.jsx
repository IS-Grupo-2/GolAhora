import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AsistenciasContext = createContext();

export function AsistenciasProvider({ children }) {
    const [asistenciasPorClase, setAsistenciasPorClase] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const localData = localStorage.getItem('asistencias_db');
        if (localData) setAsistenciasPorClase(JSON.parse(localData));
    }, []);

    const fetchAsistencias = useCallback(async () => {
        // Estructura ya levantada sincrónicamente por el efecto de carga inicial
    }, []);

    const registrarAsistencia = useCallback(async (idClase, arrayAsistencias) => {
        setAsistenciasPorClase(prev => {
            const next = { ...prev, [idClase]: arrayAsistencias };
            localStorage.setItem('asistencias_db', JSON.stringify(next));
            return next;
        });
    }, []);

    return (
        <AsistenciasContext.Provider value={{ clases: [], asistenciasPorClase, loading, error, fetchAsistencias, registrarAsistencia, modificarAsistencia: registrarAsistencia }}>
            {children}
        </AsistenciasContext.Provider>
    );
}

export function useAsistencias() { return useContext(AsistenciasContext); }