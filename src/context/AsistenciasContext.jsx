// src/context/AsistenciasContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const USE_MOCK = true;

const API_URL = import.meta.env.VITE_API_URL;

// ── Mock: Alumnos compartidos ─────────────────────────────────────────────────
const MOCK_ALUMNOS = [
    { id: 101, nombre: 'Juan',      apellido: 'Pérez',     dni: '44111222' },
    { id: 102, nombre: 'Martín',    apellido: 'López',     dni: '44333444' },
    { id: 103, nombre: 'Camila',    apellido: 'Torres',    dni: '44555666' },
    { id: 104, nombre: 'Lucas',     apellido: 'Díaz',      dni: '44777888' },
    { id: 105, nombre: 'Valentina', apellido: 'García',    dni: '44999000' },
    { id: 106, nombre: 'Rodrigo',   apellido: 'Fernández', dni: '45111222' },
    { id: 107, nombre: 'Sofía',     apellido: 'Martínez',  dni: '45333444' },
    { id: 108, nombre: 'Nicolás',   apellido: 'Romero',    dni: '45555666' },
];

export const MOCK_CLASES_ASISTENCIA = [
    {
        idClase: 1,
        nombre: 'Escuelita Sub-12',
        tipoClase: 'Escuelita',
        cancha: 'Cancha 1 (F5)',
        fecha: '2026-05-30',
        horario: '17:00',
        duracionMin: 90,
        profesor: { id: 1, nombre: 'Carlos', apellido: 'Gómez' },
        alumnos: [MOCK_ALUMNOS[0], MOCK_ALUMNOS[1], MOCK_ALUMNOS[2]],
    },
    {
        idClase: 2,
        nombre: 'Entrenamiento Arqueros',
        tipoClase: 'Particular',
        cancha: 'Cancha 2 (F7)',
        fecha: '2026-05-30',
        horario: '19:00',
        duracionMin: 60,
        profesor: { id: 1, nombre: 'Carlos', apellido: 'Gómez' },
        alumnos: [MOCK_ALUMNOS[3]],
    },
    {
        idClase: 3,
        nombre: 'Fútbol Femenino',
        tipoClase: 'Grupal',
        cancha: 'Cancha 1 (F5)',
        fecha: '2026-06-02',
        horario: '10:00',
        duracionMin: 75,
        profesor: { id: 2, nombre: 'Lucía', apellido: 'Fernández' },
        alumnos: [MOCK_ALUMNOS[4], MOCK_ALUMNOS[6]],
    },
    {
        idClase: 4,
        nombre: 'Preparación Física',
        tipoClase: 'Grupal',
        cancha: 'Pista Funcional',
        fecha: '2026-06-03',
        horario: '08:00',
        duracionMin: 60,
        profesor: { id: 3, nombre: 'Marcos', apellido: 'Soria' },
        alumnos: [MOCK_ALUMNOS[3], MOCK_ALUMNOS[5], MOCK_ALUMNOS[7]],
    },
    {
        idClase: 5,
        nombre: 'Técnica Individual Sub-16',
        tipoClase: 'Escuelita',
        cancha: 'Cancha 2 (F7)',
        fecha: '2026-06-04',
        horario: '16:00',
        duracionMin: 90,
        profesor: { id: 4, nombre: 'Natalia', apellido: 'Quiroga' },
        alumnos: [MOCK_ALUMNOS[0], MOCK_ALUMNOS[1]],
    },
    {
        idClase: 6,
        nombre: 'Fútbol 7 Competitivo',
        tipoClase: 'Grupal',
        cancha: 'Cancha 2 (F7)',
        fecha: '2026-06-11',
        horario: '18:30',
        duracionMin: 90,
        profesor: { id: 3, nombre: 'Marcos', apellido: 'Soria' },
        alumnos: [MOCK_ALUMNOS[2], MOCK_ALUMNOS[4], MOCK_ALUMNOS[6]],
    },
];

