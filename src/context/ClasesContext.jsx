// src/context/ClasesContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_PROFESORES } from '../context/ProfesoresContext';

// ── Configuración ─────────────────────────────────────────────────────────────
const USE_MOCK = true;
const API_URL = import.meta.env.VITE_API_URL;

// ── Mock: Profesores disponibles para asignar (sincronizados desde mockData) ───
// Mapear los primeros 4 profesores de mockData con estructura simplificada
export const PROFESORES_DISPONIBLES = MOCK_PROFESORES.slice(0, 4).map((p, idx) => ({
    id: idx + 1, // id simple para compatibilidad con formularios
    idUsuario: p.idUsuario, // idUsuario original para referencias
    nombre: p.nombre,
    apellido: p.apellido,
    email: p.email,
    verificacionCertificacion: p.certificaciones?.some(c => c.verificada) ?? false,
}));

// ── Mock: Alumnos disponibles para inscribir ───────────────────────────────────
export const ALUMNOS_DISPONIBLES = [
    { id: 101, nombre: 'Juan',       apellido: 'Pérez',     email: 'juan@mail.com'          },
    { id: 102, nombre: 'Martín',     apellido: 'López',     email: 'martin.l@mail.com'      },
    { id: 103, nombre: 'Camila',     apellido: 'Torres',    email: 'cami.torres@gmail.com'  },
    { id: 104, nombre: 'Lucas',      apellido: 'Díaz',      email: 'lucas.diaz@mail.com'    },
    { id: 105, nombre: 'Valentina',  apellido: 'García',    email: 'vale.garcia@mail.com'   },
    { id: 106, nombre: 'Rodrigo',    apellido: 'Fernández', email: 'rodri.f@mail.com'       },
    { id: 107, nombre: 'Sofía',      apellido: 'Martínez',  email: 'sofi.martinez@mail.com' },
    { id: 108, nombre: 'Nicolás',    apellido: 'Romero',    email: 'nico.romero@mail.com'   },
];

// ── Mock: Clases ──────────────────────────────────────────────────────────────
const MOCK_DATA = [
    {
        idClase: 1,
        nombre: 'Escuelita Sub-12',
        descripcion: 'Entrenamiento táctico y técnico para pequeños de hasta 12 años.',
        tipoClase: 'Escuelita',
        profesor: PROFESORES_DISPONIBLES[0],
        cancha: 'Cancha 1 (F5)',
        fecha: '2026-05-30',
        horario: '17:00',
        duracionMin: 90,
        maxAlumnos: 20,
        precio: 3000,
        estado: 'programada',
        alumnos: [
            { id: 101, nombre: 'Juan Pérez',    presente: false },
            { id: 102, nombre: 'Martín López',  presente: false },
            { id: 103, nombre: 'Camila Torres', presente: false },
        ],
    },
    {
        idClase: 2,
        nombre: 'Entrenamiento Arqueros',
        descripcion: 'Trabajo de reflejos, posicionamiento y saque.',
        tipoClase: 'Particular',
        profesor: null,
        cancha: 'Cancha 2 (F7)',
        fecha: '2026-05-30',
        horario: '19:00',
        duracionMin: 60,
        maxAlumnos: 2,
        precio: 8000,
        estado: 'programada',
        alumnos: [],
    },
    {
        idClase: 3,
        nombre: 'Fútbol Femenino',
        descripcion: 'Clase grupal mixta con foco en técnica individual.',
        tipoClase: 'Grupal',
        profesor: PROFESORES_DISPONIBLES[1],
        cancha: 'Cancha 1 (F5)',
        fecha: '2026-06-02',
        horario: '10:00',
        duracionMin: 75,
        maxAlumnos: 12,
        precio: 4500,
        estado: 'programada',
        alumnos: [
            { id: 105, nombre: 'Valentina García',  presente: false },
            { id: 107, nombre: 'Sofía Martínez',    presente: false },
        ],
    },
    {
        idClase: 4,
        nombre: 'Preparación Física',
        descripcion: 'Circuito de resistencia y velocidad para jugadores amateur.',
        tipoClase: 'Grupal',
        profesor: PROFESORES_DISPONIBLES[2],
        cancha: 'Pista Funcional',
        fecha: '2026-06-03',
        horario: '08:00',
        duracionMin: 60,
        maxAlumnos: 15,
        precio: 3500,
        estado: 'en_curso',
        alumnos: [
            { id: 104, nombre: 'Lucas Díaz',      presente: true  },
            { id: 106, nombre: 'Rodrigo Fernández', presente: true  },
            { id: 108, nombre: 'Nicolás Romero',  presente: false },
        ],
    },
    {
        idClase: 5,
        nombre: 'Técnica Individual Sub-16',
        descripcion: 'Perfeccionamiento de conducción, regate y definición.',
        tipoClase: 'Escuelita',
        profesor: PROFESORES_DISPONIBLES[3],
        cancha: 'Cancha 2 (F7)',
        fecha: '2026-06-04',
        horario: '16:00',
        duracionMin: 90,
        maxAlumnos: 10,
        precio: 4000,
        estado: 'programada',
        alumnos: [
            { id: 101, nombre: 'Juan Pérez',    presente: false },
            { id: 102, nombre: 'Martín López',  presente: false },
        ],
    },
    {
        idClase: 6,
        nombre: 'Fútbol 5 Amateur',
        descripcion: 'Clase orientada a jugadores adultos recreativos.',
        tipoClase: 'Grupal',
        profesor: PROFESORES_DISPONIBLES[0],
        cancha: 'Cancha 1 (F5)',
        fecha: '2026-05-25',
        horario: '20:00',
        duracionMin: 60,
        maxAlumnos: 10,
        precio: 2500,
        estado: 'finalizada',
        alumnos: [
            { id: 104, nombre: 'Lucas Díaz',       presente: true },
            { id: 106, nombre: 'Rodrigo Fernández', presente: true },
            { id: 108, nombre: 'Nicolás Romero',   presente: true },
        ],
    },
    {
        idClase: 7,
        nombre: 'Defensa y Bloqueo',
        descripcion: 'Trabajo defensivo en bloque y marcación individual.',
        tipoClase: 'Particular',
        profesor: PROFESORES_DISPONIBLES[1],
        cancha: 'Cancha 2 (F7)',
        fecha: '2026-06-10',
        horario: '11:00',
        duracionMin: 45,
        maxAlumnos: 2,
        precio: 7000,
        estado: 'cancelada',
        alumnos: [],
    },
    {
        idClase: 8,
        nombre: 'Fútbol 7 Competitivo',
        descripcion: 'Entrenamiento táctico para equipos que compiten en torneos del club.',
        tipoClase: 'Grupal',
        profesor: PROFESORES_DISPONIBLES[2],
        cancha: 'Cancha 2 (F7)',
        fecha: '2026-06-11',
        horario: '18:30',
        duracionMin: 90,
        maxAlumnos: 14,
        precio: 5000,
        estado: 'programada',
        alumnos: [
            { id: 103, nombre: 'Camila Torres',    presente: false },
            { id: 105, nombre: 'Valentina García', presente: false },
            { id: 107, nombre: 'Sofía Martínez',   presente: false },
        ],
    },
];

