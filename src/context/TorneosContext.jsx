import { createContext, useContext, useState, useEffect } from 'react';
import {
    algoritmoBergerTodosContraTodos,
    algoritmoEliminacionDirecta,
    crearResultadoSimulado,
    ganadorPartido,
} from '../utils/fixtures';

const TorneosContext = createContext();

const USE_MOCK = true;
const API_URL = import.meta.env.VITE_API_URL;
const TORNEOS_SEED_VERSION = 'presentacion-mocks-2026-06-08';
const MAX_INTEGRANTES_EQUIPO = 16;

const MOCK_EQUIPOS = [
    { idEquipo: 1, nombre: 'Los Halcones FC', capitan: 'Lucia Martinez', integrantes: ['Lucia Martinez', 'Matias Correa', 'Paula Rivero'], creadoPor: { idUsuario: 101, id: 101, email: 'lucia.martinez@example.com', username: 'lucia.martinez', nombre: 'Lucia', apellido: 'Martinez' }, fechaCreacion: '2024-05-01' },
    { idEquipo: 2, nombre: 'Barrio Norte', capitan: 'Tomas Herrera', integrantes: ['Tomas Herrera', 'Nicolas Ruiz', 'Ezequiel Luna'], creadoPor: { idUsuario: 102, id: 102, email: 'tomas.herrera@example.com', username: 'tomas.herrera', nombre: 'Tomas', apellido: 'Herrera' }, fechaCreacion: '2024-05-02' },
    { idEquipo: 3, nombre: 'Las Torres', capitan: 'Camila Torres', integrantes: ['Camila Torres', 'Sofia Rojas', 'Agustina Paz'], creadoPor: { idUsuario: 103, id: 103, email: 'camila.torres@example.com', username: 'camila.torres', nombre: 'Camila', apellido: 'Torres' }, fechaCreacion: '2024-05-03' },
    { idEquipo: 4, nombre: 'Vega United', capitan: 'Diego Vega', integrantes: ['Diego Vega', 'Joaquin Silva', 'Ramon Pereyra'], creadoPor: { idUsuario: 104, id: 104, email: 'diego.vega@example.com', username: 'diego.vega', nombre: 'Diego', apellido: 'Vega' }, fechaCreacion: '2024-05-04' },
];

const MOCK_COMPETENCIAS = [
    { id: 1, nombre: 'Liga Apertura Demo', descripcion: 'Liga activa con cuatro equipos y capitanes distintos', tipo: 'liga', estado: 'en_curso', maxEquipos: 8, equipos: [1, 2, 3, 4], fechaInicio: '2026-06-15', fechaFin: '2026-06-24', precioInscripcion: 12000 },
    { id: 2, nombre: 'Copa Presentacion', descripcion: 'Torneo eliminatorio de prueba con cupos disponibles', tipo: 'torneo', estado: 'inscripcion', maxEquipos: 8, equipos: [1, 2], fechaInicio: '2026-06-20', fechaFin: '2026-06-24', precioInscripcion: 10000 },
    { id: 3, nombre: 'Liga Nocturna Demo', descripcion: 'Liga abierta para probar inscripcion de equipos', tipo: 'liga', estado: 'inscripcion', maxEquipos: 10, equipos: [], fechaInicio: '2026-06-22', fechaFin: '2026-07-03', precioInscripcion: 9000 },
];

const MOCK_FIXTURES = [
    {
        competenciaID: 1,
        rondas: algoritmoBergerTodosContraTodos(1, [1, 2, 3, 4], '2026-06-15')
    }
];

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

export function TorneosProvider({ children }) {
    const [competencias, setCompetencias] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDatos();
    }, []);

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
                const seedVersion = localStorage.getItem('torneos_seed_version');
                if (seedVersion !== TORNEOS_SEED_VERSION) {
                    localStorage.setItem('competencias', JSON.stringify(MOCK_COMPETENCIAS));
                    localStorage.setItem('equipos', JSON.stringify(MOCK_EQUIPOS));
                    localStorage.setItem('fixtures', JSON.stringify(MOCK_FIXTURES));
                    localStorage.setItem('torneos_seed_version', TORNEOS_SEED_VERSION);
                    setCompetencias(MOCK_COMPETENCIAS);
                    setEquipos(MOCK_EQUIPOS);
                    setFixtures(MOCK_FIXTURES);
                } else {
                    setCompetencias(JSON.parse(localStorage.getItem('competencias') || '[]'));
                    setEquipos(JSON.parse(localStorage.getItem('equipos') || '[]'));
                    setFixtures(JSON.parse(localStorage.getItem('fixtures') || '[]'));
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

            const nuevasRondas = comp.tipo === 'liga'
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
        setFixtures(prev => [...prev.filter(f => f.competenciaID !== competenciaId), data]);
        setCompetencias(prev => prev.map(c =>
            c.id === competenciaId && c.estado !== 'finalizado' ? { ...c, estado: 'en_curso' } : c
        ));
    };

    const registrarResultado = async (competenciaId, partidoId, resultado) => {
        if (USE_MOCK) {
            const competencia = competencias.find(c => c.id === competenciaId);
            if (competencia?.estado === 'finalizado') return;
            setFixtures(prev => prev.map(fix => {
                if (fix.competenciaID !== competenciaId) return fix;
                const rondasMod = fix.rondas.map(r => ({
                    ...r,
                    partidos: r.partidos.map(p =>
                        p.idPartido === partidoId ? { ...p, resultado, estado: 'finalizado', definitivo: false } : p
                    )
                }));
                return { ...fix, rondas: rondasMod };
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
