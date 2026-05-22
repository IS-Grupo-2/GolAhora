// =====================================================
//  CONFIGURACIÓN DE NAVEGACIÓN Y ROLES
// =====================================================

export const ROLES = {
    ADMIN:    'admin',
    EMPLEADO: 'empleado',
    PROFESOR: 'profesor',
    CLIENTE:  'cliente',
};

/**
 * Cada ítem define qué roles pueden verlo.
 * Agregar o quitar roles según reglas de negocio.
 */
export const NAV_CONFIG = [
    {
        section: 'General',
        items: [
            {
                path:  '/dashboard',
                end:   true,           // NavLink exact match
                label: 'Dashboard',
                icon:  'layout-dashboard',
                roles: ['admin', 'empleado', 'profesor', 'cliente'],
            },
        ],
    },
    {
        section: 'Operaciones',
        items: [
            {
                path:  '/dashboard/reservas',
                label: 'Reservas',
                icon:  'calendar-days',
                roles: ['admin', 'empleado', 'cliente'],
            },
            {
                path:  '/dashboard/canchas',
                label: 'Canchas',
                icon:  'goal',
                roles: ['admin', 'empleado'],
            },
            {
                path:  '/dashboard/torneos',
                label: 'Torneos',
                icon:  'trophy',
                roles: ['admin', 'empleado'],
            },
            {
                path:  '/dashboard/clases',
                label: 'Clases',
                icon:  'dumbbell',
                roles: ['admin', 'empleado', 'profesor', 'cliente'],
            },
        ],
    },
    {
        section: 'Personas',
        items: [
            {
                path:  '/dashboard/clientes',
                label: 'Clientes',
                icon:  'users',
                roles: ['admin', 'empleado'],
            },
            {
                path:  '/dashboard/profesores',
                label: 'Profesores',
                icon:  'user-round',
                roles: ['admin'],
            },
            {
                path:  '/dashboard/empleados',
                label: 'Empleados',
                icon:  'briefcase',
                roles: ['admin'],
            },
            {
                path:  '/dashboard/asistencias',
                label: 'Asistencias',
                icon:  'clipboard-check',
                roles: ['admin', 'empleado', 'profesor'],
            },
        ],
    },
    {
        section: 'Finanzas',
        items: [
            {
                path:  '/dashboard/cobros',
                label: 'Cobros',
                icon:  'wallet',
                roles: ['admin', 'empleado'],
            },
            {
                path:  '/dashboard/recibos',
                label: 'Recibos',
                icon:  'receipt',
                roles: ['admin', 'empleado'],
            },
            {
                path:  '/dashboard/reportes',
                label: 'Reportes',
                icon:  'bar-chart-3',
                roles: ['admin'],
            },
        ],
    },
    {
        section: 'Sistema',
        items: [
            {
                path:  '/dashboard/configuracion',
                label: 'Configuración',
                icon:  'settings',
                roles: ['admin'],
            },
        ],
    },
];

/**
 * Filtra la config de nav según el rol del usuario.
 * Devuelve solo las secciones/ítems visibles para ese rol.
 */
export function getNavForRole(role) {
    return NAV_CONFIG
        .map(section => ({
            ...section,
            items: section.items.filter(item => item.roles.includes(role)),
        }))
        .filter(section => section.items.length > 0);
}