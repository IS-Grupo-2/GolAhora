import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const DescuentosContext = createContext();

const MOCK_DESCUENTOS = [
    {
        id: 1,
        codigo: 'GOL10',
        nombre: 'Promo bienvenida',
        porcentaje: 10,
        descripcion: 'Descuento inicial para reservas y cobros.',
        activo: true,
    },
    {
        id: 2,
        codigo: 'SOCIO20',
        nombre: 'Beneficio socio',
        porcentaje: 20,
        descripcion: 'Beneficio promocional para clientes frecuentes.',
        activo: true,
    },
    {
        id: 3,
        codigo: 'VENCIDO15',
        nombre: 'Promo inactiva',
        porcentaje: 15,
        descripcion: 'Ejemplo de descuento deshabilitado.',
        activo: false,
    },
];

function normalizarDescuento(descuento) {
    return {
        ...descuento,
        codigo: String(descuento.codigo || '').trim().toUpperCase(),
        porcentaje: Number(descuento.porcentaje || 0),
        activo: descuento.activo !== false,
    };
}

function mergeDescuentosLocales(localItems) {
    if (!Array.isArray(localItems) || localItems.length === 0) return MOCK_DESCUENTOS;
    const codigosLocales = new Set(localItems.map(item => String(item.codigo || '').toUpperCase()));
    const faltantes = MOCK_DESCUENTOS.filter(item => !codigosLocales.has(item.codigo));
    return [...localItems.map(normalizarDescuento), ...faltantes];
}

export function DescuentosProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const persistir = (next) => {
        localStorage.setItem('descuentos_db', JSON.stringify(next));
        return next;
    };

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const localData = localStorage.getItem('descuentos_db');
            if (localData) {
                const next = mergeDescuentosLocales(JSON.parse(localData));
                setItems(persistir(next));
            } else {
                setItems(persistir(MOCK_DESCUENTOS));
            }
        } catch (err) {
            setError('Error cargando descuentos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const crearItem = async (nuevo) => {
        const item = normalizarDescuento({ ...nuevo, id: Date.now() });
        setItems(prev => persistir([item, ...prev]));
        return item;
    };

    const modificarItem = async (modificado) => {
        const item = normalizarDescuento(modificado);
        setItems(prev => persistir(prev.map(x => x.id === item.id ? { ...x, ...item } : x)));
        return item;
    };

    const eliminarItem = async (id) => {
        setItems(prev => persistir(prev.filter(x => x.id !== id)));
    };

    const buscarPorCodigo = (codigo) => {
        const normalizado = String(codigo || '').trim().toUpperCase();
        return items.find(d => d.activo && d.codigo === normalizado) || null;
    };

    return (
        <DescuentosContext.Provider value={{
            items,
            descuentos: items,
            loading,
            error,
            fetchItems,
            crearItem,
            modificarItem,
            eliminarItem,
            buscarPorCodigo,
        }}>
            {children}
        </DescuentosContext.Provider>
    );
}

export function useDescuentos() {
    const context = useContext(DescuentosContext);
    if (!context) throw new Error('useDescuentos debe usarse dentro de DescuentosProvider');
    return context;
}
