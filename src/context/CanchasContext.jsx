import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CanchasContext = createContext();

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const normalizarDia = (dia) => {
    if (typeof dia === 'number') return DIAS_SEMANA[dia - 1] || DIAS_SEMANA[0];
    return String(dia || '')
        .replace('MiÃ©rcoles', 'Miércoles')
        .replace('Miercoles', 'Miércoles')
        .replace('SÃ¡bado', 'Sábado')
        .replace('Sabado', 'Sábado');
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
    { id: 1, nombre: 'Fútbol 5', superficie: 'Césped sintético', capacidadJugadores: 10, duracionMaxReservaMin: 60, precioHora: 15000, descripcion: 'Cancha pequeña ideal para grupos reducidos.' },
    { id: 2, nombre: 'Fútbol 7', superficie: 'Césped natural', capacidadJugadores: 14, duracionMaxReservaMin: 90, precioHora: 22000, descripcion: 'Formato intermedio, muy popular en torneos.' }
];

const MOCK_CANCHAS = [
    { id: 101, numero: 1, nombre: 'Cancha Norte', idTipo: 1, estado: 'activa', activa: true, descripcion: 'Techada y con iluminación LED profesional.' },
    { id: 102, numero: 2, nombre: 'Cancha Sur', idTipo: 1, estado: 'activa', activa: true, descripcion: 'Descubierta, excelente drenaje.' },
    { id: 103, numero: 3, nombre: 'Cancha Central', idTipo: 2, estado: 'activa', activa: true, descripcion: 'Cancha de fútbol 7 profesional.' },
    { id: 104, numero: 4, nombre: 'Cancha Este', idTipo: 2, estado: 'activa', activa: true, descripcion: 'Cancha de fútbol 7 alternativa.' },
    { id: 105, numero: 5, nombre: 'Cancha Oeste', idTipo: 1, estado: 'activa', activa: true, descripcion: 'Cancha de fútbol 5 alternativa.' }
];

const MOCK_DISP = [
    { id: 1, idCancha: 101, canchaId: 101, diaSemana: 'Lunes', horaInicio: 9, horaFin: 23, disponible: true },
    { id: 2, idCancha: 101, canchaId: 101, diaSemana: 'Martes', horaInicio: 9, horaFin: 23, disponible: true },
    { id: 3, idCancha: 101, canchaId: 101, diaSemana: 'Miércoles', horaInicio: 9, horaFin: 23, disponible: true },
    { id: 4, idCancha: 101, canchaId: 101, diaSemana: 'Jueves', horaInicio: 9, horaFin: 23, disponible: true },
    { id: 5, idCancha: 101, canchaId: 101, diaSemana: 'Viernes', horaInicio: 9, horaFin: 23, disponible: true },
    { id: 6, idCancha: 101, canchaId: 101, diaSemana: 'Sábado', horaInicio: 10, horaFin: 22, disponible: true },
    { id: 7, idCancha: 101, canchaId: 101, diaSemana: 'Domingo', horaInicio: 10, horaFin: 20, disponible: false },
    { id: 8, idCancha: 102, canchaId: 102, diaSemana: 'Lunes', horaInicio: 9, horaFin: 23, disponible: true },
    { id: 9, idCancha: 102, canchaId: 102, diaSemana: 'Martes', horaInicio: 9, horaFin: 23, disponible: true },
    { id: 10, idCancha: 102, canchaId: 102, diaSemana: 'Miércoles', horaInicio: 9, horaFin: 23, disponible: true },
    { id: 11, idCancha: 103, canchaId: 103, diaSemana: 'Lunes', horaInicio: 9, horaFin: 22, disponible: true },
    { id: 12, idCancha: 103, canchaId: 103, diaSemana: 'Jueves', horaInicio: 9, horaFin: 22, disponible: true }
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

    // Métodos Canchas
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

    // Métodos Tipos
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

    // Métodos Disponibilidades
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
