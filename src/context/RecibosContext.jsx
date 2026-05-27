import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_CLIENTES } from '../mocks/mockData';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = true;

const MOCK_RECIBOS = [
    {
        idRecibo: 1, nroRecibo: '0001-00001234',
        cobro: { idCobro: 1001, concepto: 'Alquiler F5 Noche', montoFinal: 15000 },
        cliente: MOCK_CLIENTES?.[0] || { nombre: 'Juan', apellido: 'Pérez' },
        pago: { metodoPago: 'Transferencia', nroTransaccion: 'TRX-987', fechaPago: '2026-05-22', estado: 'Completado' },
        fecha: '2026-05-22', total: 15000, detalles: 'Abonado OK', estado: 'emitido'
    }
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
                setItems(MOCK_RECIBOS);
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
        if (USE_MOCK) setItems(prev => [{ ...nuevo, idRecibo: Date.now() }, ...prev]);
    };

    const modificarItem = async (modificado) => {
        if (USE_MOCK) setItems(prev => prev.map(item => item.idRecibo === modificado.idRecibo ? modificado : item));
    };

    const eliminarItem = async (id) => {
        if (USE_MOCK) setItems(prev => prev.filter(item => item.idRecibo !== id));
    };

    return (
        <RecibosContext.Provider value={{ items, loading, error, fetchItems, crearItem, modificarItem, eliminarItem }}>
            {children}
        </RecibosContext.Provider>
    );
}

export const useRecibos = () => useContext(RecibosContext);