// src/context/EmpleadosContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_EMPLEADOS } from '../mocks/mockData';

const EmpleadosContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK = true;

export function EmpleadosProvider({ children }) {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEmpleados = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setEmpleados(MOCK_EMPLEADOS);
            } else {
                const response = await fetch(`${API_URL}/empleados`);
                if (!response.ok) throw new Error('Error al obtener empleados');
                const data = await response.json();
                setEmpleados(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmpleados();
    }, [fetchEmpleados]);

    const crearEmpleado = async (nuevoEmpleado) => {
        if (USE_MOCK) {
            const empleadoConId = { 
                ...nuevoEmpleado, 
                idUsuario: Date.now(), 
                activo: true,
                rol: 'empleado'
            };
            setEmpleados(prev => [...prev, empleadoConId]);
        } else {
            // Lógica fetch POST
        }
    };

    const modificarEmpleado = async (empleadoModificado) => {
        if (USE_MOCK) {
            setEmpleados(prev => prev.map(e => e.idUsuario === empleadoModificado.idUsuario ? empleadoModificado : e));
        } else {
            // Lógica fetch PUT
        }
    };

    const darDeBaja = async (idUsuario) => {
        if (USE_MOCK) {
            setEmpleados(prev => prev.map(e => 
                e.idUsuario === idUsuario ? { ...e, activo: !e.activo } : e
            ));
        } else {
            // Lógica fetch PATCH
        }
    };

    return (
        <EmpleadosContext.Provider value={{ 
            empleados, 
            loading, 
            error, 
            fetchEmpleados, 
            crearEmpleado, 
            modificarEmpleado, 
            darDeBaja 
        }}>
            {children}
        </EmpleadosContext.Provider>
    );
}

export function useEmpleados() {
    return useContext(EmpleadosContext);
}