import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CanchasContext = createContext();

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
    { id: 1, canchaId: 101, diaSemana: 1, horaInicio: '18:00', horaFin: '23:00', disponible: true },
    { id: 2, canchaId: 102, diaSemana: 2, horaInicio: '19:00', horaFin: '22:00', disponible: true }
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

            if (dbDisp) setDisponibilidades(JSON.parse(dbDisp));
            else { localStorage.setItem('disp_db', JSON.stringify(MOCK_DISP)); setDisponibilidades(MOCK_DISP); }

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
        setCanchas(prev => { const n = prev.map(x => x.id === id ? { ...x, ...c } : x); localStorage.setItem('canchas_db', JSON.stringify(n)); return n; });
    };
    const toggleEstadoCancha = async (id) => {
        setCanchas(prev => { const n = prev.map(x => x.id === id ? { ...x, estado: x.estado === 'activa' ? 'inactiva' : 'activa', activa: !x.activa } : x); localStorage.setItem('canchas_db', JSON.stringify(n)); return n; });
    };

    // Métodos Tipos
    const crearTipo = async (t) => {
        const item = { ...t, id: Date.now() };
        setTiposCanchas(prev => { const n = [...prev, item]; localStorage.setItem('tipos_canchas_db', JSON.stringify(n)); return n; });
    };
    const modificarTipo = async (id, t) => {
        setTiposCanchas(prev => { const n = prev.map(x => x.id === id ? { ...x, ...t } : x); localStorage.setItem('tipos_canchas_db', JSON.stringify(n)); return n; });
    };
    const eliminarTipo = async (id) => {
        setTiposCanchas(prev => { const n = prev.filter(x => x.id !== id); localStorage.setItem('tipos_canchas_db', JSON.stringify(n)); return n; });
    };

    // Métodos Disponibilidades
    const crearDisp = async (d) => {
        const item = { ...d, id: Date.now(), disponible: true };
        setDisponibilidades(prev => { const n = [...prev, item]; localStorage.setItem('disp_db', JSON.stringify(n)); return n; });
    };
    const modificarDisp = async (id, d) => {
        setDisponibilidades(prev => { const n = prev.map(x => x.id === id ? { ...x, ...d } : x); localStorage.setItem('disp_db', JSON.stringify(n)); return n; });
    };
    const toggleDisp = async (id) => {
        setDisponibilidades(prev => { const n = prev.map(x => x.id === id ? { ...x, disponible: !x.disponible } : x); localStorage.setItem('disp_db', JSON.stringify(n)); return n; });
    };
    const eliminarDisp = async (id) => {
        setDisponibilidades(prev => { const n = prev.filter(x => x.id !== id); localStorage.setItem('disp_db', JSON.stringify(n)); return n; });
    };

    const canchasNormalizadas = canchas.map(c => ({...c,

    estado: c.estado || (c.activa ? 'activa' : 'inactiva'),
    activa: typeof c.activa === 'boolean' ? c.activa : c.estado === 'activa',
    
    idTipo: c.idTipo || c.tipoCanchaId,
    tipoCanchaId: c.tipoCanchaId || c.idTipo
}));

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