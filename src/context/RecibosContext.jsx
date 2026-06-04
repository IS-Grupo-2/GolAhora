import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = true;

const MOCK_RECIBOS = [
    // Recibo para Cobro 1001 - Laura - Reserva Cancha Norte
    {
        idRecibo: 1,
        nroRecibo: '0001-00000001',
        cobro: {
            idCobro: 1001,
            concepto: 'Reserva Cancha Norte - 2026-05-25',
            montoFinal: 15000,
        },
        cliente: {
            idUsuario: 1,
            nombre: 'Laura',
            apellido: 'García',
            dni: '33788901',
        },
        pago: {
            metodoPago: 'MercadoPago',
            nroTransaccion: 'MP-001-2026',
            fechaPago: '2026-05-22',
            estado: 'Completado',
        },
        fecha: '2026-05-22',
        total: 15000,
        detalles: 'Pago por reserva de cancha. Abonado OK.',
        estado: 'emitido',
    },
    // Recibo para Cobro 1003 - Sofía - Reserva Cancha Norte
    {
        idRecibo: 2,
        nroRecibo: '0001-00000002',
        cobro: {
            idCobro: 1003,
            concepto: 'Reserva Cancha Norte - 2026-05-28',
            montoFinal: 18000,
        },
        cliente: {
            idUsuario: 3,
            nombre: 'Sofía',
            apellido: 'López',
            dni: '40122345',
        },
        pago: {
            metodoPago: 'MercadoPago',
            nroTransaccion: 'MP-002-2026',
            fechaPago: '2026-05-22',
            estado: 'Completado',
        },
        fecha: '2026-05-22',
        total: 18000,
        detalles: 'Pago por reserva de cancha. Abonado OK.',
        estado: 'emitido',
    },
    // Recibo para Cobro 1006 - Laura - Reserva Cancha Norte (Efectivo)
    {
        idRecibo: 3,
        nroRecibo: '0001-00000003',
        cobro: {
            idCobro: 1006,
            concepto: 'Reserva Cancha Norte - 2026-05-27',
            montoFinal: 15000,
        },
        cliente: {
            idUsuario: 1,
            nombre: 'Laura',
            apellido: 'García',
            dni: '33788901',
        },
        pago: {
            metodoPago: 'Efectivo',
            nroTransaccion: 'EFE-001-2026',
            fechaPago: '2026-05-23',
            estado: 'Completado',
        },
        fecha: '2026-05-23',
        total: 15000,
        detalles: 'Pago por reserva de cancha en efectivo. Abonado OK.',
        estado: 'emitido',
    },
    // Recibo para Cobro 1008 - Sofía - Reserva Cancha Este
    {
        idRecibo: 4,
        nroRecibo: '0001-00000004',
        cobro: {
            idCobro: 1008,
            concepto: 'Reserva Cancha Este - 2026-06-01',
            montoFinal: 16000,
        },
        cliente: {
            idUsuario: 3,
            nombre: 'Sofía',
            apellido: 'López',
            dni: '40122345',
        },
        pago: {
            metodoPago: 'MercadoPago',
            nroTransaccion: 'MP-003-2026',
            fechaPago: '2026-05-24',
            estado: 'Completado',
        },
        fecha: '2026-05-24',
        total: 16000,
        detalles: 'Pago por reserva de cancha. Abonado OK.',
        estado: 'emitido',
    },
    // Recibo para Cobro 1009 - Diego - Reserva Cancha Oeste (Transferencia)
    {
        idRecibo: 5,
        nroRecibo: '0001-00000005',
        cobro: {
            idCobro: 1009,
            concepto: 'Reserva Cancha Oeste - 2026-06-02',
            montoFinal: 11000,
        },
        cliente: {
            idUsuario: 4,
            nombre: 'Diego',
            apellido: 'Vega',
            dni: '29500782',
        },
        pago: {
            metodoPago: 'Transferencia',
            nroTransaccion: 'TRF-001-2026',
            fechaPago: '2026-05-24',
            estado: 'Completado',
        },
        fecha: '2026-05-24',
        total: 11000,
        detalles: 'Pago por reserva de cancha mediante transferencia bancaria. Abonado OK.',
        estado: 'emitido',
    },
    // Recibo para Cobro 1012 - Martín - Reserva Cancha Norte
    {
        idRecibo: 6,
        nroRecibo: '0001-00000006',
        cobro: {
            idCobro: 1012,
            concepto: 'Reserva Cancha Norte - 2026-06-05',
            montoFinal: 13500,
        },
        cliente: {
            idUsuario: 2,
            nombre: 'Martín',
            apellido: 'Pérez',
            dni: '28455903',
        },
        pago: {
            metodoPago: 'MercadoPago',
            nroTransaccion: 'MP-004-2026',
            fechaPago: '2026-05-25',
            estado: 'Completado',
        },
        fecha: '2026-05-25',
        total: 13500,
        detalles: 'Pago por reserva de cancha. Abonado OK.',
        estado: 'emitido',
    },
];

const RecibosContext = createContext();

export function RecibosProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setItems(prev => prev.length === 0 ? MOCK_RECIBOS : prev);
            } else {
                const res = await fetch(`${API_URL}/recibos`);
                if (!res.ok) throw new Error('Error al cargar recibos');
                setItems(await res.json());
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
            const nuevoConId = { ...nuevo, idRecibo: Date.now() };
            setItems(prev => [nuevoConId, ...prev]);
            return nuevoConId;
        }
        const res = await fetch(`${API_URL}/recibos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevo),
        });
        if (!res.ok) throw new Error('Error al emitir el recibo');
        const data = await res.json();
        setItems(prev => [data, ...prev]);
        return data;
    };

    const modificarItem = async (modificado) => {
        if (USE_MOCK) {
            setItems(prev => prev.map(item =>
                item.idRecibo === modificado.idRecibo ? { ...item, ...modificado } : item
            ));
            return modificado;
        }
        const res = await fetch(`${API_URL}/recibos/${modificado.idRecibo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modificado),
        });
        if (!res.ok) throw new Error('Error al modificar el recibo');
        const data = await res.json();
        setItems(prev => prev.map(item => item.idRecibo === data.idRecibo ? data : item));
        return data;
    };

    const eliminarItem = async (id) => {
        if (USE_MOCK) {
            setItems(prev => prev.filter(item => item.idRecibo !== id));
            return;
        }
        const res = await fetch(`${API_URL}/recibos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al anular el recibo');
        setItems(prev => prev.filter(item => item.idRecibo !== id));
    };

    return (
        <RecibosContext.Provider value={{ items, loading, error, fetchItems, crearItem, modificarItem, eliminarItem }}>
            {children}
        </RecibosContext.Provider>
    );
}

export const useRecibos = () => useContext(RecibosContext);