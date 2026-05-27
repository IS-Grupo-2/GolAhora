import { createContext, useContext, useState, useEffect } from 'react';
import { algoritmoBergerTodosContraTodos, algoritmoEliminacionDirecta } from '../utils/fixtures';

const TorneosContext = createContext();

// Cambiar a false cuando el backend esté listo
const USE_MOCK = true; 
const API_URL = import.meta.env.VITE_API_URL;

// --- MOCK DATA ---
const MOCK_EQUIPOS = [
    { idEquipo: 1, nombre: 'Los Galácticos FC', capitan: 'Juan Pérez', integrantes: ['Juan Pérez', 'Carlos Gómez', 'Luis Román'], fechaCreacion: '2023-10-01' },
    { idEquipo: 2, nombre: 'Real Bañil', capitan: 'Martín López', integrantes: ['Martín López', 'Luis Díaz'], fechaCreacion: '2023-10-05' },
    { idEquipo: 3, nombre: 'Deportivo Tapita', capitan: 'Diego Maradona', integrantes: ['Diego Maradona', 'Leo Messi', 'Angel Di Maria'], fechaCreacion: '2023-10-10' },
    { idEquipo: 4, nombre: 'Sacachispas', capitan: 'Pepe M.', integrantes: ['Pepe M.', 'Manuel Neuer'], fechaCreacion: '2023-10-12' },
];

const MOCK_COMPETENCIAS = [
    { id: 1, nombre: 'Liga Apertura 2024', descripcion: 'Liga principal de la temporada', tipo: 'liga', estado: 'en_curso', maxEquipos: 8, equipos: [1, 2, 3, 4], fechaInicio: '2024-01-10', fechaFin: '2024-06-10' },
    { id: 2, nombre: 'Copa de Verano', descripcion: 'Torneo corto eliminatorio', tipo: 'torneo', estado: 'inscripcion', maxEquipos: 16, equipos: [1, 2], fechaInicio: '2024-02-01', fechaFin: '2024-02-28' },
    { id: 3, nombre: 'Liga Nocturna', descripcion: 'Solo partidos después de las 20hs', tipo: 'liga', estado: 'inscripcion', maxEquipos: 10, equipos: [], fechaInicio: '2024-03-01', fechaFin: '2024-08-01' },
    { id: 4, nombre: 'Torneo Relámpago Finalizado', descripcion: 'Jugado el fin de semana pasado', tipo: 'torneo', estado: 'finalizado', maxEquipos: 4, equipos: [1, 2, 3, 4], fechaInicio: '2023-12-01', fechaFin: '2023-12-02' }
];

const MOCK_FIXTURES = [
    {
        competenciaID: 1,
        rondas: algoritmoBergerTodosContraTodos(1, [1, 2, 3, 4])
    }
];

export function TorneosProvider({ children }) {
    const [competencias, setCompetencias] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDatos();
    }, []);

    const fetchDatos = () => {
        setLoading(true);
        if (USE_MOCK) {
            setTimeout(() => {
                setCompetencias(MOCK_COMPETENCIAS);
                setEquipos(MOCK_EQUIPOS);
                setFixtures(MOCK_FIXTURES);
                setLoading(false);
            }, 400);
        } else {
            // Aquí irá el fetch a la API real
        }
    };

    // --- CRUD COMPETENCIAS ---
    const guardarCompetencia = (comp) => {
        if (comp.id) {
            setCompetencias(prev => prev.map(c => c.id === comp.id ? { ...c, ...comp } : c));
        } else {
            setCompetencias(prev => [...prev, { ...comp, id: Date.now(), equipos: [], fechaInicio: new Date().toISOString().split('T')[0] }]);
        }
    };

    const eliminarCompetencia = (id) => {
        setCompetencias(prev => prev.filter(c => c.id !== id));
    };

    // --- CRUD EQUIPOS ---
    const guardarEquipo = (equipo) => {
        if (equipo.idEquipo) {
            setEquipos(prev => prev.map(e => e.idEquipo === equipo.idEquipo ? { ...e, ...equipo } : e));
        } else {
            setEquipos(prev => [...prev, { ...equipo, idEquipo: Date.now(), fechaCreacion: new Date().toISOString().split('T')[0] }]);
        }
    };

    const eliminarEquipo = (id) => {
        setEquipos(prev => prev.filter(e => e.idEquipo !== id));
    };

    // --- LÓGICA DE NEGOCIO ---
    const inscribirEquipo = (competenciaId, equipoId) => {
        setCompetencias(prev => prev.map(c => {
            if (c.id === competenciaId && !c.equipos.includes(equipoId)) {
                return { ...c, equipos: [...c.equipos, equipoId] };
            }
            return c;
        }));
    };

    const generarFixture = (competenciaId) => {
        const comp = competencias.find(c => c.id === competenciaId);
        if (!comp || comp.equipos.length < 2) return;

        let nuevasRondas = [];
        if (comp.tipo === 'liga') {
            nuevasRondas = algoritmoBergerTodosContraTodos(competenciaId, comp.equipos);
        } else {
            nuevasRondas = algoritmoEliminacionDirecta(competenciaId, comp.equipos);
        }

        setFixtures(prev => {
            const filtrado = prev.filter(f => f.competenciaID !== competenciaId);
            return [...filtrado, { competenciaID: competenciaId, rondas: nuevasRondas }];
        });
        
        // Pasamos la competencia a "en_curso" automáticamente
        setCompetencias(prev => prev.map(c => c.id === competenciaId ? { ...c, estado: 'en_curso' } : c));
    };

    const registrarResultado = (competenciaId, partidoId, resultado) => {
        setFixtures(prev => prev.map(fix => {
            if (fix.competenciaID === competenciaId) {
                const rondasMod = fix.rondas.map(r => {
                    const partidosMod = r.partidos.map(p => {
                        if (p.idPartido === partidoId) {
                            return { ...p, resultado, estado: 'finalizado' };
                        }
                        return p;
                    });
                    return { ...r, partidos: partidosMod };
                });
                return { ...fix, rondas: rondasMod };
            }
            return fix;
        }));
    };

    return (
        <TorneosContext.Provider value={{
            competencias, equipos, fixtures, loading, error,
            guardarCompetencia, eliminarCompetencia,
            guardarEquipo, eliminarEquipo, inscribirEquipo,
            generarFixture, registrarResultado
        }}>
            {children}
        </TorneosContext.Provider>
    );
}

export const useTorneos = () => useContext(TorneosContext);