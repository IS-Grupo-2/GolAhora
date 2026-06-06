import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RecibosContext = createContext();

const MOCK_RECIBOS = [
    {
        idRecibo: 1,
        nroRecibo: '0001-00000001',
        cobro: { idCobro: 1001, concepto: 'Reserva Cancha Norte - 2026-05-25', montoFinal: 15000 },
        cliente: { idUsuario: 1, nombre: 'Laura', apellido: 'García', dni: '33788901' },
        pago: { metodoPago: 'MercadoPago', nroTransaccion: 'MP-001-2026', fechaPago: '2026-05-22', estado: 'Completado' },
        fecha: '2026-05-22',
        total: 15000,
        detalles: 'Pago por reserva de cancha. Abonado OK.',
        estado: 'emitido',
    }
];

export function RecibosProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const localData = localStorage.getItem('recibos_db');
            if (localData) {
                setItems(JSON.parse(localData));
            } else {
                localStorage.setItem('recibos_db', JSON.stringify(MOCK_RECIBOS));
                setItems(MOCK_RECIBOS);
            }
        } catch (err) {
            setError('Error cargando recibos de almacenamiento local');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const crearItem = async (nuevo) => {
        const item = { ...nuevo, idRecibo: Date.now(), nroRecibo: `0001-${String(Date.now()).slice(-8)}`, fecha: new Date().toISOString().split('T')[0] };
        setItems(prev => { const n = [item, ...prev]; localStorage.setItem('recibos_db', JSON.stringify(n)); return n; });
        return item;
    };

    const modificarItem = async (modificado) => {
        setItems(prev => { const n = prev.map(x => x.idRecibo === modificado.idRecibo ? { ...x, ...modificado } : x); localStorage.setItem('recibos_db', JSON.stringify(n)); return n; });
        return modificado;
    };

    const eliminarItem = async (id) => {
        setItems(prev => { const n = prev.filter(x => x.idRecibo !== id); localStorage.setItem('recibos_db', JSON.stringify(n)); return n; });
    };

    return (
        <RecibosContext.Provider value={{ items, loading, error, fetchItems, crearItem, modificarItem, eliminarItem }}>
            {children}
        </RecibosContext.Provider>
    );
}

export function useRecibos() { return useContext(RecibosContext); }