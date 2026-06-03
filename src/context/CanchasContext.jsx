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
                const [canchasRes, tiposRes, dispRes] = await Promise.all([
                    fetch(`${API_URL}/canchas`),
                    fetch(`${API_URL}/tipos-canchas`),
                    fetch(`${API_URL}/disponibilidades`),
                ]);
                if (!canchasRes.ok) throw new Error('Error al obtener canchas');
                if (!tiposRes.ok) throw new Error('Error al obtener tipos de canchas');
                if (!dispRes.ok) throw new Error('Error al obtener disponibilidades');
                const [canchasData, tiposData, dispData] = await Promise.all([
                    canchasRes.json(),
                    tiposRes.json(),
                    dispRes.json(),
                ]);
                setCanchas(canchasData);
                setTiposCanchas(tiposData);
                setDisponibilidades(dispData);
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
        if (USE_MOCK) {
            setCanchas(prev => [...prev, { ...datos, id: Date.now(), estado: 'activa' }]);
        } else {
            const response = await fetch(`${API_URL}/canchas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!response.ok) throw new Error('Error al crear la cancha');
            const nuevaCancha = await response.json();
            setCanchas(prev => [...prev, nuevaCancha]);
        }
    };

    const modificarCancha = async (datos) => {
        if (USE_MOCK) {
            setCanchas(prev => prev.map(c => c.id === datos.id ? { ...c, ...datos } : c));
        } else {
            const response = await fetch(`${API_URL}/canchas/${datos.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!response.ok) throw new Error('Error al modificar la cancha');
            const canchaActualizada = await response.json();
            setCanchas(prev => prev.map(c => c.id === canchaActualizada.id ? canchaActualizada : c));
        }
    };

    const toggleEstadoCancha = async (cancha) => {
        if (USE_MOCK) {
            const esActiva = cancha.estado === 'activa';
            setCanchas(prev => prev.map(c => c.id === cancha.id ? { ...c, estado: esActiva ? 'inactiva' : 'activa' } : c));
            if (esActiva) setDisponibilidades(prev => prev.map(d => d.idCancha === cancha.id ? { ...d, disponible: false } : d));
        } else {
            const nuevoEstado = cancha.estado === 'activa' ? 'inactiva' : 'activa';
            const response = await fetch(`${API_URL}/canchas/${cancha.id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado }),
            });
            if (!response.ok) throw new Error('Error al cambiar el estado de la cancha');
            const canchaActualizada = await response.json();
            setCanchas(prev => prev.map(c => c.id === canchaActualizada.id ? canchaActualizada : c));
            // Si se desactiva la cancha, reflejamos el cambio en disponibilidades
            if (nuevoEstado === 'inactiva') {
                setDisponibilidades(prev => prev.map(d => d.idCancha === cancha.id ? { ...d, disponible: false } : d));
            }
        }
    };

    // ── CRUD Tipos ──
    const crearTipo = async (datos) => {
        if (USE_MOCK) {
            setTiposCanchas(prev => [...prev, { ...datos, id: Date.now() }]);
        } else {
            const response = await fetch(`${API_URL}/tipos-canchas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!response.ok) throw new Error('Error al crear el tipo de cancha');
            const nuevoTipo = await response.json();
            setTiposCanchas(prev => [...prev, nuevoTipo]);
        }
    };

    const modificarTipo = async (datos) => {
        if (USE_MOCK) {
            setTiposCanchas(prev => prev.map(t => t.id === datos.id ? { ...t, ...datos } : t));
        } else {
            const response = await fetch(`${API_URL}/tipos-canchas/${datos.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!response.ok) throw new Error('Error al modificar el tipo de cancha');
            const tipoActualizado = await response.json();
            setTiposCanchas(prev => prev.map(t => t.id === tipoActualizado.id ? tipoActualizado : t));
        }
    };

    const eliminarTipo = async (id) => {
        if (USE_MOCK) {
            setTiposCanchas(prev => prev.filter(t => t.id !== id));
        } else {
            const response = await fetch(`${API_URL}/tipos-canchas/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar el tipo de cancha');
            setTiposCanchas(prev => prev.filter(t => t.id !== id));
        }
    };

    // ── CRUD Disponibilidad ──
    const crearDisp = async (datos) => {
        if (USE_MOCK) {
            setDisponibilidades(prev => [...prev, { ...datos, id: Date.now() }]);
        } else {
            const response = await fetch(`${API_URL}/disponibilidades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!response.ok) throw new Error('Error al crear la disponibilidad');
            const nuevaDisp = await response.json();
            setDisponibilidades(prev => [...prev, nuevaDisp]);
        }
    };

    const modificarDisp = async (datos) => {
        if (USE_MOCK) {
            setDisponibilidades(prev => prev.map(d => d.id === datos.id ? { ...d, ...datos } : d));
        } else {
            const response = await fetch(`${API_URL}/disponibilidades/${datos.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!response.ok) throw new Error('Error al modificar la disponibilidad');
            const dispActualizada = await response.json();
            setDisponibilidades(prev => prev.map(d => d.id === dispActualizada.id ? dispActualizada : d));
        }
    };

    const toggleDisp = async (id) => {
        if (USE_MOCK) {
            setDisponibilidades(prev => prev.map(d => d.id === id ? { ...d, disponible: !d.disponible } : d));
        } else {
            const response = await fetch(`${API_URL}/disponibilidades/${id}/toggle`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error('Error al cambiar la disponibilidad');
            const dispActualizada = await response.json();
            setDisponibilidades(prev => prev.map(d => d.id === dispActualizada.id ? dispActualizada : d));
        }
    };

    const eliminarDisp = async (id) => {
        if (USE_MOCK) {
            setDisponibilidades(prev => prev.filter(d => d.id !== id));
        } else {
            const response = await fetch(`${API_URL}/disponibilidades/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar la disponibilidad');
            setDisponibilidades(prev => prev.filter(d => d.id !== id));
        }
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