// src/context/ProfesoresContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_PROFESORES } from '../mocks/mockData';

const ProfesoresContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK = true;

export function ProfesoresProvider({ children }) {
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfesores = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                // Simulamos la demora de red
                await new Promise(resolve => setTimeout(resolve, 300));
                setProfesores(MOCK_PROFESORES);
            } else {
                const response = await fetch(`${API_URL}/profesores`);
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
            // Lógica fetch real POST
        }
    };

    const modificarProfesor = async (profesorModificado) => {
        if (USE_MOCK) {
            setProfesores(prev => prev.map(p => p.idUsuario === profesorModificado.idUsuario ? profesorModificado : p));
        } else {
            // Lógica fetch real PUT
        }
    };

    const darDeBaja = async (idUsuario) => {
        if (USE_MOCK) {
            setProfesores(prev => prev.map(p => 
                p.idUsuario === idUsuario ? { ...p, activo: !p.activo } : p
            ));
        } else {
            // Lógica fetch real PATCH/PUT
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