// src/context/ProfesoresContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const MOCK_PROFESORES = [
    {
        idUsuario: 20,
        nombre: 'Agustín',
        apellido: 'Ríos',
        email: 'agustin.rios@example.com',
        telefono: '+54 9 11 5888 2233',
        userName: 'agustinrios',
        activo: true,
        fechaRegistro: '2023-10-01',
        rol: 'profesor',
        legajo: 'P-101',
        especialidad: 'Fútbol Táctico',
        certificaciones: [
            {
                nombre: 'Entrenador Nacional',
                entidadEmisora: 'Asociación Argentina De Fútbol',
                fechaEmision: '2021-05-12',
                fechaVencimiento: '2026-05-12',
                verificada: true,
            },
            {
                nombre: 'Preparador Físico',
                entidadEmisora: 'Escuela Nacional De Deportes',
                fechaEmision: '2022-08-24',
                fechaVencimiento: '2027-08-24',
                verificada: true,
            },
        ],
    },
    {
        idUsuario: 21,
        nombre: 'Juliana',
        apellido: 'Ferrer',
        email: 'juliana.ferrer@example.com',
        telefono: '+54 9 11 5666 7788',
        userName: 'julianaf',
        activo: true,
        fechaRegistro: '2023-11-15',
        rol: 'profesor',
        legajo: 'P-102',
        especialidad: 'Fútbol Juvenil',
        certificaciones: [
            {
                nombre: 'Coordinador De Escuela',
                entidadEmisora: 'Federación De Fútbol',
                fechaEmision: '2020-03-10',
                fechaVencimiento: '2025-03-10',
                verificada: true,
            },
            {
                nombre: 'Nutrición Deportiva',
                entidadEmisora: 'Instituto De Salud Y Deporte',
                fechaEmision: '2022-01-18',
                fechaVencimiento: '2027-01-18',
                verificada: false,
            },
        ],
    },
    {
        idUsuario: 22,
        nombre: 'Bruno',
        apellido: 'Núñez',
        email: 'bruno.nunez@example.com',
        telefono: '+54 9 11 5444 9900',
        userName: 'brunon',
        activo: true,
        fechaRegistro: '2023-12-02',
        rol: 'profesor',
        legajo: 'P-103',
        especialidad: 'Condición Física',
        certificaciones: [
            {
                nombre: 'Entrenador De Fuerza',
                entidadEmisora: 'Centro De Alto Rendimiento',
                fechaEmision: '2021-09-07',
                fechaVencimiento: '2026-09-07',
                verificada: true,
            },
            {
                nombre: 'Rehabilitación Deportiva',
                entidadEmisora: 'Universidad Del Deporte',
                fechaEmision: '2022-11-11',
                fechaVencimiento: '2027-11-11',
                verificada: true,
            },
        ],
    },
    {
        idUsuario: 23,
        nombre: 'Cecilia',
        apellido: 'Valdez',
        email: 'cecilia.valdez@example.com',
        telefono: '+54 9 11 5111 2233',
        userName: 'ceciliaV',
        activo: false,
        fechaRegistro: '2024-01-20',
        rol: 'profesor',
        legajo: 'P-104',
        especialidad: 'Técnica Individual',
        certificaciones: [
            {
                nombre: 'Coach UEFA C',
                entidadEmisora: 'UEFA Academy',
                fechaEmision: '2021-06-30',
                fechaVencimiento: '2026-06-30',
                verificada: true,
            },
            {
                nombre: 'Primeros Auxilios Deportivos',
                entidadEmisora: 'Cruz Roja',
                fechaEmision: '2023-02-12',
                fechaVencimiento: '2025-02-12',
                verificada: false,
            },
        ],
    },
];


const ProfesoresContext = createContext();

const API_URL = 'http://localhost:5063/api'


const USE_MOCK = false;

export function ProfesoresProvider({ children }) {
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfesores = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setProfesores(prev => prev.length === 0 ? MOCK_PROFESORES : prev);
            } else {
                const response = await fetch(`${API_URL}/User`);
                if (!response.ok) throw new Error('Error al obtener profesores');
                const data = await response.json();
                setProfesores(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfesores();
    }, [fetchProfesores]);

    const crearProfesor = async (nuevoProfesor) => {
        if (USE_MOCK) {
            const profesorConId = {
                ...nuevoProfesor,
                idUsuario: Date.now(),
                activo: true,
                rol: 'profesor'
            };
            setProfesores(prev => [...prev, profesorConId]);
        } else {
            const response = await fetch(`${API_URL}/Auth/register/professor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoProfesor),
            });
            if (!response.ok) throw new Error('Error al crear el profesor');
            const profesorCreado = await response.json();
            setProfesores(prev => [...prev, profesorCreado]);
        }
    };

    const modificarProfesor = async (profesorModificado) => {
        if (USE_MOCK) {
            setProfesores(prev => prev.map(p => p.idUsuario === profesorModificado.idUsuario ? profesorModificado : p));
        } else {
            const response = await fetch(`${API_URL}/profesores/${profesorModificado.idUsuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profesorModificado),
            });
            if (!response.ok) throw new Error('Error al modificar el profesor');
            const profesorActualizado = await response.json();
            setProfesores(prev => prev.map(p => p.idUsuario === profesorActualizado.idUsuario ? profesorActualizado : p));
        }
    };

    const darDeBaja = async (idUsuario) => {
        if (USE_MOCK) {
            setProfesores(prev => prev.map(p =>
                p.idUsuario === idUsuario ? { ...p, activo: !p.activo } : p
            ));
        } else {
            const response = await fetch(`${API_URL}/profesores/${idUsuario}/estado`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error('Error al cambiar el estado del profesor');
            const profesorActualizado = await response.json();
            setProfesores(prev => prev.map(p => p.idUsuario === profesorActualizado.idUsuario ? profesorActualizado : p));
        }
    };

    return (
        <ProfesoresContext.Provider value={{
            profesores,
            loading,
            error,
            fetchProfesores,
            crearProfesor,
            modificarProfesor,
            darDeBaja
        }}>
            {children}
        </ProfesoresContext.Provider>
    );
}

export function useProfesores() {
    return useContext(ProfesoresContext);
}