// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = [
    {
        id: 1,
        nombre: 'Franco',
        apellido: 'Díaz',
        email: 'admin@golahora.com',
        password: '123456',
        telefono: '11 2345-6789',
        username: 'franco.admin',
        rol: 'admin',
        estado: 'activo',
        avatar: null,
        legajo: 'ADM-001',
        cargo: 'Administrador General',
    },

    {
        id: 2,
        nombre: 'Carla',
        apellido: 'Gómez',
        email: 'empleado@golahora.com',
        password: '123456',
        telefono: '11 8765-4321',
        username: 'carla.emp',
        rol: 'empleado',
        estado: 'activo',
        avatar: null,
        legajo: 'EMP-014',
        cargo: 'Recepción',
    },

    {
        id: 3,
        nombre: 'Rodrigo',
        apellido: 'Pérez',
        email: 'profe@golahora.com',
        password: '123456',
        telefono: '11 2222-1111',
        username: 'rodrigo.profe',
        rol: 'profesor',
        estado: 'activo',
        avatar: null,
        legajo: 'PROF-021',
        cargo: 'Entrenador',
    },

    {
        id: 4,
        nombre: 'Lucía',
        apellido: 'Martínez',
        email: 'cliente@golahora.com',
        password: '123456',
        telefono: '11 9999-8888',
        username: 'lucia.cliente',
        rol: 'cliente',
        estado: 'activo',
        avatar: null,
        nroSocio: 'SOC-1044',
    },
];

export function AuthProvider({ children }) {

    // Cargo el usuario del localStorage para mantener la sesión activa al recargar la
    // página.
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('gol_user');
            return stored ? JSON.parse(stored) : null;
        } 
        catch {return null;}
    });

    function persistUser(updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('gol_user', JSON.stringify(updatedUser));
    }

// 1. Convertimos login en ASYNC para dejarlo listo para la API
    async function login({ email, password }) {
        if (USE_MOCK) {
            const found = MOCK_USERS.find(u => u.email === email && u.password === password);

            if (!found) {
                return { ok: false, error: 'Credenciales incorrectas.' };
            }

            const { password: _pw, ...safeUser } = found;
            persistUser(safeUser);
            return { ok: true };
        } else {
            // LOGIN REAL CON BACKEND
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    return { ok: false, error: err.message || 'Credenciales incorrectas.' };
                }
                const data = await response.json(); // Tu backend debería retornar el usuario + token
                persistUser(data.user || data); 
                return { ok: true };
            } catch (err) {
                return { ok: false, error: 'Error de conexión con el servidor.' };
            }
        }
    }

    // 2. NUEVA FUNCIÓN: Permite loguear directamente a un usuario (ideal para post-registro)
    function loginDirect(userData) {
        const safeUser = {
            id: userData.idUsuario || userData.id,
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
            rol: userData.rol || 'cliente',
            estado: 'activo',
            ...userData
        };
        persistUser(safeUser);
    }

    function logout() {
        setUser(null);
        localStorage.removeItem('gol_user');
    }

    function updateProfile(data) {

        const updatedUser = {...user, ...data,};

        persistUser(updatedUser);

        return {ok: true, message: 'Perfil actualizado correctamente.'};
    }

    function changePassword({currentPassword, newPassword, confirmPassword}) 
    {

        if (!currentPassword || !newPassword || !confirmPassword) {
            return {ok: false, error: 'Completá todos los campos.'};
        }

        if (newPassword !== confirmPassword) {
            return {ok: false, error: 'Las contraseñas no coinciden.'};
        }

        if (newPassword.length < 6) {
            return {ok: false,  error: 'La contraseña debe tener al menos 6 caracteres.'};
        }

        const mockUser = MOCK_USERS.find(u => u.id === user.id);

        if (mockUser.password !== currentPassword) {
            return {ok: false, error: 'La contraseña actual es incorrecta.'};
        }
        mockUser.password = newPassword;

        return {ok: true, message: 'Contraseña actualizada correctamente.'};
    }

    function deactivateAccount() {
        const updatedUser = {...user, estado: 'inactivo',};
        persistUser(updatedUser);

        return {ok: true, message: 'Cuenta dada de baja.'};
    }

    function sendSupportMessage(message) {
        console.log('Mensaje enviado a soporte:', {
            usuario: user.email,
            mensaje: message,
            fecha: new Date(),
        });
        return {ok: true, message: 'Mensaje enviado correctamente.'};
    }

    return (
        <AuthContext.Provider
            value={{user, login, logout, updateProfile, changePassword, deactivateAccount, sendSupportMessage,}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    }
    return ctx;
}