// ── Fetch ─────────────────────────────────────────────────────────────────────
function fetchData() {
    if (USE_MOCK) {
        return new Promise(resolve => setTimeout(() => resolve([...MOCK_DATA]), 300));
    }
    return fetch(`${API_URL}/clases`).then(r => {
        if (!r.ok) throw new Error('Error al obtener clases');
        return r.json();
    });
}

// ── Contexto ──────────────────────────────────────────────────────────────────
const ClasesContext = createContext(null);

export function ClasesProvider({ children }) {
    const [clases,  setClases]  = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [nextId,  setNextId]  = useState(9);

    // ── fetchClases ────────────────────────────────────────────────────────────
    const fetchClases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData();
            setClases(data);
        } catch (err) {
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── crearClase ─────────────────────────────────────────────────────────────
    const crearClase = useCallback(async (datos) => {
        if (USE_MOCK) {
            const nueva = { ...datos, idClase: nextId, alumnos: datos.alumnos || [] };
            setClases(prev => [...prev, nueva]);
            setNextId(n => n + 1);
            return nueva;
        }
        const r = await fetch(`${API_URL}/clases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!r.ok) throw new Error('Error al crear clase');
        const nueva = await r.json();
        setClases(prev => [...prev, nueva]);
        return nueva;
    }, [nextId]);

    // ── modificarClase ─────────────────────────────────────────────────────────
    const modificarClase = useCallback(async (datos) => {
        if (USE_MOCK) {
            setClases(prev => prev.map(c => c.idClase === datos.idClase ? { ...c, ...datos } : c));
            return datos;
        }
        const r = await fetch(`${API_URL}/clases/${datos.idClase}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!r.ok) throw new Error('Error al modificar clase');
        const actualizada = await r.json();
        setClases(prev => prev.map(c => c.idClase === actualizada.idClase ? actualizada : c));
        return actualizada;
    }, []);

    // ── cancelarClase (baja lógica) ────────────────────────────────────────────
    const cancelarClase = useCallback(async (idClase) => {
        if (USE_MOCK) {
            setClases(prev => prev.map(c =>
                c.idClase === idClase
                    ? { ...c, estado: c.estado === 'cancelada' ? 'programada' : 'cancelada' }
                    : c
            ));
            return;
        }
        const r = await fetch(`${API_URL}/clases/${idClase}/cancelar`, { method: 'PATCH' });
        if (!r.ok) throw new Error('Error al cancelar clase');
        const actualizada = await r.json();
        setClases(prev => prev.map(c => c.idClase === actualizada.idClase ? actualizada : c));
    }, []);

    // ── eliminarClase (baja física, solo si hace falta) ───────────────────────
    const eliminarClase = useCallback(async (idClase) => {
        if (USE_MOCK) {
            setClases(prev => prev.filter(c => c.idClase !== idClase));
            return;
        }
        const r = await fetch(`${API_URL}/clases/${idClase}`, { method: 'DELETE' });
        if (!r.ok) throw new Error('Error al eliminar clase');
        setClases(prev => prev.filter(c => c.idClase !== idClase));
    }, []);

    // ── registrarAsistencia ────────────────────────────────────────────────────
    const registrarAsistencia = useCallback(async (idClase, recordAsistencias) => {
        if (USE_MOCK) {
            setClases(prev => prev.map(c => {
                if (c.idClase !== idClase) return c;
                return {
                    ...c,
                    alumnos: c.alumnos.map(al => ({
                        ...al,
                        presente: recordAsistencias[al.id] ?? al.presente,
                    })),
                };
            }));
            return;
        }
        const r = await fetch(`${API_URL}/clases/${idClase}/asistencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordAsistencias),
        });
        if (!r.ok) throw new Error('Error al registrar asistencia');
        await fetchData();
    }, []);

    const value = {
        clases,
        loading,
        error,
        fetchClases,
        crearClase,
        modificarClase,
        cancelarClase,
        eliminarClase,
        registrarAsistencia,
    };

    return (
        <ClasesContext.Provider value={value}>
            {children}
        </ClasesContext.Provider>
    );
}

export function useClases() {
    const ctx = useContext(ClasesContext);
    if (!ctx) throw new Error('useClases debe usarse dentro de ClasesProvider');
    return ctx;
}