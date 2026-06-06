import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ClientesContext = createContext();

const MOCK_CLIENTES = [
    {
        idUsuario: 1,
        nombre: 'Laura',
        apellido: 'García',
        fechaNacimiento: '1992-03-14',
        dni: '33788901',
        email: 'laura.garcia@example.com',
        telefono: '+54 9 11 5678 1234',
        userName: 'lauragarcia',
        activo: true,
        fechaRegistro: '2024-01-10',
        rol: 'cliente',
        nroSocio: 'C-001',
    },
    {
        idUsuario: 2,
        nombre: 'Martín',
        apellido: 'Pérez',
        fechaNacimiento: '1988-07-22',
        dni: '28455903',
        email: 'martin.perez@example.com',
        telefono: '+54 9 11 5522 3344',
        userName: 'martinp',
        activo: true,
        fechaRegistro: '2024-02-02',
        rol: 'cliente',
        nroSocio: 'C-002',
    },
    {
        idUsuario: 3,
        nombre: 'Sofía',
        apellido: 'López',
        fechaNacimiento: '1995-11-05',
        dni: '38999111',
        email: 'sofia.lopez@example.com',
        telefono: '+54 9 11 6123 4567',
        userName: 'sofial',
        activo: true,
        fechaRegistro: '2024-03-15',
        rol: 'cliente',
        nroSocio: 'C-003',
    }
];

export function ClientesProvider({ children }) {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClientes = useCallback(async () => {
        setLoading(true);
        try {
            const localData = localStorage.getItem('clientes_db');
            if (localData) {
                setClientes(JSON.parse(localData));
            } else {
                localStorage.setItem('clientes_db', JSON.stringify(MOCK_CLIENTES));
                setClientes(MOCK_CLIENTES);
            }
        } catch (err) {
            setError('Error al leer base local de clientes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    const crearCliente = async (nuevo) => {
        setLoading(true);
        const itemNuevo = { ...nuevo, idUsuario: Date.now(), activo: true, fechaRegistro: new Date().toISOString().split('T')[0] };
        setClientes(prev => {
            const next = [...prev, itemNuevo];
            localStorage.setItem('clientes_db', JSON.stringify(next));
            return next;
        });
        setLoading(false);
        return itemNuevo;
    };

    const modificarCliente = async (idUsuario, modificado) => {
        setLoading(true);
        setClientes(prev => {
            const next = prev.map(c => c.idUsuario === idUsuario ? { ...c, ...modificado } : c);
            localStorage.setItem('clientes_db', JSON.stringify(next));
            return next;
        });
        setLoading(false);
    };

    const darDeBaja = async (idUsuario) => {
        setLoading(true);
        setClientes(prev => {
            const next = prev.map(c => c.idUsuario === idUsuario ? { ...c, activo: !c.activo } : c);
            localStorage.setItem('clientes_db', JSON.stringify(next));
            return next;
        });
        setLoading(false);
    };

    return (
        <ClientesContext.Provider value={{ clientes, loading, error, fetchClientes, crearCliente, modificarCliente, darDeBaja }}>
            {children}
        </ClientesContext.Provider>
    );
}

export function useClientes() {
    const ctx = useContext(ClientesContext);
    if (!ctx) throw new Error('useClientes debe usarse dentro de ClientesProvider');
    return ctx;
}