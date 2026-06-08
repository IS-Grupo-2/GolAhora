function sumarDias(fechaISO, dias) {
    const base = fechaISO ? new Date(`${fechaISO}T00:00:00`) : new Date();
    base.setDate(base.getDate() + dias);
    return base.toISOString().split('T')[0];
}

function nombreRondaEliminacion(equiposEnRonda) {
    if (equiposEnRonda === 2) return 'Final';
    if (equiposEnRonda === 4) return 'Semifinales';
    if (equiposEnRonda === 8) return 'Cuartos de Final';
    if (equiposEnRonda === 16) return 'Octavos de Final';
    return `Ronda de ${equiposEnRonda}`;
}

function crearPartido({ competenciaId, rondaNumero, index, local, visitante, prefijo, fecha }) {
    return {
        idPartido: `${competenciaId}-${prefijo}${rondaNumero}-p${index}`,
        equipoLocalId: local ?? null,
        equipoVisitanteId: visitante ?? null,
        estado: local && visitante ? 'programado' : 'pendiente',
        resultado: null,
        fecha,
    };
}

export function algoritmoBergerTodosContraTodos(competenciaId, equiposIds, fechaInicio) {
    let ids = [...equiposIds];
    if (ids.length % 2 !== 0) ids.push(null);

    const numEquipos = ids.length;
    const numRondas = numEquipos - 1;
    const rondas = [];

    for (let r = 0; r < numRondas; r++) {
        const fecha = sumarDias(fechaInicio, r);
        const partidos = [];

        for (let i = 0; i < numEquipos / 2; i++) {
            const local = ids[i];
            const visitante = ids[numEquipos - 1 - i];

            if (local !== null && visitante !== null) {
                partidos.push(crearPartido({
                    competenciaId,
                    rondaNumero: r + 1,
                    index: i,
                    local,
                    visitante,
                    prefijo: 'r',
                    fecha,
                }));
            }
        }

        rondas.push({
            id: `${competenciaId}-r${r + 1}`,
            numero: r + 1,
            nombre: `Fecha ${r + 1}`,
            fecha,
            partidos,
        });

        ids.splice(1, 0, ids.pop());
    }

    return rondas;
}

export function algoritmoEliminacionDirecta(competenciaId, equiposIds, fechaInicio) {
    const totalEquipos = equiposIds.length;
    const numRondas = Math.ceil(Math.log2(totalEquipos));
    const rondas = [];

    for (let r = 0; r < numRondas; r++) {
        const equiposEnRonda = 2 ** (numRondas - r);
        const cantidadPartidos = equiposEnRonda / 2;
        const fecha = sumarDias(fechaInicio, r);
        const partidos = [];

        for (let i = 0; i < cantidadPartidos; i++) {
            const local = r === 0 ? equiposIds[i * 2] : null;
            const visitante = r === 0 ? equiposIds[i * 2 + 1] : null;

            partidos.push(crearPartido({
                competenciaId,
                rondaNumero: r + 1,
                index: i,
                local,
                visitante,
                prefijo: 'el',
                fecha,
            }));
        }

        rondas.push({
            id: `${competenciaId}-el${r + 1}`,
            numero: r + 1,
            nombre: nombreRondaEliminacion(equiposEnRonda),
            fecha,
            partidos,
        });
    }

    return rondas;
}

export function calcularTablaLiga(rondas = [], equipos = []) {
    const tabla = new Map();

    equipos.forEach(idEquipo => {
        tabla.set(idEquipo, {
            idEquipo,
            pj: 0,
            pg: 0,
            pe: 0,
            pp: 0,
            gf: 0,
            gc: 0,
            dg: 0,
            pts: 0,
        });
    });

    rondas.flatMap(r => r.partidos || []).forEach(partido => {
        if (partido.estado !== 'finalizado' || !partido.resultado) return;

        const local = tabla.get(partido.equipoLocalId);
        const visitante = tabla.get(partido.equipoVisitanteId);
        if (!local || !visitante) return;

        const gl = Number(partido.resultado.golesLocal || 0);
        const gv = Number(partido.resultado.golesVisitante || 0);

        local.pj += 1;
        visitante.pj += 1;
        local.gf += gl;
        local.gc += gv;
        visitante.gf += gv;
        visitante.gc += gl;

        if (gl > gv) {
            local.pg += 1;
            local.pts += 3;
            visitante.pp += 1;
        } else if (gv > gl) {
            visitante.pg += 1;
            visitante.pts += 3;
            local.pp += 1;
        } else {
            local.pe += 1;
            visitante.pe += 1;
            local.pts += 1;
            visitante.pts += 1;
        }

        local.dg = local.gf - local.gc;
        visitante.dg = visitante.gf - visitante.gc;
    });

    return [...tabla.values()].sort((a, b) =>
        b.pts - a.pts ||
        b.dg - a.dg ||
        b.gf - a.gf ||
        a.idEquipo - b.idEquipo
    );
}

export function crearResultadoSimulado(seed = 1) {
    const golesLocal = (seed * 3 + 1) % 5;
    let golesVisitante = (seed * 5 + 2) % 5;
    if (golesLocal === golesVisitante && seed % 4 === 0) golesVisitante = (golesVisitante + 1) % 5;

    return {
        golesLocal,
        golesVisitante,
        faltas: 6 + (seed % 9),
        observaciones: 'Resultado simulado automaticamente.',
    };
}

export function ganadorPartido(partido) {
    if (!partido?.resultado) return null;
    const gl = Number(partido.resultado.golesLocal || 0);
    const gv = Number(partido.resultado.golesVisitante || 0);
    if (gl === gv) return partido.equipoLocalId;
    return gl > gv ? partido.equipoLocalId : partido.equipoVisitanteId;
}
