// src/context/ProfesoresContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { normalizarCertificaciones } from '../utils/profesoresCertificacion';

export const MOCK_PROFESORES = [
    {
        idUsuario: 20,
        nombre: 'Agustín',
        apellido: 'Ríos',
        email: 'agustin.rios@example.com',
        telefono: '+54 9 11 5888 2233',
        username: 'agustinrios',
        fechaNacimiento: '1985-04-12',
        dni: '28123456',
        turno: 'Mañana',
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
        username: 'julianaf',
        fechaNacimiento: '1990-09-23',
        dni: '32987654',
        turno: 'Tarde',
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
        username: 'brunon',
        fechaNacimiento: '1988-01-17',
        dni: '30555111',
        turno: 'Noche',
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
        username: 'ceciliaV',
        fechaNacimiento: '1993-07-08',
        dni: '35111222',
        turno: 'Tarde',
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
                if (localData) {
                    const profesoresNormalizados = JSON.parse(localData).map(normalizarProfesor);
                    localStorage.setItem('profesores_db', JSON.stringify(profesoresNormalizados));
                    setProfesores(profesoresNormalizados);
                } else {
                    const profesoresNormalizados = MOCK_PROFESORES.map(normalizarProfesor);
                    localStorage.setItem('profesores_db', JSON.stringify(profesoresNormalizados));
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
        } else {
            const idUser = profesorModificado.idUser
            const idProfessor = profesorModificado.idProfessor

            const datosUser = {
                name: profesorModificado.name,
                lastName: profesorModificado.lastName,
                dni: profesorModificado.dni,
                userName: profesorModificado.userName,
                email: profesorModificado.email,
                phoneNumber: profesorModificado.phoneNumber,
            }

            const datosProfessor = {
                speciality: profesorModificado.speciality,
                certification: profesorModificado.certification,
            }

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

            //const profesorActualizado = await responseProfessor.json();
            //setProfesores(prev => prev.map(p => p.idUser === profesorActualizado.idUser ? profesorActualizado : p));
        }
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
