// src/hooks/useRole.js
import { useAuth } from '../context/AuthContext';

export default function useRole() {
    const { user } = useAuth();
    const rol = user?.rol ?? 'cliente';

    const isAdmin = rol === 'admin';
    const isEmpleado = rol === 'empleado';
    const isProfesor = rol === 'profesor';
    const isCliente = rol === 'cliente';

    const can = (...roles) => {
        if (!roles || roles.length === 0) return false;
        return roles.includes(rol);
    };

    return {
        rol,
        isAdmin,
        isEmpleado,
        isProfesor,
        isCliente,
        can,
    };
}