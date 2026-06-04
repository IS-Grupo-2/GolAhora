// src/hooks/useRole.js
import { useAuth } from '../context/AuthContext';

export default function useRole() {
    const { user } = useAuth();
    const rol = user?.role ?? 'Client';

    const isAdmin = rol === 'Admin';
    const isEmployee = rol === 'Employee';
    const isProfessor = rol === 'Professor';
    const isClient = rol === 'Client';

    const can = (...roles) => {
        if (!roles || roles.length === 0) return false;
        return roles.includes(rol);
    };

    return {
        rol,
        isAdmin,
        isEmployee,
        isProfessor,
        isClient,
        can,
    };
}