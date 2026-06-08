import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ClientesContext = createContext();
const CLIENTES_SEED_VERSION = 'presentacion-mocks-2026-06-08';

const MOCK_CLIENTES = [
    {
        idUsuario: 101,
        id: 101,
        nombre: 'Lucia',
        apellido: 'Martinez',
        fechaNacimiento: '1992-03-14',
        dni: '33788901',
        email: 'lucia.martinez@example.com',
        password: '123456',
        telefono: '+54 9 11 5678 1234',
        username: 'lucia.martinez',
        activo: true,
        estado: 'activo',
        fechaRegistro: '2024-01-10',
        rol: 'cliente',
        nroSocio: 'C-001',
    },
    {
        idUsuario: 102,
        id: 102,
        nombre: 'Tomas',
        apellido: 'Herrera',
        fechaNacimiento: '1988-07-22',
        dni: '28455903',
        email: 'tomas.herrera@example.com',
        password: '123456',
        telefono: '+54 9 11 5522 3344',
        username: 'tomas.herrera',
        activo: true,
        estado: 'activo',
        fechaRegistro: '2024-02-02',
        rol: 'cliente',
        nroSocio: 'C-002',
    },
    {
        idUsuario: 103,
        id: 103,
        nombre: 'Camila',
        apellido: 'Torres',
        fechaNacimiento: '1995-11-05',
        dni: '38999111',
        email: 'camila.torres@example.com',
        password: '123456',
        telefono: '+54 9 11 6123 4567',
        username: 'camila.torres',
        activo: true,
        estado: 'activo',
        fechaRegistro: '2024-03-15',
        rol: 'cliente',
        nroSocio: 'C-003',
    },
    {
        idUsuario: 104,
        id: 104,
        nombre: 'Diego',
        apellido: 'Vega',
        fechaNacimiento: '1990-12-06',
        dni: '29500782',
        email: 'diego.vega@example.com',
        password: '123456',
        telefono: '+54 9 11 5338 4477',
        username: 'diego.vega',
        activo: true,
        estado: 'activo',
        fechaRegistro: '2024-04-05',
        rol: 'cliente',
        nroSocio: 'C-004',
    },
    {
        idUsuario: 105,
        id: 105,
        nombre: 'Valentina',
        apellido: 'Garcia',
        fechaNacimiento: '2001-09-20',
        dni: '42211856',
        email: 'valentina.garcia@example.com',
        password: '123456',
        telefono: '+54 9 11 5999 0011',
        username: 'valentina.garcia',
        activo: true,
        estado: 'activo',
        fechaRegistro: '2024-04-30',
        rol: 'cliente',
        nroSocio: 'C-005',
    },
];

export function ClientesProvider({ children }) {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClientes = useCallback(async () => {
        setLoading(true);
        try {
            const localData = localStorage.getItem('clientes_db');
            const seedVersion = localStorage.getItem('clientes_seed_version');
            if (localData && seedVersion === CLIENTES_SEED_VERSION) {
                setClientes(JSON.parse(localData));
            } else {
                localStorage.setItem('clientes_db', JSON.stringify(MOCK_CLIENTES));
                localStorage.setItem('clientes_seed_version', CLIENTES_SEED_VERSION);
                setClientes(MOCK_CLIENTES);
            }
        } catch {
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
        const itemNuevo = {
            ...nuevo,
            idUsuario: Date.now(),
            rol: nuevo.rol || 'cliente',
            estado: 'activo',
            activo: true,
            fechaRegistro: new Date().toISOString().split('T')[0],
        };
        setClientes(prev => {
            const next = [...prev, itemNuevo];
            localStorage.setItem('clientes_db', JSON.stringify(next));
            return next;
        });
        setLoading(false);
        return itemNuevo;
    };

    const modificarCliente = async (clienteModificado) => {
        setLoading(true);
        setClientes(prev => {
            const next = prev.map(c =>
                c.idUsuario === clienteModificado.idUsuario
                    ? { ...c, ...clienteModificado }
                    : c
            );
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
