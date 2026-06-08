// src/context/ProfesoresContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { normalizarCertificaciones } from '../utils/profesoresCertificacion';

const PROFESORES_SEED_VERSION = 'presentacion-mocks-2026-06-08';

export const MOCK_PROFESORES = [
    {
        idUsuario: 201,
        id: 201,
        nombre: 'Nicolas',
        apellido: 'Suarez',
        email: 'nicolas.suarez@example.com',
        password: '123456',
        telefono: '+54 9 11 5888 2233',
        username: 'nicolas.suarez',
        fechaNacimiento: '1985-04-12',
        dni: '28123456',
        turno: 'Manana',
        activo: true,
        estado: 'activo',
        fechaRegistro: '2024-05-01',
        rol: 'profesor',
        legajo: 'P-201',
        especialidad: 'Entrenamiento ofensivo',
        certificaciones: [],
        verificacionCertificacion: false,
    },
    {
        idUsuario: 202,
        id: 202,
        nombre: 'Brenda',
        apellido: 'Molina',
        email: 'brenda.molina@example.com',
        password: '123456',
        telefono: '+54 9 11 5666 7788',
        username: 'brenda.molina',
        fechaNacimiento: '1990-09-23',
        dni: '32987654',
        turno: 'Tarde',
        activo: true,
        estado: 'activo',
        fechaRegistro: '2024-05-03',
        rol: 'profesor',
        legajo: 'P-202',
        especialidad: 'Jugadas preparadas',
        certificaciones: [],
        verificacionCertificacion: false,
    },
];

const ProfesoresContext = createContext();

const API_URL = 'http://localhost:5063/api';
const USE_MOCK = true;

function normalizarProfesor(profesor) {
    const certificaciones = normalizarCertificaciones(profesor.certificaciones);
    return {
        ...profesor,
        certificaciones,
        verificacionCertificacion: Boolean(profesor.verificacionCertificacion) || certificaciones.some(c => c.verificada),
    };
}

export function ProfesoresProvider({ children }) {
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfesores = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (USE_MOCK) {
                const localData = localStorage.getItem('profesores_db');
                const seedVersion = localStorage.getItem('profesores_seed_version');
                if (localData && seedVersion === PROFESORES_SEED_VERSION) {
                    const profesoresNormalizados = JSON.parse(localData).map(normalizarProfesor);
                    localStorage.setItem('profesores_db', JSON.stringify(profesoresNormalizados));
                    setProfesores(profesoresNormalizados);
                } else {
                    const profesoresNormalizados = MOCK_PROFESORES.map(normalizarProfesor);
                    localStorage.setItem('profesores_db', JSON.stringify(profesoresNormalizados));
                    localStorage.setItem('profesores_seed_version', PROFESORES_SEED_VERSION);
                    setProfesores(profesoresNormalizados);
                }
            } else {
                const response = await fetch(`${API_URL}/User/Users/Professors`);
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
                estado: nuevoProfesor.estado || 'activo',
                rol: 'profesor',
                fechaRegistro: new Date().toISOString().split('T')[0],
                certificaciones: normalizarCertificaciones(nuevoProfesor.certificaciones),
                verificacionCertificacion: false,
            };
            setProfesores(prev => {
                const next = [...prev, profesorConId];
                localStorage.setItem('profesores_db', JSON.stringify(next));
                return next;
            });
            return profesorConId;
        }

        const response = await fetch(`${API_URL}/Auth/register/professor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProfesor),
        });
        if (!response.ok) throw new Error('Error al crear el profesor');
        const profesorCreado = await response.json();
        setProfesores(prev => [...prev, profesorCreado]);
    };

    const modificarProfesor = async (profesorModificado) => {
        if (USE_MOCK) {
            setProfesores(prev => {
                const next = prev.map(p => {
                    if (p.idUsuario !== profesorModificado.idUsuario) return p;

                    const certificaciones = profesorModificado.certificaciones !== undefined
                        ? normalizarCertificaciones(profesorModificado.certificaciones)
                        : normalizarCertificaciones(p.certificaciones);

                    return {
                        ...p,
                        ...profesorModificado,
                        certificaciones,
                        verificacionCertificacion: Boolean(profesorModificado.verificacionCertificacion) || certificaciones.some(c => c.verificada),
                        password: profesorModificado.password || p.password,
                    };
                });
                localStorage.setItem('profesores_db', JSON.stringify(next));
                return next;
            });
            return;
        }

        const idUser = profesorModificado.idUser;
        const idProfessor = profesorModificado.idProfessor;

        const datosUser = {
            name: profesorModificado.name,
            lastName: profesorModificado.lastName,
            dni: profesorModificado.dni,
            userName: profesorModificado.userName,
            email: profesorModificado.email,
            phoneNumber: profesorModificado.phoneNumber,
        };

        const datosProfessor = {
            speciality: profesorModificado.speciality,
            certification: profesorModificado.certification,
        };

        const responseUser = await fetch(`${API_URL}/User/${idUser}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUser),
        });
        if (!responseUser.ok) throw new Error('Error al modificar el profesor');

        const responseProfessor = await fetch(`${API_URL}/Professor/${idProfessor}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProfessor),
        });
        if (!responseProfessor.ok) throw new Error('Error al modificar el profesor');

        await fetchProfesores();
    };

    const darDeBaja = async (idUsuario) => {
        if (USE_MOCK) {
            setProfesores(prev => {
                const next = prev.map(p =>
                    p.idUsuario === idUsuario
                        ? {
                            ...p,
                            activo: !p.activo,
                            estado: p.activo ? 'inactivo' : 'activo',
                        }
                        : p
                );
                localStorage.setItem('profesores_db', JSON.stringify(next));
                return next;
            });
        } else {
            const response = await fetch(`${API_URL}/User/${idUsuario}`, {
                method: 'DELETE',
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
