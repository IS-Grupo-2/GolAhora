import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_CLIENTES } from '../mocks/mockData'; // Asegurate de tener este archivo según tu plan

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = true;

const MOCK_COBROS = [
    {
        idCobro: 1001, cliente: MOCK_CLIENTES?.[0] || { nombre: 'Juan', apellido: 'Pérez', dni: '40255711' },
        concepto: 'Alquiler F5 Noche', tipoCobro: 'Reserva Cancha', monto: 15000, 
        descuento: null, montoFinal: 15000, fecha: '2026-05-22', estado: 'pagado'
    },
    {
        idCobro: 1002, cliente: MOCK_CLIENTES?.[1] || { nombre: 'Camila', apellido: 'Torres', dni: '42100055' },
        concepto: 'Cuota Escuelita', tipoCobro: 'Clase/Entrenamiento', monto: 20000, 
        descuento: { nombre: 'Socio Activo', porcentaje: 15 }, montoFinal: 17000, fecha: '2026-05-20', estado: 'anulado'
    }
];

const CobrosContext = createContext();

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
                setItems(MOCK_COBROS);
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
            setItems(prev => [{ ...nuevo, idCobro: Date.now() }, ...prev]);
            return;
        }
        // Lógica de fetch POST aquí
    };

    const modificarItem = async (modificado) => {
        if (USE_MOCK) {
            setItems(prev => prev.map(item => item.idCobro === modificado.idCobro ? modificado : item));
            return;
        }
        // Lógica de fetch PUT aquí
    };

    const eliminarItem = async (id) => {
        if (USE_MOCK) {
            // En negocio solemos "anular" en vez de eliminar físicamente, pero dejamos la función
            setItems(prev => prev.filter(item => item.idCobro !== id));
            return;
        }
        // Lógica de fetch DELETE aquí
    };

    return (
        <CobrosContext.Provider value={{ items, loading, error, fetchItems, crearItem, modificarItem, eliminarItem }}>
            {children}
        </CobrosContext.Provider>
    );
}

export const useCobros = () => useContext(CobrosContext);