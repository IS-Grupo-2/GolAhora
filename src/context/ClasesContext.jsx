// src/context/ClasesContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MOCK_PROFESORES } from '../context/ProfesoresContext';

const USE_MOCK = true;
const CLASES_SEED_VERSION = 'presentacion-mocks-2026-06-08';

export const PROFESORES_DISPONIBLES = MOCK_PROFESORES.slice(0, 4).map((p, idx) => ({
    id: idx + 1,
    idUsuario: p.idUsuario,
    nombre: p.nombre,
    apellido: p.apellido,
    email: p.email,
    verificacionCertificacion: p.certificaciones?.some(c => c.verificada) ?? false,
}));

export const ALUMNOS_DISPONIBLES = [
    { id: 101, nombre: 'Lucia', apellido: 'Martinez', email: 'lucia.martinez@example.com' },
    { id: 102, nombre: 'Tomas', apellido: 'Herrera', email: 'tomas.herrera@example.com' },
    { id: 103, nombre: 'Camila', apellido: 'Torres', email: 'camila.torres@example.com' },
    { id: 104, nombre: 'Diego', apellido: 'Vega', email: 'diego.vega@example.com' },
    { id: 105, nombre: 'Valentina', apellido: 'Garcia', email: 'valentina.garcia@example.com' },
];

const MOCK_DATA = [
    {
        idClase: 1,
        nombre: 'Entrenamiento Intensivo',
        descripcion: 'Clase de entrenamiento fisico y tecnico para clientes inscriptos.',
        tipoClase: 'Entrenamiento',
        profesor: null,
        cancha: 'Cancha Futbol 5',
        fecha: '2026-06-15',
        horario: '18:00',
        duracionMin: 60,
        maxAlumnos: 10,
        precio: 5000,
        estado: 'programada',
        alumnos: [],
    },
    {
        idClase: 2,
        nombre: 'Jugadas Preparadas',
        descripcion: 'Clase orientada a practicar jugadas de pelota parada y transiciones.',
        tipoClase: 'Jugadas',
        profesor: null,
        cancha: 'Cancha Futbol 7',
        fecha: '2026-06-16',
        horario: '19:00',
        duracionMin: 90,
        maxAlumnos: 14,
        precio: 6500,
        estado: 'programada',
        alumnos: [],
    }
];

const ClasesContext = createContext(null);

export function ClasesProvider({ children }) {
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const localData = localStorage.getItem('clases_db');
            const seedVersion = localStorage.getItem('clases_seed_version');
            if (localData && seedVersion === CLASES_SEED_VERSION) {
                setClases(JSON.parse(localData));
            } else {
                localStorage.setItem('clases_db', JSON.stringify(MOCK_DATA));
                localStorage.setItem('clases_seed_version', CLASES_SEED_VERSION);
                setClases(MOCK_DATA);
            }
        } catch (err) {
            setError('Error al sincronizar base local de clases');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClases();
    }, [fetchClases]);

    const crearClase = useCallback(async (datos) => {
        const nueva = { ...datos, idClase: Date.now(), alumnos: datos.alumnos || [] };
        setClases(prev => {
            const next = [...prev, nueva];
            localStorage.setItem('clases_db', JSON.stringify(next));
            return next;
        });
        return nueva;
    }, []);

    const modificarClase = useCallback(async (datos) => {
        setClases(prev => {
            const next = prev.map(c => c.idClase === datos.idClase ? { ...c, ...datos } : c);
            localStorage.setItem('clases_db', JSON.stringify(next));
            return next;
        });
        return datos;
    }, []);

    const cancelarClase = useCallback(async (idClase) => {
        setClases(prev => {
            const next = prev.map(c =>
                c.idClase === idClase
                    ? { ...c, estado: c.estado === 'cancelada' ? 'programada' : 'cancelada' }
                    : c
            );
            localStorage.setItem('clases_db', JSON.stringify(next));
            return next;
        });
    }, []);

    const eliminarClase = useCallback(async (idClase) => {
        setClases(prev => {
            const next = prev.filter(c => c.idClase !== idClase);
            localStorage.setItem('clases_db', JSON.stringify(next));
            return next;
        });
    }, []);

    const registrarAsistencia = useCallback(async (idClase, recordAsistencias) => {
        setClases(prev => {
            const next = prev.map(c => {
                if (c.idClase !== idClase) return c;
                return {
                    ...c,
                    alumnos: c.alumnos.map(al => ({
                        ...al,
                        presente: recordAsistencias[al.id] ?? al.presente,
                    })),
                };
            });
            localStorage.setItem('clases_db', JSON.stringify(next));
            return next;
        });
    }, []);

    const inscribirAlumno = useCallback(async (idClase, user) => {
        if (!user) return null;
        const userId = user.idUsuario || user.id || 999;
        const userNombreCompleto = `${user.nombre || 'Cliente'} ${user.apellido || 'Moc'}`;
        const userEmail = user.email || 'cliente@test.com';

        let modificado = null;
        setClases(prev => {
            const next = prev.map(c => {
                if (c.idClase !== idClase) return c;
                if (c.alumnos.some(al => al.id === userId) || c.alumnos.length >= c.maxAlumnos) return c;

                const nuevoAlumno = { id: userId, nombre: userNombreCompleto, email: userEmail, presente: false };
                modificado = { ...c, alumnos: [...c.alumnos, nuevoAlumno] };
                return modificado;
            });
            localStorage.setItem('clases_db', JSON.stringify(next));
            return next;
        });
        return modificado;
    }, []);

    const value = {
        clases, loading, error, fetchClases, crearClase, modificarClase,
        cancelarClase, eliminarClase, registrarAsistencia, inscribirAlumno
    };

    return <ClasesContext.Provider value={value}>{children}</ClasesContext.Provider>;
}

export function useClases() {
    const ctx = useContext(ClasesContext);
    if (!ctx) throw new Error('useClases debe usarse dentro de ClasesProvider');
    return ctx;
}
