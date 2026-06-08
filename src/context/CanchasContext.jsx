import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CanchasContext = createContext();
const CANCHAS_SEED_VERSION = 'presentacion-mocks-2026-06-08';

const DIAS_SEMANA = ['Lunes', 'Martes', 'MiÃ©rcoles', 'Jueves', 'Viernes', 'SÃ¡bado', 'Domingo'];

const normalizarDia = (dia) => {
    if (typeof dia === 'number') return DIAS_SEMANA[dia - 1] || DIAS_SEMANA[0];
    return String(dia || '')
        .replace('Miércoles', 'MiÃ©rcoles')
        .replace('Miercoles', 'MiÃ©rcoles')
        .replace('MiÃƒÂ©rcoles', 'MiÃ©rcoles')
        .replace('Sábado', 'SÃ¡bado')
        .replace('Sabado', 'SÃ¡bado')
        .replace('SÃƒÂ¡bado', 'SÃ¡bado');
};

const normalizarDisp = (disp) => {
    const idCancha = Number(disp.idCancha ?? disp.canchaId);
    return {
        ...disp,
        idCancha,
        canchaId: idCancha,
        diaSemana: normalizarDia(disp.diaSemana),
        horaInicio: Number(disp.horaInicio),
        horaFin: Number(disp.horaFin),
        disponible: disp.disponible !== false
    };
};

const completarDisponibilidadesMock = (actuales) => {
    const claves = new Set(actuales.map(d => `${d.idCancha}-${d.diaSemana}`));
    const faltantes = MOCK_DISP
        .map(normalizarDisp)
        .filter(d => !claves.has(`${d.idCancha}-${d.diaSemana}`));
    return [...actuales, ...faltantes];
};

const MOCK_TIPOS = [
    { id: 1, nombre: 'Futbol 5', superficie: 'Cesped sintetico', capacidadJugadores: 10, duracionMaxReservaMin: 60, precioHora: 15000, descripcion: 'Cancha reducida para reservas rapidas y entrenamientos tecnicos.' },
    { id: 2, nombre: 'Futbol 7', superficie: 'Cesped sintetico', capacidadJugadores: 14, duracionMaxReservaMin: 90, precioHora: 22000, descripcion: 'Cancha intermedia para partidos recreativos y practicas grupales.' },
    { id: 3, nombre: 'Futbol 11', superficie: 'Cesped natural', capacidadJugadores: 22, duracionMaxReservaMin: 120, precioHora: 38000, descripcion: 'Cancha reglamentaria para partidos completos y competencias.' }
];

const MOCK_CANCHAS = [
    { id: 101, numero: 1, nombre: 'Cancha Futbol 5', idTipo: 1, tipoCanchaId: 1, estado: 'activa', activa: true, descripcion: 'Cancha de futbol 5 con iluminacion LED.' },
    { id: 102, numero: 2, nombre: 'Cancha Futbol 7', idTipo: 2, tipoCanchaId: 2, estado: 'activa', activa: true, descripcion: 'Cancha de futbol 7 para entrenamientos y partidos medianos.' },
    { id: 103, numero: 3, nombre: 'Cancha Futbol 11', idTipo: 3, tipoCanchaId: 3, estado: 'activa', activa: true, descripcion: 'Cancha de futbol 11 reglamentaria para competencias.' }
];

const MOCK_DISP = [
    ...MOCK_CANCHAS.flatMap((cancha, canchaIndex) =>
        DIAS_SEMANA.map((dia, diaIndex) => ({
            id: canchaIndex * 7 + diaIndex + 1,
            idCancha: cancha.id,
            canchaId: cancha.id,
            diaSemana: dia,
            horaInicio: 9,
            horaFin: 23,
            disponible: true,
        }))
    )
];

