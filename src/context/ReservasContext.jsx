import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ReservasContext = createContext();

const CANCHA_ID_POR_NUMERO = {
    1: 101,
    2: 102,
    3: 103,
    4: 104,
    5: 105
};

const normalizarReserva = (reserva) => {
    const numero = reserva?.cancha?.numero;
    const idActual = reserva?.cancha?.idCancha ?? reserva?.cancha?.id;
    const idNormalizado = idActual && idActual < 100 && CANCHA_ID_POR_NUMERO[numero]
        ? CANCHA_ID_POR_NUMERO[numero]
        : idActual;

    return {
        ...reserva,
        cancha: reserva?.cancha
            ? { ...reserva.cancha, id: idNormalizado, idCancha: idNormalizado }
            : reserva?.cancha
    };
};

// Datos iniciales de simulación (Junio 2026 para tu demo en vivo)
const INITIAL_MOCK_DATA = [
    {
        idReserva: 1,
        cliente: { idUsuario: 1, nombre: 'Laura', apellido: 'García' },
        reservador: { id: 1, nombre: 'Laura García', email: 'laura.garcia@example.com', rol: 'cliente' },
        cancha: { id: 101, idCancha: 101, nombre: 'Cancha Norte', numero: 1 },
        fechaCreacion: '2026-06-01T10:00:00',
        fechaUso: '2026-06-08',
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
        cancha: { id: 102, idCancha: 102, nombre: 'Cancha Sur', numero: 2 },
        fechaCreacion: '2026-06-02T14:30:00',
        fechaUso: '2026-06-09',
        horaInicio: '20:00',
        horaFin: '21:00',
        duracionMin: 60,
        estado: 'pendiente',
        montoTotal: 15000,
        cobro: { estado: 'pendiente', metodo: null }
    }
];

export function ReservasProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const datosLocales = localStorage.getItem('reservas_db');
            if (datosLocales) {
                const reservasNormalizadas = JSON.parse(datosLocales).map(normalizarReserva);
                localStorage.setItem('reservas_db', JSON.stringify(reservasNormalizadas));
                setItems(reservasNormalizadas);
            } else {
                localStorage.setItem('reservas_db', JSON.stringify(INITIAL_MOCK_DATA));
                setItems(INITIAL_MOCK_DATA);
            }
        } catch (err) {
            setError('Fallo al recuperar datos de localStorage');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const crearItem = useCallback(async (nuevaReserva) => {
        const itemCreado = {
            ...nuevaReserva,
            idReserva: Date.now(),
            fechaCreacion: new Date().toISOString()
        };
        setItems(prev => {
            const nextState = [itemCreado, ...prev];
            localStorage.setItem('reservas_db', JSON.stringify(nextState));
            return nextState;
        });
        return itemCreado;
    }, []);

    const modificarItem = useCallback(async (id, reservaActualizada) => {
        setItems(prev => {
            const nextState = prev.map(item =>
                item.idReserva === id ? { ...item, ...reservaActualizada } : item
            );
            localStorage.setItem('reservas_db', JSON.stringify(nextState));
            return nextState;
        });
    }, []);

    const eliminarItem = useCallback(async (id) => {
        setItems(prev => {
            const nextState = prev.filter(item => item.idReserva !== id);
            localStorage.setItem('reservas_db', JSON.stringify(nextState));
            return nextState;
        });
    }, []);

    // Soporta recibir tanto el objeto entero (r) como el id directo
    const confirmarReserva = useCallback(async (reservaOrId, datosPago = {}) => {
        const id = typeof reservaOrId === 'object' ? reservaOrId.idReserva : reservaOrId;
        setItems(prev => {
            const nextState = prev.map(item =>
                item.idReserva === id 
                    ? {
                        ...item,
                        estado: 'confirmada',
                        cobro: {
                            ...item.cobro,
                            estado: 'pagado',
                            metodo: datosPago.metodo || item.cobro?.metodo || 'Efectivo',
                            nroTransaccion: datosPago.nroTransaccion || item.cobro?.nroTransaccion,
                            descuento: datosPago.descuento || item.cobro?.descuento,
                            montoFinal: datosPago.montoFinal ?? item.cobro?.montoFinal
                        }
                    } 
                    : item
            );
            localStorage.setItem('reservas_db', JSON.stringify(nextState));
            return nextState;
        });
    }, []);

    const cancelarReserva = useCallback(async (reservaOrId) => {
        const id = typeof reservaOrId === 'object' ? reservaOrId.idReserva : reservaOrId;
        setItems(prev => {
            const nextState = prev.map(item =>
                item.idReserva === id 
                    ? { ...item, estado: 'cancelada', cobro: { ...item.cobro, estado: 'cancelado' } } 
                    : item
            );
            localStorage.setItem('reservas_db', JSON.stringify(nextState));
            return nextState;
        });
    }, []);

    const resetearDatos = useCallback(() => {
        localStorage.removeItem('reservas_db');
        fetchItems();
    }, [fetchItems]);

    return (
        <ReservasContext.Provider value={{
            items,
            reservas: items,
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
            cancelarReserva,
            resetearDatos
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
