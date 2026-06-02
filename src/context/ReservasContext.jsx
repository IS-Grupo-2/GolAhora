// src/context/ReservasContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const USE_MOCK = true;
const API_URL = import.meta.env.VITE_API_URL;

const ReservasContext = createContext();

const INITIAL_MOCK_DATA = [
    {
        idReserva: 1,
        cliente: { idUsuario: 1, nombre: 'Laura', apellido: 'García' },
        reservador: { id: 1, nombre: 'Laura García', email: 'laura.garcia@example.com', rol: 'cliente' },
        cancha: { idCancha: 101, nombre: 'Cancha Norte', numero: 1 },
        fechaCreacion: '2026-05-20T10:00:00',
        fechaUso: '2026-05-25',
        horaInicio: '18:00',
        horaFin: '19:00',
        duracionMin: 60,
        estado: 'confirmada',
        montoTotal: 15000,
        cobro: { estado: 'pagado', metodo: 'MercadoPago' }
    },
    {
        idReserva: 2,
        cliente: { idUsuario: 2, nombre: 'Martín', apellido: 'Pérez' },
        reservador: { id: 2, nombre: 'Martín Pérez', email: 'martin.perez@example.com', rol: 'cliente' },
        cancha: { idCancha: 102, nombre: 'Cancha Sur', numero: 2 },
        fechaCreacion: '2026-05-21T14:30:00',
        fechaUso: '2026-05-26',
        horaInicio: '20:00',
        horaFin: '21:30',
        duracionMin: 90,
        estado: 'pendiente',
        montoTotal: 12000,
        cobro: { estado: 'pendiente', metodo: null }
    },
    {
        idReserva: 3,
        cliente: { idUsuario: 3, nombre: 'Sofía', apellido: 'López' },
        reservador: { id: 3, nombre: 'Sofía López', email: 'sofia.lopez@example.com', rol: 'cliente' },
        cancha: { idCancha: 101, nombre: 'Cancha Norte', numero: 1 },
        fechaCreacion: '2026-05-22T09:15:00',
        fechaUso: '2026-05-28',
        horaInicio: '17:00',
        horaFin: '18:30',
        duracionMin: 90,
        estado: 'confirmada',
        montoTotal: 18000,
        cobro: { estado: 'pagado', metodo: 'MercadoPago' }
    },
    {
        idReserva: 4,
        cliente: { idUsuario: 4, nombre: 'Diego', apellido: 'Vega' },
        reservador: { id: 4, nombre: 'Diego Vega', email: 'diego.vega@example.com', rol: 'cliente' },
        cancha: { idCancha: 104, nombre: 'Cancha Este', numero: 4 },
        fechaCreacion: '2026-05-22T11:20:00',
        fechaUso: '2026-05-29',
        horaInicio: '19:00',
        horaFin: '20:00',
        duracionMin: 60,
        estado: 'pendiente',
        montoTotal: 13000,
        cobro: { estado: 'pendiente', metodo: null }
    },
    {
        idReserva: 5,
        cliente: { idUsuario: 6, nombre: 'Facundo', apellido: 'Ortiz' },
        reservador: { id: 6, nombre: 'Facundo Ortiz', email: 'facundo.ortiz@example.com', rol: 'cliente' },
        cancha: { idCancha: 105, nombre: 'Cancha Oeste', numero: 5 },
        fechaCreacion: '2026-05-20T16:00:00',
        fechaUso: '2026-05-25',
        horaInicio: '16:00',
        horaFin: '17:00',
        duracionMin: 60,
        estado: 'cancelada',
        montoTotal: 10000,
        cobro: { estado: 'cancelado', metodo: null }
    },
    {
        idReserva: 6,
        cliente: { idUsuario: 1, nombre: 'Laura', apellido: 'García' },
        reservador: { id: 1, nombre: 'Laura García', email: 'laura.garcia@example.com', rol: 'cliente' },
        cancha: { idCancha: 101, nombre: 'Cancha Norte', numero: 1 },
        fechaCreacion: '2026-05-23T08:00:00',
        fechaUso: '2026-05-27',
        horaInicio: '09:00',
        horaFin: '10:30',
        duracionMin: 90,
        estado: 'confirmada',
        montoTotal: 15000,
        cobro: { estado: 'pagado', metodo: 'Efectivo' }
    },
    {
        idReserva: 7,
        cliente: { idUsuario: 2, nombre: 'Martín', apellido: 'Pérez' },
        reservador: { id: 2, nombre: 'Martín Pérez', email: 'martin.perez@example.com', rol: 'cliente' },
        cancha: { idCancha: 102, nombre: 'Cancha Sur', numero: 2 },
        fechaCreacion: '2026-05-24T12:00:00',
        fechaUso: '2026-05-30',
        horaInicio: '21:00',
        horaFin: '22:00',
        duracionMin: 60,
        estado: 'pendiente',
        montoTotal: 14000,
        cobro: { estado: 'pendiente', metodo: null }
    },
    {
        idReserva: 8,
        cliente: { idUsuario: 3, nombre: 'Sofía', apellido: 'López' },
        reservador: { id: 3, nombre: 'Sofía López', email: 'sofia.lopez@example.com', rol: 'cliente' },
        cancha: { idCancha: 104, nombre: 'Cancha Este', numero: 4 },
        fechaCreacion: '2026-05-24T15:30:00',
        fechaUso: '2026-06-01',
        horaInicio: '18:00',
        horaFin: '19:30',
        duracionMin: 90,
        estado: 'confirmada',
        montoTotal: 16000,
        cobro: { estado: 'pagado', metodo: 'MercadoPago' }
    },
    {
        idReserva: 9,
        cliente: { idUsuario: 4, nombre: 'Diego', apellido: 'Vega' },
        reservador: { id: 4, nombre: 'Diego Vega', email: 'diego.vega@example.com', rol: 'cliente' },
        cancha: { idCancha: 105, nombre: 'Cancha Oeste', numero: 5 },
        fechaCreacion: '2026-05-24T17:45:00',
        fechaUso: '2026-06-02',
        horaInicio: '15:00',
        horaFin: '16:00',
        duracionMin: 60,
        estado: 'confirmada',
        montoTotal: 11000,
        cobro: { estado: 'pagado', metodo: 'Transferencia' }
    },
    {
        idReserva: 10,
        cliente: { idUsuario: 6, nombre: 'Facundo', apellido: 'Ortiz' },
        reservador: { id: 6, nombre: 'Facundo Ortiz', email: 'facundo.ortiz@example.com', rol: 'cliente' },
        cancha: { idCancha: 103, nombre: 'Cancha Central', numero: 3 },
        fechaCreacion: '2026-05-25T11:00:00',
        fechaUso: '2026-06-03',
        horaInicio: '20:00',
        horaFin: '22:00',
        duracionMin: 120,
        estado: 'pendiente',
        montoTotal: 25000,
        cobro: { estado: 'pendiente', metodo: null }
    },
    {
        idReserva: 11,
        cliente: { idUsuario: 1, nombre: 'Laura', apellido: 'García' },
        reservador: { id: 1, nombre: 'Laura García', email: 'laura.garcia@example.com', rol: 'cliente' },
        cancha: { idCancha: 102, nombre: 'Cancha Sur', numero: 2 },
        fechaCreacion: '2026-05-25T13:20:00',
        fechaUso: '2026-06-04',
        horaInicio: '19:00',
        horaFin: '20:30',
        duracionMin: 90,
        estado: 'cancelada',
        montoTotal: 15000,
        cobro: { estado: 'cancelado', metodo: null }
    },
    {
        idReserva: 12,
        cliente: { idUsuario: 2, nombre: 'Martín', apellido: 'Pérez' },
        reservador: { id: 2, nombre: 'Martín Pérez', email: 'martin.perez@example.com', rol: 'cliente' },
        cancha: { idCancha: 101, nombre: 'Cancha Norte', numero: 1 },
        fechaCreacion: '2026-05-25T14:10:00',
        fechaUso: '2026-06-05',
        horaInicio: '10:00',
        horaFin: '11:30',
        duracionMin: 90,
        estado: 'confirmada',
        montoTotal: 13500,
        cobro: { estado: 'pagado', metodo: 'MercadoPago' }
    }
];

