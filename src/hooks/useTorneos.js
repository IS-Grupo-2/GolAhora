// src/hooks/useTorneos.js
import { useState, useEffect } from 'react';

export function useTorneos() {
    // ── Estados con persistencia en LocalStorage ─────────────────────────────
    const [competencias, setCompetencias] = useState(() => {
        const data = localStorage.getItem('gol_competencias');
        return data ? JSON.parse(data) : [
            { id: 1, nombre: 'Liga Apertura 2026', tipo: 'liga', estado: 'activo', equipos: [1, 2, 3, 4] },
            { id: 2, nombre: 'Copa Campeones', tipo: 'torneo', estado: 'activo', equipos: [] }
        ];
    });

    const [equipos, setEquipos] = useState(() => {
        const data = localStorage.getItem('gol_equipos');
        return data ? JSON.parse(data) : [
            { idEquipo: 1, nombre: 'Los Tigres FC', capitan: 'Juan Pérez', integrantes: ['Juan Pérez', 'Carlos Gómez'], fechaCreacion: '2026-01-15' },
            { idEquipo: 2, nombre: 'Águilas Doradas', capitan: 'Martín López', integrantes: ['Martín López'], fechaCreacion: '2026-02-10' },
            { idEquipo: 3, nombre: 'Leones Unidos', capitan: 'Lucas Díaz', integrantes: ['Lucas Díaz'], fechaCreacion: '2026-03-05' },
            { idEquipo: 4, nombre: 'Pumas FC', capitan: 'Franco Silva', integrantes: [], fechaCreacion: '2026-03-20' }
        ];
    });

    const [fixtures, setFixtures] = useState(() => {
        const data = localStorage.getItem('gol_fixtures');
        return data ? JSON.parse(data) : [];
    });

    // ── Sincronización automática con LocalStorage ───────────────────────────
    useEffect(() => {
        localStorage.setItem('gol_competencias', JSON.stringify(competencias));
    }, [competencias]);

    useEffect(() => {
        localStorage.setItem('gol_equipos', JSON.stringify(equipos));
    }, [equipos]);

    useEffect(() => {
        localStorage.setItem('gol_fixtures', JSON.stringify(fixtures));
    }, [fixtures]);


    // ── Acciones para Competencias ───────────────────────────────────────────
    const guardarCompetencia = (competenciaData) => {
        if (competenciaData.id) {
            // Modo Edición
            setCompetencias(prev => prev.map(c => c.id === competenciaData.id ? { ...c, ...competenciaData } : c));
            mostrarToast('Competencia actualizada correctamente', 'success');
        } else {
            // Modo Creación
            setCompetencias(prev => {
                const nueva = {
                    ...competenciaData,
                    id: prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1,
                    equipos: [],
                    fixture: null
                };
                return [...prev, nueva];
            });
            mostrarToast('Competencia creada exitosamente', 'success');
        }
    };

    const eliminarCompetencia = (id) => {
        setCompetencias(prev => prev.filter(c => c.id !== id));
        setFixtures(prev => prev.filter(f => f.competenciaID !== id));
        mostrarToast('Competencia eliminada', 'success');
    };


    // ── Acciones para Equipos ────────────────────────────────────────────────
    const guardarEquipo = (equipoData) => {
        if (equipoData.idEquipo) {
            // Modo Edición
            setEquipos(prev => prev.map(e => e.idEquipo === equipoData.idEquipo ? { ...e, ...equipoData } : e));
            mostrarToast('Equipo actualizado correctamente', 'success');
        } else {
            // Modo Creación
            const nuevo = {
                ...equipoData,
                idEquipo: equipos.length > 0 ? Math.max(...equipos.map(e => e.idEquipo)) + 1 : 1,
                fechaCreacion: new Date().toISOString().split('T')[0]
            };
            setEquipos(prev => [...prev, nuevo]);
            mostrarToast('Equipo registrado exitosamente', 'success');
        }
    };

    const eliminarEquipo = (idEquipo) => {
        setEquipos(prev => prev.filter(e => e.idEquipo !== idEquipo));
        // Remover el equipo de las competencias donde estaba inscrito
        setCompetencias(prev => prev.map(c => ({
            ...c,
            equipos: c.equipos ? c.equipos.filter(id => id !== idEquipo) : []
        })));
        mostrarToast('Equipo eliminado correctamente', 'success');
    };

    const inscribirEquipoEnCompetencia = (competenciaId, idEquipo) => {
        // Bloqueamos la inscripción si la competencia ya tiene fixture generado
        const tieneFixture = fixtures.some(f => f.competenciaID === competenciaId);
        setCompetencias(prev => prev.map(c => {
            if (c.id === competenciaId) {
                // Si la competencia ya fue finalizada o tiene fixture, no permitimos inscripciones
                if (c.estado === 'finalizado' || tieneFixture) {
                    mostrarToast('No se puede inscribir equipos: competencia cerrada', 'danger');
                    return c;
                }

                const listaEquipos = c.equipos || [];
                if (listaEquipos.includes(idEquipo)) {
                    mostrarToast('El equipo ya está inscrito en esta competencia', 'warning');
                    return c;
                }
                mostrarToast('Equipo inscrito correctamente', 'success');
                return { ...c, equipos: [...listaEquipos, idEquipo] };
            }
            return c;
        }));
    };


    // ── Generación de Fixtures Avanzada (Lógica Unificada) ───────────────────
    const generarFixture = (competenciaId) => {
        const comp = competencias.find(c => c.id === competenciaId);
        if (!comp || !comp.equipos || comp.equipos.length < 2) {
            mostrarToast('Se necesitan mínimo 2 equipos inscritos para armar el fixture', 'danger');
            return;
        }

        const rounds = comp.tipo === 'liga'
            ? algoritmoBergerTodosContraTodos(comp.id, comp.equipos)
            : algoritmoEliminacionDirecta(comp.id, comp.equipos);

        const nuevoFixture = {
            competenciaID: competenciaId,
            fechaGeneracion: new Date().toISOString(),
            rondas: rounds
        };

        setFixtures(prev => {
            const filtrados = prev.filter(f => f.competenciaID !== competenciaId);
            return [...filtrados, nuevoFixture];
        });

        // Marcamos la competencia como finalizada para evitar más inscripciones
        setCompetencias(prev => prev.map(c => c.id === competenciaId ? { ...c, estado: 'finalizado' } : c));

        mostrarToast(`¡Fixture de ${comp.tipo} generado con éxito!`, 'success');
    };

    const registrarResultadoPartido = (competenciaId, partidoId, resultadoData) => {
        setFixtures(prev => prev.map(f => {
            if (f.competenciaID === competenciaId) {
                return {
                    ...f,
                    rondas: f.rondas.map(r => ({
                        ...r,
                        partidos: r.partidos.map(p => {
                            if (p.idPartido === partidoId) {
                                return {
                                    ...p,
                                    estado: 'finalizado',
                                    resultado: {
                                        golesLocal: parseInt(resultadoData.golesLocal || 0),
                                        golesVisitante: parseInt(resultadoData.golesVisitante || 0),
                                        faltas: parseInt(resultadoData.faltas || 0),
                                        observaciones: resultadoData.observaciones || ''
                                    }
                                };
                            }
                            return p;
                        })
                    }))
                };
            }
            return f;
        }));
        mostrarToast('Resultado guardado correctamente', 'success');
    };


    // ── Helper Toast Dinámico ────────────────────────────────────────────────
    const mostrarToast = (message, type) => {
        const container = document.getElementById('toast-container') || document.createElement('div');
        if (!container.id) {
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} toast-show`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    return {
        competencias,
        equipos,
        fixtures,
        guardarCompetencia,
        eliminarCompetencia,
        guardarEquipo,
        eliminarEquipo,
        inscribirEquipoEnCompetencia,
        generarFixture,
        registrarResultadoPartido
    };
}