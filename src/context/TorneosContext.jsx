import { createContext, useContext, useState, useEffect } from 'react';
import {
    algoritmoBergerTodosContraTodos,
    algoritmoEliminacionDirecta,
    crearResultadoSimulado,
    ganadorPartido,
} from '../utils/fixtures';

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
    { idEquipo: 5, nombre: 'Barrio Norte FC', capitan: 'Tomas Herrera', integrantes: ['Tomas Herrera', 'Nicolas Ruiz', 'Ezequiel Luna'], fechaCreacion: '2024-01-08' },
    { idEquipo: 6, nombre: 'La Banda del Sur', capitan: 'Santiago Molina', integrantes: ['Santiago Molina', 'Mateo Castro'], fechaCreacion: '2024-01-14' },
    { idEquipo: 7, nombre: 'Fenix Azul', capitan: 'Federico Acosta', integrantes: ['Federico Acosta', 'Ivan Torres', 'Bruno Vera'], fechaCreacion: '2024-01-21' },
];

const MOCK_COMPETENCIAS = [
    { id: 1, nombre: 'Liga Apertura 2024', descripcion: 'Liga principal de la temporada', tipo: 'liga', estado: 'en_curso', maxEquipos: 8, equipos: [1, 2, 3, 4], fechaInicio: '2024-01-10', fechaFin: '2024-06-10' },
    { id: 2, nombre: 'Copa de Verano', descripcion: 'Torneo corto eliminatorio', tipo: 'torneo', estado: 'inscripcion', maxEquipos: 16, equipos: [1, 2], fechaInicio: '2024-02-01', fechaFin: '2024-02-28' },
    { id: 3, nombre: 'Liga Nocturna', descripcion: 'Solo partidos después de las 20hs', tipo: 'liga', estado: 'inscripcion', maxEquipos: 10, equipos: [], fechaInicio: '2024-03-01', fechaFin: '2024-08-01' },
    { id: 4, nombre: 'Torneo Relámpago Finalizado', descripcion: 'Jugado el fin de semana pasado', tipo: 'torneo', estado: 'finalizado', maxEquipos: 4, equipos: [1, 2, 3, 4], fechaInicio: '2023-12-01', fechaFin: '2023-12-02' },
    { id: 5, nombre: 'Copa Invierno 2024', descripcion: 'Eliminacion directa para probar creacion de torneo', tipo: 'torneo', estado: 'inscripcion', maxEquipos: 8, equipos: [3, 5, 6, 7], fechaInicio: '2024-07-05', fechaFin: '2024-07-30' },
    { id: 6, nombre: 'Liga Promocional', descripcion: 'Liga abierta con cupos disponibles', tipo: 'liga', estado: 'inscripcion', maxEquipos: 12, equipos: [5, 6], fechaInicio: '2024-08-10', fechaFin: '2024-11-20' }
];

const MOCK_FIXTURES = [
    {
        competenciaID: 1,
        rondas: algoritmoBergerTodosContraTodos(1, [1, 2, 3, 4], '2024-01-10')
    }
];

const MAX_INTEGRANTES_EQUIPO = 16;

function normalizarEquipo(equipo) {
    const integrantes = Array.from(new Set([
        equipo.capitan,
        ...(equipo.integrantes || []),
    ].filter(Boolean)));

    return {
        ...equipo,
        integrantes: integrantes.slice(0, MAX_INTEGRANTES_EQUIPO),
    };
}

function avanzarLlavesEliminacion(rondas) {
    const next = rondas.map(ronda => ({
        ...ronda,
        partidos: ronda.partidos.map(partido => ({ ...partido }))
    }));

    for (let rondaIndex = 0; rondaIndex < next.length - 1; rondaIndex++) {
        const ronda = next[rondaIndex];
        const siguiente = next[rondaIndex + 1];

        ronda.partidos.forEach((partido, partidoIndex) => {
            if (!partido.definitivo) return;
            const ganador = ganadorPartido(partido);
            if (!ganador) return;

            const partidoDestino = siguiente.partidos[Math.floor(partidoIndex / 2)];
            if (!partidoDestino) return;

            if (partidoIndex % 2 === 0) {
                partidoDestino.equipoLocalId = ganador;
            } else {
                partidoDestino.equipoVisitanteId = ganador;
            }

            if (partidoDestino.equipoLocalId && partidoDestino.equipoVisitanteId && partidoDestino.estado === 'pendiente') {
                partidoDestino.estado = 'programado';
            }
        });
    }

    return next;
}

function normalizarTexto(texto) {
    return String(texto || '').trim().toLowerCase();
}

