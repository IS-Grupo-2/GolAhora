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

    const fetchDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                setTimeout(() => {
                    setCompetencias(MOCK_COMPETENCIAS);
                    setEquipos(MOCK_EQUIPOS);
                    setFixtures(MOCK_FIXTURES);
                    setLoading(false);
                }, 400);
            } else {
                const [resComp, resEq, resFix] = await Promise.all([
                    fetch(`${API_URL}/competencias`),
                    fetch(`${API_URL}/equipos`),
                    fetch(`${API_URL}/fixtures`)
                ]);
                
                if (!resComp.ok || !resEq.ok || !resFix.ok) {
                    throw new Error('Error al cargar datos iniciales de Torneos');
                }

                setCompetencias(await resComp.json());
                setEquipos(await resEq.json());
                setFixtures(await resFix.json());
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- CRUD COMPETENCIAS ---
    const guardarCompetencia = async (comp) => {
        if (USE_MOCK) {
            if (comp.id) setCompetencias(prev => prev.map(c => c.id === comp.id ? { ...c, ...comp } : c));
            else setCompetencias(prev => [...prev, { ...comp, id: Date.now(), equipos: [], fechaInicio: new Date().toISOString().split('T')[0] }]);
            return;
        }
        
        const isEdit = !!comp.id;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_URL}/competencias/${comp.id}` : `${API_URL}/competencias`;
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comp)
        });
        if (!res.ok) throw new Error('Error al guardar competencia');
        const data = await res.json();
        
        if (isEdit) setCompetencias(prev => prev.map(c => c.id === data.id ? data : c));
        else setCompetencias(prev => [...prev, data]);
    };

    const eliminarCompetencia = async (id) => {
        if (USE_MOCK) {
            setCompetencias(prev => prev.filter(c => c.id !== id));
            return;
        }
        const res = await fetch(`${API_URL}/competencias/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar competencia');
        setCompetencias(prev => prev.filter(c => c.id !== id));
    };

    // --- CRUD EQUIPOS ---
    const guardarEquipo = async (equipo) => {
        if (USE_MOCK) {
            if (equipo.idEquipo) setEquipos(prev => prev.map(e => e.idEquipo === equipo.idEquipo ? { ...e, ...equipo } : e));
            else setEquipos(prev => [...prev, { ...equipo, idEquipo: Date.now(), fechaCreacion: new Date().toISOString().split('T')[0] }]);
            return;
        }

        const isEdit = !!equipo.idEquipo;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_URL}/equipos/${equipo.idEquipo}` : `${API_URL}/equipos`;
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipo)
        });
        if (!res.ok) throw new Error('Error al guardar equipo');
        const data = await res.json();
        
        if (isEdit) setEquipos(prev => prev.map(e => e.idEquipo === data.idEquipo ? data : e));
        else setEquipos(prev => [...prev, data]);
    };

    const eliminarEquipo = async (id) => {
        if (USE_MOCK) {
            setEquipos(prev => prev.filter(e => e.idEquipo !== id));
            return;
        }
        const res = await fetch(`${API_URL}/equipos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar equipo');
        setEquipos(prev => prev.filter(e => e.idEquipo !== id));
    };

    // --- LÓGICA DE NEGOCIO ---
    const inscribirEquipo = async (competenciaId, equipoId) => {
        if (USE_MOCK) {
            setCompetencias(prev => prev.map(c => {
                if (c.id === competenciaId && !c.equipos.includes(equipoId)) return { ...c, equipos: [...c.equipos, equipoId] };
                return c;
            }));
            return;
        }

        const res = await fetch(`${API_URL}/competencias/${competenciaId}/inscribir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipoId })
        });
        if (!res.ok) throw new Error('Error al inscribir equipo');
        const data = await res.json(); // Se asume que retorna la competencia actualizada
        setCompetencias(prev => prev.map(c => c.id === data.id ? data : c));
    };

    const generarFixture = async (competenciaId) => {
        if (USE_MOCK) {
            const comp = competencias.find(c => c.id === competenciaId);
            if (!comp || comp.equipos.length < 2) return;

            let nuevasRondas = comp.tipo === 'liga' 
                ? algoritmoBergerTodosContraTodos(competenciaId, comp.equipos) 
                : algoritmoEliminacionDirecta(competenciaId, comp.equipos);

            setFixtures(prev => [...prev.filter(f => f.competenciaID !== competenciaId), { competenciaID: competenciaId, rondas: nuevasRondas }]);
            setCompetencias(prev => prev.map(c => c.id === competenciaId ? { ...c, estado: 'en_curso' } : c));
            return;
        }

        const res = await fetch(`${API_URL}/competencias/${competenciaId}/fixture`, { method: 'POST' });
        if (!res.ok) throw new Error('Error al generar fixture');
        
        // Se asume que retorna el nuevo fixture generado
        const data = await res.json(); 
        setFixtures(prev => {
            const filtrado = prev.filter(f => f.competenciaID !== competenciaId);
            return [...filtrado, data];
        });
        
        // Actualizamos estado local de la competencia
        setCompetencias(prev => prev.map(c => c.id === competenciaId ? { ...c, estado: 'en_curso' } : c));
    };

    const registrarResultado = async (competenciaId, partidoId, resultado) => {
        if (USE_MOCK) {
            setFixtures(prev => prev.map(fix => {
                if (fix.competenciaID === competenciaId) {
                    const rondasMod = fix.rondas.map(r => ({
                        ...r, partidos: r.partidos.map(p => p.idPartido === partidoId ? { ...p, resultado, estado: 'finalizado' } : p)
                    }));
                    return { ...fix, rondas: rondasMod };
                }
                return fix;
            }));
            return;
        }

        const res = await fetch(`${API_URL}/fixtures/${competenciaId}/partido/${partidoId}/resultado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resultado })
        });
        if (!res.ok) throw new Error('Error al registrar resultado');
        
        // Se asume que devuelve el fixture entero actualizado o el partido
        // Para simplificar, refrescamos todos los datos (o podrías actualizar localmente como en el mock)
        await fetchDatos();
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