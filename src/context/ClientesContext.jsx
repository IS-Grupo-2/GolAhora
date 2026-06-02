// src/context/ClientesContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
        fechaNacimiento: '1995-11-30',
        dni: '40122345',
        email: 'sofia.lopez@example.com',
        telefono: '+54 9 11 5987 1122',
        userName: 'sofial',
        activo: true,
        fechaRegistro: '2024-03-18',
        rol: 'cliente',
        nroSocio: 'C-003',
    },
    {
        idUsuario: 4,
        nombre: 'Diego',
        apellido: 'Vega',
        fechaNacimiento: '1990-12-06',
        dni: '29500782',
        email: 'diego.vega@example.com',
        telefono: '+54 9 11 5338 4477',
        userName: 'dvega',
        activo: true,
        fechaRegistro: '2024-04-05',
        rol: 'cliente',
        nroSocio: 'C-004',
    },
    {
        idUsuario: 5,
        nombre: 'Mariana',
        apellido: 'Santos',
        fechaNacimiento: '2001-09-20',
        dni: '42211856',
        email: 'mariana.santos@example.com',
        telefono: '+54 9 11 5999 0011',
        userName: 'marianas',
        activo: false,
        fechaRegistro: '2024-04-30',
        rol: 'cliente',
        nroSocio: 'C-005',
    },
    {
        idUsuario: 6,
        nombre: 'Facundo',
        apellido: 'Ortiz',
        fechaNacimiento: '1998-06-12',
        dni: '37890012',
        email: 'facundo.ortiz@example.com',
        telefono: '+54 9 11 5777 3344',
        userName: 'facundoo',
        activo: true,
        fechaRegistro: '2024-05-12',
        rol: 'cliente',
        nroSocio: 'C-006',
    },
];

const ClientesContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK = true;

export function ClientesProvider({ children }) {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClientes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setClientes(prev => prev.length === 0 ? MOCK_CLIENTES : prev);
            } else {
                const response = await fetch(`${API_URL}/clientes`);
                if (!response.ok) throw new Error('Error al obtener clientes');
                const data = await response.json();
                setClientes(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    const crearCliente = async (nuevoCliente) => {
        if (USE_MOCK) {
            const clienteConId = { ...nuevoCliente, idUsuario: Date.now(), activo: true };
            setClientes(prev => [...prev, clienteConId]);
        } else {
            // Lógica de fetch real (POST)
        }
    };

    const modificarCliente = async (clienteModificado) => {
        if (USE_MOCK) {
            setClientes(prev => prev.map(c => c.idUsuario === clienteModificado.idUsuario ? clienteModificado : c));
        } else {
            // Lógica de fetch real (PUT)
        }
    };

    const darDeBaja = async (idUsuario) => {
        if (USE_MOCK) {
            setClientes(prev => prev.map(c => 
                c.idUsuario === idUsuario ? { ...c, activo: !c.activo } : c
            ));
        } else {
            // Lógica de fetch real (PATCH/PUT)
        }
    };

    return (
        <ClientesContext.Provider value={{ 
            clientes, 
            loading, 
            error, 
            fetchClientes, 
            crearCliente, 
            modificarCliente, 
            darDeBaja 
        }}>
            {children}
        </ClientesContext.Provider>
    );
}

export function useClientes() {
    const ctx = useContext(ClientesContext);
    if (!ctx) {
        throw new Error('useClientes debe usarse dentro de ClientesProvider');
    }
    return ctx;
}