export function ReservasProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setItems(prev => prev.length === 0 ? INITIAL_MOCK_DATA : prev);
            } else {
                const response = await fetch(`${API_URL}/reservas`);
                if (!response.ok) throw new Error('Error al obtener el listado de reservas');
                const data = await response.json();
                setItems(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const crearItem = useCallback(async (nuevaReserva) => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                const itemCreado = { 
                    ...nuevaReserva, 
                    idReserva: Date.now(), 
                    fechaCreacion: new Date().toISOString() 
                };
                setItems(prev => [itemCreado, ...prev]);
                return itemCreado;
            } else {
                const response = await fetch(`${API_URL}/reservas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaReserva)
                });
                if (!response.ok) throw new Error('Error al registrar la reserva');
                const data = await response.json();
                setItems(prev => [data, ...prev]);
                return data;
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const modificarItem = useCallback(async (id, reservaActualizada) => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                setItems(prev => prev.map(item => item.idReserva === id ? { ...item, ...reservaActualizada } : item));
            } else {
                const response = await fetch(`${API_URL}/reservas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservaActualizada)
                });
                if (!response.ok) throw new Error('Error al modificar la reserva');
                const data = await response.json();
                setItems(prev => prev.map(item => item.idReserva === id ? data : item));
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const eliminarItem = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                setItems(prev => prev.filter(item => item.idReserva !== id));
            } else {
                const response = await fetch(`${API_URL}/reservas/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error al eliminar la reserva');
                setItems(prev => prev.filter(item => item.idReserva !== id));
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // RF24 - Confirmar Reserva (Valida pago y confirma)
    const confirmarReserva = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                setItems(prev => prev.map(item => 
                    item.idReserva === id 
                        ? { ...item, estado: 'confirmada', cobro: { ...item.cobro, estado: 'pagado', metodo: item.cobro?.metodo || 'MercadoPago' } } 
                        : item
                ));
            } else {
                const response = await fetch(`${API_URL}/reservas/${id}/confirmar`, { method: 'POST' });
                if (!response.ok) throw new Error('Error al confirmar la reserva');
                const data = await response.json();
                setItems(prev => prev.map(item => item.idReserva === id ? data : item));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // RF25 y RF26 - Cancelar Reserva (Modifica el estado y evalúa plazos)
    const cancelarReserva = useCallback(async (id, fueraDePlazo) => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                setItems(prev => prev.map(item => 
                    item.idReserva === id 
                        ? { 
                            ...item, 
                            estado: 'cancelada', 
                            cobro: { ...item.cobro, estado: fueraDePlazo ? 'recargo' : 'cancelado' } 
                          } 
                        : item
                ));
            } else {
                const response = await fetch(`${API_URL}/reservas/${id}/cancelar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fueraDePlazo })
                });
                if (!response.ok) throw new Error('Error al cancelar la reserva');
                const data = await response.json();
                setItems(prev => prev.map(item => item.idReserva === id ? data : item));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <ReservasContext.Provider value={{
            items,
            reservas: items, // Alias para compatibilidad con vistas e instrucciones
            loading,
            error,
            fetchItems,
            fetchReservas: fetchItems,
            crearItem,
            crearReserva: crearItem,
            modificarItem,
            modificarReserva: modificarItem,
            eliminarItem,
            eliminarReserva: eliminarItem,
            confirmarReserva,
            cancelarReserva
        }}>
            {children}
        </ReservasContext.Provider>
    );
}

export function useReservas() {
    const context = useContext(ReservasContext);
    if (!context) throw new Error('useReservas debe ser utilizado dentro de ReservasProvider');
    return context;
}