function mergePorIdGuardandoLocal(localItems, mockItems, idKey) {
    if (!Array.isArray(localItems) || localItems.length === 0) return mockItems;
    const idsLocales = new Set(localItems.map(item => item[idKey]));
    const faltantes = mockItems.filter(item => !idsLocales.has(item[idKey]));
    return [...localItems, ...faltantes];
}

export function TorneosProvider({ children }) {
    const [competencias, setCompetencias] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Carga inicial de datos
    useEffect(() => {
        fetchDatos();
    }, []);

    // 2. NUEVO: Guardado automático en LocalStorage ante cualquier cambio de estado
    useEffect(() => {
        if (!loading && USE_MOCK) {
            localStorage.setItem('competencias', JSON.stringify(competencias));
            localStorage.setItem('equipos', JSON.stringify(equipos));
            localStorage.setItem('fixtures', JSON.stringify(fixtures));
        }
    }, [competencias, equipos, fixtures, loading]);

    const fetchDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                {
                    // Intentamos leer lo que ya esté guardado en el navegador
                    const localComp = JSON.parse(localStorage.getItem('competencias') || 'null');
                    const localEq = JSON.parse(localStorage.getItem('equipos') || 'null');
                    const localFix = JSON.parse(localStorage.getItem('fixtures') || 'null');

                    // Si es la primera vez que abre la app, sembramos el LocalStorage con tus MOCKs
                    const competenciasIniciales = mergePorIdGuardandoLocal(localComp, MOCK_COMPETENCIAS, 'id');
                    const equiposIniciales = mergePorIdGuardandoLocal(localEq, MOCK_EQUIPOS, 'idEquipo');
                    const fixturesIniciales = mergePorIdGuardandoLocal(localFix, MOCK_FIXTURES, 'competenciaID');

                    localStorage.setItem('competencias', JSON.stringify(competenciasIniciales));
                    localStorage.setItem('equipos', JSON.stringify(equiposIniciales));
                    localStorage.setItem('fixtures', JSON.stringify(fixturesIniciales));

                    // Seteamos los estados usando lo que hay en LocalStorage o el fallback inicial
                    setCompetencias(competenciasIniciales);
                    setEquipos(equiposIniciales);
                    setFixtures(fixturesIniciales);
                }
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
            else setCompetencias(prev => [...prev, { ...comp, id: Date.now(), equipos: comp.equipos || [] }]);
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
        const equipoNormalizado = normalizarEquipo(equipo);
        if (USE_MOCK) {
            if (equipoNormalizado.idEquipo) setEquipos(prev => prev.map(e => e.idEquipo === equipoNormalizado.idEquipo ? { ...e, ...equipoNormalizado } : e));
            else setEquipos(prev => [...prev, { ...equipoNormalizado, idEquipo: Date.now(), fechaCreacion: new Date().toISOString().split('T')[0] }]);
            return;
        }

        const isEdit = !!equipoNormalizado.idEquipo;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_URL}/equipos/${equipoNormalizado.idEquipo}` : `${API_URL}/equipos`;
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipoNormalizado)
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
                if (c.id !== competenciaId) return c;
                const equiposActuales = c.equipos || [];
                const tieneCupo = equiposActuales.length < Number(c.maxEquipos || Infinity);
                const tieneFixture = fixtures.some(f => f.competenciaID === competenciaId);
                const abierta = c.estado !== 'finalizado' && !tieneFixture;
                const equipoAInscribir = equipos.find(e => e.idEquipo === equipoId);
                const capitanAInscribir = normalizarTexto(equipoAInscribir?.capitan);
                const capitanYaInscripto = equiposActuales.some(idEquipo => {
                    const equipoInscripto = equipos.find(e => e.idEquipo === idEquipo);
                    return normalizarTexto(equipoInscripto?.capitan) === capitanAInscribir;
                });
                if (abierta && tieneCupo && !equiposActuales.includes(equipoId) && (!capitanAInscribir || !capitanYaInscripto)) {
                    return { ...c, equipos: [...equiposActuales, equipoId] };
                }
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
        const data = await res.json();
        setCompetencias(prev => prev.map(c => c.id === data.id ? data : c));
    };

    const generarFixture = async (competenciaId) => {
        if (USE_MOCK) {
            const comp = competencias.find(c => c.id === competenciaId);
            if (!comp || comp.equipos.length < 2) return;

            let nuevasRondas = comp.tipo === 'liga' 
                ? algoritmoBergerTodosContraTodos(competenciaId, comp.equipos, comp.fechaInicio) 
                : algoritmoEliminacionDirecta(competenciaId, comp.equipos, comp.fechaInicio);

            setFixtures(prev => [...prev.filter(f => f.competenciaID !== competenciaId), { competenciaID: competenciaId, rondas: nuevasRondas }]);
            setCompetencias(prev => prev.map(c =>
                c.id === competenciaId && c.estado !== 'finalizado' ? { ...c, estado: 'en_curso' } : c
            ));
            return;
        }

        const res = await fetch(`${API_URL}/competencias/${competenciaId}/fixture`, { method: 'POST' });
        if (!res.ok) throw new Error('Error al generar fixture');
        
        const data = await res.json(); 
        setFixtures(prev => {
            const filtrado = prev.filter(f => f.competenciaID !== competenciaId);
            return [...filtrado, data];
        });
        
        setCompetencias(prev => prev.map(c =>
            c.id === competenciaId && c.estado !== 'finalizado' ? { ...c, estado: 'en_curso' } : c
        ));
    };

    const registrarResultado = async (competenciaId, partidoId, resultado) => {
        if (USE_MOCK) {
            const competencia = competencias.find(c => c.id === competenciaId);
            if (competencia?.estado === 'finalizado') return;
            setFixtures(prev => prev.map(fix => {
                if (fix.competenciaID === competenciaId) {
                    let rondasMod = fix.rondas.map(r => ({
                        ...r,
                        partidos: r.partidos.map(p =>
                            p.idPartido === partidoId ? { ...p, resultado, estado: 'finalizado', definitivo: false } : p
                        )
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
        
        await fetchDatos();
    };

    const confirmarResultadoDefinitivo = async (competenciaId, partidoId) => {
        if (USE_MOCK) {
            const competencia = competencias.find(c => c.id === competenciaId);
            if (competencia?.estado === 'finalizado') return;

            setFixtures(prev => prev.map(fix => {
                if (fix.competenciaID !== competenciaId) return fix;

                let rondasMod = fix.rondas.map(ronda => ({
                    ...ronda,
                    partidos: ronda.partidos.map(partido =>
                        partido.idPartido === partidoId && partido.estado === 'finalizado'
                            ? { ...partido, definitivo: true }
                            : partido
                    )
                }));

                if (competencia?.tipo === 'torneo') {
                    rondasMod = avanzarLlavesEliminacion(rondasMod);
                }

                return { ...fix, rondas: rondasMod };
            }));
            return;
        }
    };

    const simularFixture = async (competenciaId) => {
        if (USE_MOCK) {
            const competencia = competencias.find(c => c.id === competenciaId);
            if (!competencia || competencia.estado === 'finalizado') return;

            setFixtures(prev => prev.map(fix => {
                if (fix.competenciaID !== competenciaId) return fix;

                let rondasMod = fix.rondas;

                if (competencia.tipo === 'liga') {
                    rondasMod = rondasMod.map(ronda => ({
                        ...ronda,
                        partidos: ronda.partidos.map((partido, index) => ({
                            ...partido,
                            estado: 'finalizado',
                            definitivo: true,
                            resultado: partido.resultado || crearResultadoSimulado(ronda.numero * 10 + index),
                        }))
                    }));
                } else {
                    rondasMod = rondasMod.map((ronda, rondaIndex) => ({
                        ...ronda,
                        partidos: ronda.partidos.map((partido, index) => {
                            if (!partido.equipoLocalId || !partido.equipoVisitanteId) return partido;
                            return {
                                ...partido,
                                estado: 'finalizado',
                                definitivo: true,
                                resultado: partido.resultado || crearResultadoSimulado((rondaIndex + 1) * 10 + index),
                            };
                        })
                    }));

                    for (let i = 0; i < rondasMod.length; i++) {
                        rondasMod = avanzarLlavesEliminacion(rondasMod);
                        rondasMod = rondasMod.map((ronda, rondaIndex) => ({
                            ...ronda,
                            partidos: ronda.partidos.map((partido, index) => {
                                if (partido.estado === 'finalizado' || !partido.equipoLocalId || !partido.equipoVisitanteId) return partido;
                                return {
                                    ...partido,
                                    estado: 'finalizado',
                                    definitivo: true,
                                    resultado: crearResultadoSimulado((rondaIndex + 1) * 100 + index),
                                };
                            })
                        }));
                    }
                }

                return { ...fix, rondas: rondasMod };
            }));
            return;
        }
    };

    return (
        <TorneosContext.Provider value={{
            competencias, equipos, fixtures, loading, error,
            guardarCompetencia, eliminarCompetencia,
            guardarEquipo, eliminarEquipo, inscribirEquipo,
            generarFixture, registrarResultado, confirmarResultadoDefinitivo, simularFixture
        }}>
            {children}
        </TorneosContext.Provider>
    );
}

export const useTorneos = () => useContext(TorneosContext);
