// src/context/ClasesContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MOCK_PROFESORES } from '../context/ProfesoresContext';

const USE_MOCK = true;

export const PROFESORES_DISPONIBLES = MOCK_PROFESORES.slice(0, 4).map((p, idx) => ({
    id: idx + 1,
    idUsuario: p.idUsuario,
    nombre: p.nombre,
    apellido: p.apellido,
    email: p.email,
    verificacionCertificacion: p.certificaciones?.some(c => c.verificada) ?? false,
}));

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

const MOCK_DATA = [
    {
        idClase: 1,
        nombre: 'Escuelita Sub-12',
        descripcion: 'Entrenamiento táctico y técnico para pequeños de hasta 12 años.',
        tipoClase: 'Escuelita',
        profesor: PROFESORES_DISPONIBLES[0],
        cancha: 'Cancha 1 (F5)',
        fecha: '2026-06-10',
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
        fecha: '2026-06-11',
        horario: '19:00',
        duracionMin: 60,
        maxAlumnos: 5,
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
        fecha: '2026-06-12',
        horario: '10:00',
        duracionMin: 75,
        maxAlumnos: 12,
        precio: 4500,
        estado: 'programada',
        alumnos: [
            { id: 105, nombre: 'Valentina García',  presente: false },
            { id: 107, nombre: 'Sofía Martínez',    presente: false },
        ],
    }
];

const ClasesContext = createContext(null);

export function ClasesProvider({ children }) {
    const [clases,  setClases]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const fetchClases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const localData = localStorage.getItem('clases_db');
            if (localData) {
                setClases(JSON.parse(localData));
            } else {
                localStorage.setItem('clases_db', JSON.stringify(MOCK_DATA));
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

    // MÉTODO NUEVO PARA CLIENTES: Autogestiona el localStorage al inscribirse
    const inscribirAlumno = useCallback(async (idClase, user) => {
        if (!user) return null;
        const userId = user.idUsuario || user.id || 999;
        const userNombreCompleto = `${user.nombre || 'Cliente'} ${user.apellido || 'Moc'}`;
        const userEmail = user.email || 'cliente@test.com';

        let modificado = null;
        setClases(prev => {
            const next = prev.map(c => {
                if (c.idClase !== idClase) return c;
                
                // Si ya está inscripto o no hay cupo, no hace nada
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