import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = true;
const CobrosContext = createContext();

const MOCK_COBROS = [
    // Reserva 1 - Laura - Pagado
    {
        idCobro: 1001,
        idReserva: 1,
        cliente: {
            idUsuario: 1,
            nombre: 'Laura',
            apellido: 'García',
            dni: '33788901',
        },
        concepto: 'Reserva Cancha Norte - 2026-05-25',
        tipoCobro: 'Reserva Cancha',
        monto: 15000,
        descuento: null,
        montoFinal: 15000,
        fecha: '2026-05-22',
        estado: 'pagado',
        metodo: 'MercadoPago',
    },
    // Reserva 2 - Martín - Pendiente
    {
        idCobro: 1002,
        idReserva: 2,
        cliente: {
            idUsuario: 2,
            nombre: 'Martín',
            apellido: 'Pérez',
            dni: '28455903',
        },
        concepto: 'Reserva Cancha Sur - 2026-05-26',
        tipoCobro: 'Reserva Cancha',
        monto: 12000,
        descuento: null,
        montoFinal: 12000,
        fecha: '2026-05-21',
        estado: 'pendiente',
        metodo: null,
    },
    // Reserva 3 - Sofía - Pagado
    {
        idCobro: 1003,
        idReserva: 3,
        cliente: {
            idUsuario: 3,
            nombre: 'Sofía',
            apellido: 'López',
            dni: '40122345',
        },
        concepto: 'Reserva Cancha Norte - 2026-05-28',
        tipoCobro: 'Reserva Cancha',
        monto: 18000,
        descuento: null,
        montoFinal: 18000,
        fecha: '2026-05-22',
        estado: 'pagado',
        metodo: 'MercadoPago',
    },
    // Reserva 4 - Diego - Pendiente
    {
        idCobro: 1004,
        idReserva: 4,
        cliente: {
            idUsuario: 4,
            nombre: 'Diego',
            apellido: 'Vega',
            dni: '29500782',
        },
        concepto: 'Reserva Cancha Este - 2026-05-29',
        tipoCobro: 'Reserva Cancha',
        monto: 13000,
        descuento: null,
        montoFinal: 13000,
        fecha: '2026-05-22',
        estado: 'pendiente',
        metodo: null,
    },
    // Reserva 5 - Facundo - Cancelado
    {
        idCobro: 1005,
        idReserva: 5,
        cliente: {
            idUsuario: 6,
            nombre: 'Facundo',
            apellido: 'Ortiz',
            dni: '37890012',
        },
        concepto: 'Reserva Cancha Oeste - 2026-05-25',
        tipoCobro: 'Reserva Cancha',
        monto: 10000,
        descuento: null,
        montoFinal: 10000,
        fecha: '2026-05-20',
        estado: 'cancelado',
        metodo: null,
    },
    // Reserva 6 - Laura - Pagado (Efectivo)
    {
        idCobro: 1006,
        idReserva: 6,
        cliente: {
            idUsuario: 1,
            nombre: 'Laura',
            apellido: 'García',
            dni: '33788901',
        },
        concepto: 'Reserva Cancha Norte - 2026-05-27',
        tipoCobro: 'Reserva Cancha',
        monto: 15000,
        descuento: null,
        montoFinal: 15000,
        fecha: '2026-05-23',
        estado: 'pagado',
        metodo: 'Efectivo',
    },
    // Reserva 7 - Martín - Pendiente
    {
        idCobro: 1007,
        idReserva: 7,
        cliente: {
            idUsuario: 2,
            nombre: 'Martín',
            apellido: 'Pérez',
            dni: '28455903',
        },
        concepto: 'Reserva Cancha Sur - 2026-05-30',
        tipoCobro: 'Reserva Cancha',
        monto: 14000,
        descuento: null,
        montoFinal: 14000,
        fecha: '2026-05-24',
        estado: 'pendiente',
        metodo: null,
    },
    // Reserva 8 - Sofía - Pagado
    {
        idCobro: 1008,
        idReserva: 8,
        cliente: {
            idUsuario: 3,
            nombre: 'Sofía',
            apellido: 'López',
            dni: '40122345',
        },
        concepto: 'Reserva Cancha Este - 2026-06-01',
        tipoCobro: 'Reserva Cancha',
        monto: 16000,
        descuento: null,
        montoFinal: 16000,
        fecha: '2026-05-24',
        estado: 'pagado',
        metodo: 'MercadoPago',
    },
    // Reserva 9 - Diego - Pagado (Transferencia)
    {
        idCobro: 1009,
        idReserva: 9,
        cliente: {
            idUsuario: 4,
            nombre: 'Diego',
            apellido: 'Vega',
            dni: '29500782',
        },
        concepto: 'Reserva Cancha Oeste - 2026-06-02',
        tipoCobro: 'Reserva Cancha',
        monto: 11000,
        descuento: null,
        montoFinal: 11000,
        fecha: '2026-05-24',
        estado: 'pagado',
        metodo: 'Transferencia',
    },
    // Reserva 10 - Facundo - Pendiente
    {
        idCobro: 1010,
        idReserva: 10,
        cliente: {
            idUsuario: 6,
            nombre: 'Facundo',
            apellido: 'Ortiz',
            dni: '37890012',
        },
        concepto: 'Reserva Cancha Central - 2026-06-03',
        tipoCobro: 'Reserva Cancha',
        monto: 25000,
        descuento: null,
        montoFinal: 25000,
        fecha: '2026-05-25',
        estado: 'pendiente',
        metodo: null,
    },
    // Reserva 11 - Laura - Cancelado
    {
        idCobro: 1011,
        idReserva: 11,
        cliente: {
            idUsuario: 1,
            nombre: 'Laura',
            apellido: 'García',
            dni: '33788901',
        },
        concepto: 'Reserva Cancha Sur - 2026-06-04',
        tipoCobro: 'Reserva Cancha',
        monto: 15000,
        descuento: null,
        montoFinal: 15000,
        fecha: '2026-05-25',
        estado: 'cancelado',
        metodo: null,
    },
    // Reserva 12 - Martín - Pagado
    {
        idCobro: 1012,
        idReserva: 12,
        cliente: {
            idUsuario: 2,
            nombre: 'Martín',
            apellido: 'Pérez',
            dni: '28455903',
        },
        concepto: 'Reserva Cancha Norte - 2026-06-05',
        tipoCobro: 'Reserva Cancha',
        monto: 13500,
        descuento: null,
        montoFinal: 13500,
        fecha: '2026-05-25',
        estado: 'pagado',
        metodo: 'MercadoPago',
    },
    // Cobro adicional no vinculado: Cuota Escuelita Mayo
    {
        idCobro: 2001,
        idReserva: null,
        cliente: {
            idUsuario: 2,
            nombre: 'Martín',
            apellido: 'Pérez',
            dni: '28455903',
        },
        concepto: 'Cuota Escuelita Mayo',
        tipoCobro: 'Clase/Entrenamiento',
        monto: 20000,
        descuento: { nombre: 'Socio Activo', porcentaje: 15 },
        montoFinal: 17000,
        fecha: '2026-05-20',
        estado: 'anulado',
        metodo: null,
    },
];

