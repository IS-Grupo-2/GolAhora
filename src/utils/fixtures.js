// ── FUNCIONES PURAS MATEMÁTICAS: ALGORITMOS DE FIXTURES ──────────────────────

export function algoritmoBergerTodosContraTodos(competenciaId, equiposIds) {
    let ids = [...equiposIds];
    // Si la cantidad es impar, agregamos un "Equipo Libre" (null)
    if (ids.length % 2 !== 0) {
        ids.push(null);
    }

    const numEquipos = ids.length;
    const numRondas = numEquipos - 1;
    const rondas = [];

    for (let r = 0; r < numRondas; r++) {
        const partidos = [];
        for (let i = 0; i < numEquipos / 2; i++) {
            const local = ids[i];
            const visitante = ids[numEquipos - 1 - i];

            // Solo creamos el partido real si ninguno es el "Equipo Libre"
            if (local !== null && visitante !== null) {
                partidos.push({
                    idPartido: `${competenciaId}-r${r + 1}-p${i}`, // ← ¡Corregido!
                    equipoLocalId: local,                          // ← ¡Corregido!
                    equipoVisitanteId: visitante,                  // ← ¡Corregido!
                    estado: 'programado',
                    resultado: null
                });
            }
        }

        rondas.push({
            id: `${competenciaId}-r${r + 1}`, // ← ¡Faltaba esto!
            numero: r + 1,
            nombre: `Fecha ${r + 1}`,
            partidos
        });

        // Rotación de Berger: dejamos el primero fijo y rotamos los demás en sentido horario
        ids.splice(1, 0, ids.pop());
    }
    return rondas;
}

export function algoritmoEliminacionDirecta(competenciaId, equiposIds) {
    const numEquipos = equiposIds.length;
    const numRondas = Math.ceil(Math.log2(numEquipos));
    const rondas = [];
    let equiposActuales = [...equiposIds];
    
    const nombresRondas = ['Final', 'Semifinal', 'Cuartos de Final', 'Octavos de Final'];

    for (let r = 0; r < numRondas; r++) {
        const partidos = [];
        const indexNombre = numRondas - r - 1;
        const nombreRonda = nombresRondas[indexNombre] || `Ronda de ${equiposActuales.length}`;

        for (let i = 0; i < equiposActuales.length; i += 2) {
            const local = equiposActuales[i];
            const visitante = equiposActuales[i + 1] || null;

            partidos.push({
                idPartido: `${competenciaId}-el${r + 1}-p${Math.floor(i / 2)}`, // ← ¡Corregido!
                equipoLocalId: local,                                           // ← ¡Corregido!
                equipoVisitanteId: visitante,                                   // ← ¡Corregido!
                estado: 'programado',
                resultado: null
            });
        }

        rondas.push({
            id: `${competenciaId}-el${r + 1}`, // ← ¡Faltaba esto!
            numero: r + 1,
            nombre: nombreRonda,
            partidos
        });

        equiposActuales = equiposActuales.slice(0, Math.ceil(equiposActuales.length / 2));
    }
    return rondas;
}