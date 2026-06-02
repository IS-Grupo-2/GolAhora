// src/context/EmpleadosContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MOCK_EMPLEADOS = [
    {
        idUsuario: 30,
        nombre: 'Valeria',
        apellido: 'Cardozo',
        email: 'valeria.cardozo@example.com',
        telefono: '+54 9 11 5775 8899',
        userName: 'valeriac',
        activo: true,
        fechaRegistro: '2023-09-05',
        rol: 'empleado',
        legajo: 'E-201',
        cargo: 'Recepcionista',
        turno: 'Mañana',
        sector: 'Administración',
    },
    {
        idUsuario: 31,
        nombre: 'Federico',
        apellido: 'Méndez',
        email: 'federico.mendez@example.com',
        telefono: '+54 9 11 5881 3344',
        userName: 'federicom',
        activo: true,
        fechaRegistro: '2023-10-21',
        rol: 'empleado',
        legajo: 'E-202',
        cargo: 'Mantenimiento',
        turno: 'Tarde',
        sector: 'Operaciones',
    },
    {
        idUsuario: 32,
        nombre: 'Natalia',
        apellido: 'Rosales',
        email: 'natalia.rosales@example.com',
        telefono: '+54 9 11 5994 7766',
        userName: 'nataliar',
        activo: false,
        fechaRegistro: '2024-01-08',
        rol: 'empleado',
        legajo: 'E-203',
        cargo: 'Coordinador',
        turno: 'Noche',
        sector: 'Eventos',
    },
];

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
                setEmpleados(prev => prev.length === 0 ? MOCK_EMPLEADOS : prev);
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