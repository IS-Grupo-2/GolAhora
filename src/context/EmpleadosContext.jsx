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

const API_URL = 'http://localhost:5063/api';
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
                const localData = localStorage.getItem('empleados_db');
                if (localData) {
                    setEmpleados(JSON.parse(localData));
                } else {
                    localStorage.setItem('empleados_db', JSON.stringify(MOCK_EMPLEADOS));
                    setEmpleados(MOCK_EMPLEADOS);
                }
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
                estado: 'activo',
                rol: 'empleado',
                fechaRegistro: new Date().toISOString().split('T')[0],
            };
            setEmpleados(prev => {
                const next = [...prev, empleadoConId];
                localStorage.setItem('empleados_db', JSON.stringify(next));
                return next;
            });
            return empleadoConId;
        } else {
            const response = await fetch(`${API_URL}/empleados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoEmpleado),
            });
            if (!response.ok) throw new Error('Error al crear el empleado');
            const empleadoCreado = await response.json();
            setEmpleados(prev => [...prev, empleadoCreado]);
        }
    };

    const modificarEmpleado = async (empleadoModificado) => {
        if (USE_MOCK) {
            setEmpleados(prev => {
                const next = prev.map(e =>
                    e.idUsuario === empleadoModificado.idUsuario
                        ? { ...e, ...empleadoModificado, rol: 'empleado' }
                        : e
                );
                localStorage.setItem('empleados_db', JSON.stringify(next));
                return next;
            });
        } else {
            const response = await fetch(`${API_URL}/empleados/${empleadoModificado.idUsuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empleadoModificado),
            });
            if (!response.ok) throw new Error('Error al modificar el empleado');
            const empleadoActualizado = await response.json();
            setEmpleados(prev => prev.map(e => e.idUsuario === empleadoActualizado.idUsuario ? empleadoActualizado : e));
        }
    };

    const darDeBaja = async (idUsuario) => {
        if (USE_MOCK) {
            setEmpleados(prev => {
                const next = prev.map(e =>
                    e.idUsuario === idUsuario
                        ? {
                            ...e,
                            activo: !e.activo,
                            estado: e.activo ? 'inactivo' : 'activo',
                        }
                        : e
                );
                localStorage.setItem('empleados_db', JSON.stringify(next));
                return next;
            });
        } else {
            const response = await fetch(`${API_URL}/empleados/${idUsuario}/estado`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error('Error al cambiar el estado del empleado');
            const empleadoActualizado = await response.json();
            setEmpleados(prev => prev.map(e => e.idUsuario === empleadoActualizado.idUsuario ? empleadoActualizado : e));
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
