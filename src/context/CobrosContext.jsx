import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CobrosContext = createContext();

const MOCK_COBROS = [
    {
        idCobro: 1001,
        idReserva: 1,
        cliente: { idUsuario: 1, nombre: 'Laura', apellido: 'García', dni: '33788901' },
        concepto: 'Reserva Cancha Norte - 2026-05-25',
        tipoCobro: 'Reserva Cancha',
        monto: 15000,
        descuento: null,
        montoFinal: 15000,
        fecha: '2026-05-22',
        estado: 'pagado',
        metodo: 'MercadoPago',
    },
    {
        idCobro: 1002,
        idReserva: 2,
        cliente: { idUsuario: 2, nombre: 'Martín', apellido: 'Pérez', dni: '28455903' },
        concepto: 'Reserva Cancha Sur - 2026-05-26',
        tipoCobro: 'Reserva Cancha',
        monto: 12000,
        descuento: null,
        montoFinal: 12000,
        fecha: '2026-05-21',
        estado: 'pendiente',
        metodo: null,
    },
    {
        idCobro: 1003,
        idReserva: null,
        cliente: { idUsuario: 3, nombre: 'Sofia', apellido: 'Lopez', dni: '38999111' },
        concepto: 'Inscripcion clase: Futbol Femenino',
        tipoCobro: 'Clase/Entrenamiento',
        monto: 4500,
        descuento: null,
        montoFinal: 4500,
        fecha: '2026-06-05',
        estado: 'pagado',
        metodo: 'Efectivo',
    }
];

function mergeCobrosLocales(localItems) {
    if (!Array.isArray(localItems) || localItems.length === 0) return MOCK_COBROS;
    const idsLocales = new Set(localItems.map(item => item.idCobro));
    const faltantes = MOCK_COBROS.filter(item => !idsLocales.has(item.idCobro));
    return [...localItems, ...faltantes];
}

export function CobrosProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const localData = localStorage.getItem('cobros_db');
            if (localData) {
                const next = mergeCobrosLocales(JSON.parse(localData));
                localStorage.setItem('cobros_db', JSON.stringify(next));
                setItems(next);
            } else {
                localStorage.setItem('cobros_db', JSON.stringify(MOCK_COBROS));
                setItems(MOCK_COBROS);
            }
        } catch (err) {
            setError('Error en cobros local storage');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const crearItem = async (nuevo) => {
        const itemNuevo = { ...nuevo, idCobro: Date.now(), fecha: new Date().toISOString().split('T')[0] };
        setItems(prev => {
            const next = [itemNuevo, ...prev];
            localStorage.setItem('cobros_db', JSON.stringify(next));
            return next;
        });
        return itemNuevo;
    };

    const modificarItem = async (modificado) => {
        setItems(prev => {
            const next = prev.map(item => item.idCobro === modificado.idCobro ? { ...item, ...modificado } : item);
            localStorage.setItem('cobros_db', JSON.stringify(next));
            return next;
        });
        return modificado;
    };

    const eliminarItem = async (id) => {
        setItems(prev => {
            const next = prev.filter(item => item.idCobro !== id);
            localStorage.setItem('cobros_db', JSON.stringify(next));
            return next;
        });
    };

    return (
        <CobrosContext.Provider value={{ items, loading, error, fetchItems, crearItem, modificarItem, eliminarItem }}>
            {children}
        </CobrosContext.Provider>
    );
}

export function useCobros() {
    return useContext(CobrosContext);
}