export function CanchasProvider({ children }) {
    const [canchas, setCanchas] = useState([]);
    const [tiposCanchas, setTiposCanchas] = useState([]);
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const dbCanchas = localStorage.getItem('canchas_db');
            const dbTipos = localStorage.getItem('tipos_canchas_db');
            const dbDisp = localStorage.getItem('disp_db');
            const seedVersion = localStorage.getItem('canchas_seed_version');

            if (seedVersion !== CANCHAS_SEED_VERSION) {
                localStorage.setItem('canchas_db', JSON.stringify(MOCK_CANCHAS));
                localStorage.setItem('tipos_canchas_db', JSON.stringify(MOCK_TIPOS));
                localStorage.setItem('disp_db', JSON.stringify(MOCK_DISP));
                localStorage.setItem('canchas_seed_version', CANCHAS_SEED_VERSION);
                setCanchas(MOCK_CANCHAS);
                setTiposCanchas(MOCK_TIPOS);
                setDisponibilidades(MOCK_DISP);
                return;
            }

            if (dbCanchas) setCanchas(JSON.parse(dbCanchas));
            else { localStorage.setItem('canchas_db', JSON.stringify(MOCK_CANCHAS)); setCanchas(MOCK_CANCHAS); }

            if (dbTipos) setTiposCanchas(JSON.parse(dbTipos));
            else { localStorage.setItem('tipos_canchas_db', JSON.stringify(MOCK_TIPOS)); setTiposCanchas(MOCK_TIPOS); }

            if (dbDisp) {
                const normalizadas = completarDisponibilidadesMock(JSON.parse(dbDisp).map(normalizarDisp));
                localStorage.setItem('disp_db', JSON.stringify(normalizadas));
                setDisponibilidades(normalizadas);
            } else {
                localStorage.setItem('disp_db', JSON.stringify(MOCK_DISP));
                setDisponibilidades(MOCK_DISP);
            }
        } catch (err) {
            setError('Error hidratando canchas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const crearCancha = async (c) => {
        const item = { ...c, id: Date.now(), estado: 'activa', activa: true };
        setCanchas(prev => { const n = [...prev, item]; localStorage.setItem('canchas_db', JSON.stringify(n)); return n; });
    };

    const modificarCancha = async (id, c) => {
        if (typeof id === 'object') {
            c = id;
            id = c.id;
        }
        if (!id) return;
        setCanchas(prev => { const n = prev.map(x => x.id === id ? { ...x, ...c } : x); localStorage.setItem('canchas_db', JSON.stringify(n)); return n; });
    };

    const toggleEstadoCancha = async (id) => {
        if (typeof id === 'object') id = id.id;
        setCanchas(prev => {
            const n = prev.map(x => {
                if (x.id !== id) return x;
                const quedaActiva = x.estado === 'inactiva';
                return { ...x, estado: quedaActiva ? 'activa' : 'inactiva', activa: quedaActiva };
            });
            localStorage.setItem('canchas_db', JSON.stringify(n));
            return n;
        });
    };

    const crearTipo = async (t) => {
        const item = { ...t, id: Date.now() };
        setTiposCanchas(prev => { const n = [...prev, item]; localStorage.setItem('tipos_canchas_db', JSON.stringify(n)); return n; });
    };

    const modificarTipo = async (id, t) => {
        if (typeof id === 'object') {
            t = id;
            id = t.id;
        }
        if (!id) return;
        setTiposCanchas(prev => { const n = prev.map(x => x.id === id ? { ...x, ...t } : x); localStorage.setItem('tipos_canchas_db', JSON.stringify(n)); return n; });
    };

    const eliminarTipo = async (id) => {
        setTiposCanchas(prev => { const n = prev.filter(x => x.id !== id); localStorage.setItem('tipos_canchas_db', JSON.stringify(n)); return n; });
    };

    const actualizarEstadoCanchaPorDisps = (idCancha, listaDisps) => {
        setCanchas(prev => {
            const n = prev.map(c => {
                if (c.id !== Number(idCancha) || c.estado === 'inactiva') return c;
                const tieneBloqueadas = listaDisps.some(d => Number(d.idCancha ?? d.canchaId) === Number(idCancha) && d.disponible === false);
                return { ...c, estado: tieneBloqueadas ? 'mantenimiento' : 'activa', activa: true };
            });
            localStorage.setItem('canchas_db', JSON.stringify(n));
            return n;
        });
    };

    const crearDisp = async (d) => {
        const item = normalizarDisp({ ...d, id: Date.now(), disponible: d.disponible !== false });
        setDisponibilidades(prev => {
            const n = [...prev, item];
            localStorage.setItem('disp_db', JSON.stringify(n));
            actualizarEstadoCanchaPorDisps(item.idCancha, n);
            return n;
        });
    };

    const modificarDisp = async (id, d) => {
        if (typeof id === 'object') {
            d = id;
            id = d.id;
        }
        const item = normalizarDisp({ ...d, id });
        setDisponibilidades(prev => {
            const anterior = prev.find(x => x.id === id);
            const n = prev.map(x => x.id === id ? { ...x, ...item } : x);
            localStorage.setItem('disp_db', JSON.stringify(n));
            actualizarEstadoCanchaPorDisps(item.idCancha, n);
            if (anterior && Number(anterior.idCancha ?? anterior.canchaId) !== item.idCancha) {
                actualizarEstadoCanchaPorDisps(anterior.idCancha ?? anterior.canchaId, n);
            }
            return n;
        });
    };

    const toggleDisp = async (id) => {
        let idCanchaAfectada = null;
        setDisponibilidades(prev => {
            const n = prev.map(x => {
                if (x.id !== id) return x;
                idCanchaAfectada = x.idCancha ?? x.canchaId;
                return { ...x, disponible: !x.disponible };
            });
            localStorage.setItem('disp_db', JSON.stringify(n));
            if (idCanchaAfectada) actualizarEstadoCanchaPorDisps(idCanchaAfectada, n);
            return n;
        });
    };

    const eliminarDisp = async (id) => {
        setDisponibilidades(prev => {
            const anterior = prev.find(x => x.id === id);
            const n = prev.filter(x => x.id !== id);
            localStorage.setItem('disp_db', JSON.stringify(n));
            if (anterior) actualizarEstadoCanchaPorDisps(anterior.idCancha ?? anterior.canchaId, n);
            return n;
        });
    };

    const canchasNormalizadas = canchas.map(c => {
        const tieneBloqueadas = disponibilidades.some(d => Number(d.idCancha ?? d.canchaId) === c.id && d.disponible === false);
        const estado = c.estado === 'inactiva'
            ? 'inactiva'
            : tieneBloqueadas
                ? 'mantenimiento'
                : (c.estado || (c.activa ? 'activa' : 'inactiva'));
        return {
            ...c,
            estado,
            activa: estado !== 'inactiva',
            idTipo: c.idTipo || c.tipoCanchaId,
            tipoCanchaId: c.tipoCanchaId || c.idTipo
        };
    });

    return (
        <CanchasContext.Provider value={{
            canchas: canchasNormalizadas, tiposCanchas, disponibilidades, loading, error, fetchAll,
            crearCancha, modificarCancha, toggleEstadoCancha,
            crearTipo, modificarTipo, eliminarTipo,
            crearDisp, modificarDisp, toggleDisp, eliminarDisp
        }}>
            {children}
        </CanchasContext.Provider>
    );
}

export function useCanchas() { return useContext(CanchasContext); }
