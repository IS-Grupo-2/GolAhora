// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

/**
 * Usuarios de prueba para desarrollo.
 * Reemplazar con llamadas a la API real cuando esté lista.
 */
const MOCK_USERS = [
    { id: 1, nombre: 'Franco',   email: 'admin@golahora.com',    password: '123456', rol: 'admin'    },
    { id: 2, nombre: 'Carla',    email: 'empleado@golahora.com', password: '123456', rol: 'empleado' },
    { id: 3, nombre: 'Rodrigo',  email: 'profe@golahora.com',    password: '123456', rol: 'profesor' },
    { id: 4, nombre: 'Lucía',    email: 'cliente@golahora.com',  password: '123456', rol: 'cliente'  },
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('gol_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    /**
     * login({ email, password }) → { ok, error }
     * Reemplazar el MOCK con fetch('/api/auth/login', ...) cuando haya backend.
     */
    function login({ email, password }) {
        const found = MOCK_USERS.find(
            u => u.email === email && u.password === password
        );

        if (!found) return { ok: false, error: 'Credenciales incorrectas.' };

        const { password: _pw, ...safeUser } = found; // nunca guardar la contraseña
        setUser(safeUser);
        localStorage.setItem('gol_user', JSON.stringify(safeUser));
        return { ok: true };
    }

    function logout() {
        setUser(null);
        localStorage.removeItem('gol_user');
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook de conveniencia */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}