// ── Mock: Registros de asistencia pre-cargados ────────────────────────────────
// Simulamos que ya se pasó lista en las clases 1 y 3
const MOCK_ASISTENCIAS_INICIALES = {
    1: [
        { idAsistencia: 1001, clase: MOCK_CLASES_ASISTENCIA[0], cliente: MOCK_ALUMNOS[0], fecha: '2026-05-30', presente: true,  observaciones: '' },
        { idAsistencia: 1002, clase: MOCK_CLASES_ASISTENCIA[0], cliente: MOCK_ALUMNOS[1], fecha: '2026-05-30', presente: true,  observaciones: 'Llegó 10 minutos tarde' },
        { idAsistencia: 1003, clase: MOCK_CLASES_ASISTENCIA[0], cliente: MOCK_ALUMNOS[2], fecha: '2026-05-30', presente: false, observaciones: 'Avisó con anticipación' },
    ],
    3: [
        { idAsistencia: 1004, clase: MOCK_CLASES_ASISTENCIA[2], cliente: MOCK_ALUMNOS[4], fecha: '2026-06-02', presente: true,  observaciones: '' },
        { idAsistencia: 1005, clase: MOCK_CLASES_ASISTENCIA[2], cliente: MOCK_ALUMNOS[6], fecha: '2026-06-02', presente: true,  observaciones: '' },
    ],
};

// ── Fetch simulado ────────────────────────────────────────────────────────────
function fetchData() {
    if (USE_MOCK) {
        return new Promise(resolve =>
            setTimeout(() => resolve({
                clases: [...MOCK_CLASES_ASISTENCIA],
                asistenciasPorClase: structuredClone(MOCK_ASISTENCIAS_INICIALES),
            }), 300)
        );
    }
    return Promise.all([
        fetch(`${API_URL}/clases`).then(r => { if (!r.ok) throw new Error('Error al obtener clases'); return r.json(); }),
        fetch(`${API_URL}/asistencias`).then(r => { if (!r.ok) throw new Error('Error al obtener asistencias'); return r.json(); }),
    ]).then(([clases, asistencias]) => {
        // Agrupar asistencias por idClase
        const porClase = asistencias.reduce((acc, a) => {
            const id = a.clase.idClase;
            acc[id] = acc[id] ? [...acc[id], a] : [a];
            return acc;
        }, {});
        return { clases, asistenciasPorClase: porClase };
    });
}

// ── Contexto ──────────────────────────────────────────────────────────────────
const AsistenciasContext = createContext(null);

export function AsistenciasProvider({ children }) {
    const [clases,             setClases]             = useState([]);
    const [asistenciasPorClase, setAsistenciasPorClase] = useState({});
    const [loading,            setLoading]            = useState(false);
    const [error,              setError]              = useState(null);

    // ── fetchAsistencias ───────────────────────────────────────────────────────
    const fetchAsistencias = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { clases: cls, asistenciasPorClase: asis } = await fetchData();
            setClases(cls);
            setAsistenciasPorClase(asis);
        } catch (err) {
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── registrarAsistencia ────────────────────────────────────────────────────
    // Crea o sobreescribe el registro de una clase completa (pasar lista)
    const registrarAsistencia = useCallback(async (idClase, arrayAsistencias) => {
        if (USE_MOCK) {
            setAsistenciasPorClase(prev => ({ ...prev, [idClase]: arrayAsistencias }));
            return;
        }
        const r = await fetch(`${API_URL}/asistencias/clase/${idClase}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(arrayAsistencias),
        });
        if (!r.ok) throw new Error('Error al registrar asistencia');
        const guardado = await r.json();
        setAsistenciasPorClase(prev => ({ ...prev, [idClase]: guardado }));
    }, []);

    // ── modificarAsistencia ────────────────────────────────────────────────────
    // Mismo comportamiento que registrar (el backend decide si es PUT o PATCH)
    const modificarAsistencia = useCallback(async (idClase, arrayAsistencias) => {
        if (USE_MOCK) {
            setAsistenciasPorClase(prev => ({ ...prev, [idClase]: arrayAsistencias }));
            return;
        }
        const r = await fetch(`${API_URL}/asistencias/clase/${idClase}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(arrayAsistencias),
        });
        if (!r.ok) throw new Error('Error al modificar asistencia');
        const actualizado = await r.json();
        setAsistenciasPorClase(prev => ({ ...prev, [idClase]: actualizado }));
    }, []);

    const value = {
        clases,
        asistenciasPorClase,
        loading,
        error,
        fetchAsistencias,
        registrarAsistencia,
        modificarAsistencia,
    };

    return (
        <AsistenciasContext.Provider value={value}>
            {children}
        </AsistenciasContext.Provider>
    );
}

export function useAsistencias() {
    const ctx = useContext(AsistenciasContext);
    if (!ctx) throw new Error('useAsistencias debe usarse dentro de AsistenciasProvider');
    return ctx;
}