export function CobrosProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setItems(prev => prev.length === 0 ? MOCK_COBROS : prev);
            } else {
                const res = await fetch(`${API_URL}/cobros`);
                if (!res.ok) throw new Error('Error al cargar cobros');
                const data = await res.json();
                setItems(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const crearItem = async (nuevo) => {
        if (USE_MOCK) {
            const nuevoConId = { ...nuevo, idCobro: Date.now() };
            setItems(prev => [nuevoConId, ...prev]);
            return nuevoConId;
        }
        const res = await fetch(`${API_URL}/cobros`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevo),
        });
        if (!res.ok) throw new Error('Error al registrar el cobro');
        const data = await res.json();
        setItems(prev => [data, ...prev]);
        return data;
    };

    const modificarItem = async (modificado) => {
        if (USE_MOCK) {
            setItems(prev => prev.map(item =>
                item.idCobro === modificado.idCobro ? { ...item, ...modificado } : item
            ));
            return modificado;
        }
        const res = await fetch(`${API_URL}/cobros/${modificado.idCobro}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modificado),
        });
        if (!res.ok) throw new Error('Error al modificar el cobro');
        const data = await res.json();
        setItems(prev => prev.map(item => item.idCobro === data.idCobro ? data : item));
        return data;
    };

    const eliminarItem = async (id) => {
        if (USE_MOCK) {
            setItems(prev => prev.filter(item => item.idCobro !== id));
            return;
        }
        const res = await fetch(`${API_URL}/cobros/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar (o anular) el cobro');
        setItems(prev => prev.filter(item => item.idCobro !== id));
    };

    return (
        <CobrosContext.Provider value={{ items, loading, error, fetchItems, crearItem, modificarItem, eliminarItem }}>
            {children}
        </CobrosContext.Provider>
    );
}

export const useCobros = () => useContext(CobrosContext);