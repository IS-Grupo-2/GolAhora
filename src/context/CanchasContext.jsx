// src/context/CanchasContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CanchasContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK = true;

const MOCK_TIPOS = [
    { id: 1, nombre: 'Fútbol 5', superficie: 'Césped sintético', capacidadJugadores: 10, duracionMaxReservaMin: 60, precioHora: 15000, descripcion: 'Cancha pequeña ideal para grupos reducidos.' },
    { id: 2, nombre: 'Fútbol 7', superficie: 'Césped natural', capacidadJugadores: 14, duracionMaxReservaMin: 90, precioHora: 22000, descripcion: 'Formato intermedio, muy popular en torneos.' },
    { id: 3, nombre: 'Fútbol 11', superficie: 'Tierra', capacidadJugadores: 22, duracionMaxReservaMin: 120, precioHora: 35000, descripcion: 'Cancha reglamentaria para partidos completos.' },
    { id: 4, nombre: 'Paddle', superficie: 'Cristal y césped', capacidadJugadores: 4, duracionMaxReservaMin: 60, precioHora: 12000, descripcion: 'Canchas de paddle cubiertas y ventiladas.' },
];

const MOCK_CANCHAS = [
    { id: 1, numero: 1, nombre: 'Cancha 1', idTipo: 1, estado: 'activa', descripcion: 'Ubicada en sector norte, iluminación LED.' },
    { id: 2, numero: 2, nombre: 'Cancha 2', idTipo: 1, estado: 'activa', descripcion: 'Sector sur, vestuarios propios.' },
    { id: 3, numero: 3, nombre: 'Cancha 3', idTipo: 2, estado: 'activa', descripcion: 'Vista panorámica, ideal para torneos.' },
    { id: 4, numero: 4, nombre: 'Cancha 4', idTipo: 2, estado: 'inactiva', descripcion: 'En mantenimiento por renovación de césped.' },
    { id: 5, numero: 5, nombre: 'Cancha 5', idTipo: 3, estado: 'activa', descripcion: 'La más grande del complejo.' },
    { id: 6, numero: 6, nombre: 'Cancha 6', idTipo: 4, estado: 'activa', descripcion: 'Paddle cubierta, techada y climatizada.' },
];

const MOCK_DISP = [
    { id: 1, idCancha: 1, diaSemana: 'Lunes', horaInicio: 8, horaFin: 23, disponible: true },
    { id: 2, idCancha: 1, diaSemana: 'Martes', horaInicio: 8, horaFin: 23, disponible: true },
    { id: 3, idCancha: 1, diaSemana: 'Miércoles', horaInicio: 8, horaFin: 23, disponible: true },
    { id: 6, idCancha: 1, diaSemana: 'Sábado', horaInicio: 9, horaFin: 22, disponible: true },
    { id: 7, idCancha: 1, diaSemana: 'Domingo', horaInicio: 10, horaFin: 20, disponible: false },
    { id: 8, idCancha: 2, diaSemana: 'Lunes', horaInicio: 8, horaFin: 22, disponible: true },
];

export function CanchasProvider({ children }) {
    const [canchas, setCanchas] = useState([]);
    const [tiposCanchas, setTiposCanchas] = useState([]);
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setCanchas(prev => prev.length === 0 ? MOCK_CANCHAS : prev);
                setTiposCanchas(MOCK_TIPOS);
                setDisponibilidades(MOCK_DISP);
            } else {
                // Fetch real en paralelo cuando el backend esté listo
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── CRUD Canchas ──
    const crearCancha = async (datos) => {
        if (USE_MOCK) setCanchas(prev => [...prev, { ...datos, id: Date.now(), estado: 'activa' }]);
    };
    const modificarCancha = async (datos) => {
        if (USE_MOCK) setCanchas(prev => prev.map(c => c.id === datos.id ? { ...c, ...datos } : c));
    };
    const toggleEstadoCancha = async (cancha) => {
        if (USE_MOCK) {
            const esActiva = cancha.estado === 'activa';
            setCanchas(prev => prev.map(c => c.id === cancha.id ? { ...c, estado: esActiva ? 'inactiva' : 'activa' } : c));
            if (esActiva) setDisponibilidades(prev => prev.map(d => d.idCancha === cancha.id ? { ...d, disponible: false } : d));
        }
    };

    // ── CRUD Tipos ──
    const crearTipo = async (datos) => {
        if (USE_MOCK) setTiposCanchas(prev => [...prev, { ...datos, id: Date.now() }]);
    };
    const modificarTipo = async (datos) => {
        if (USE_MOCK) setTiposCanchas(prev => prev.map(t => t.id === datos.id ? { ...t, ...datos } : t));
    };
    const eliminarTipo = async (id) => {
        if (USE_MOCK) setTiposCanchas(prev => prev.filter(t => t.id !== id));
    };

    // ── CRUD Disponibilidad ──
    const crearDisp = async (datos) => {
        if (USE_MOCK) setDisponibilidades(prev => [...prev, { ...datos, id: Date.now() }]);
    };
    const modificarDisp = async (datos) => {
        if (USE_MOCK) setDisponibilidades(prev => prev.map(d => d.id === datos.id ? { ...d, ...datos } : d));
    };
    const toggleDisp = async (id) => {
        if (USE_MOCK) setDisponibilidades(prev => prev.map(d => d.id === id ? { ...d, disponible: !d.disponible } : d));
    };
    const eliminarDisp = async (id) => {
        if (USE_MOCK) setDisponibilidades(prev => prev.filter(d => d.id !== id));
    };

    return (
        <CanchasContext.Provider value={{
            canchas, tiposCanchas, disponibilidades, loading, error, fetchAll,
            crearCancha, modificarCancha, toggleEstadoCancha,
            crearTipo, modificarTipo, eliminarTipo,
            crearDisp, modificarDisp, toggleDisp, eliminarDisp
        }}>
            {children}
        </CanchasContext.Provider>
    );
}

export function useCanchas() {
    return useContext(CanchasContext);
}