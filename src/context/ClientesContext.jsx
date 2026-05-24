// src/context/ClientesContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_CLIENTES } from '../mocks/mockData';

const ClientesContext = createContext();

// Variable de entorno simulada (asegurate de tener VITE_API_URL en tu .env)
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
                setClientes(MOCK_CLIENTES);
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
    return useContext(ClientesContext);
}