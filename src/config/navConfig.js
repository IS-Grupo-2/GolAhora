// src/config/navConfig.js

export const ROLES = {
    ADMIN:    'Admin',
    EMPLOYEE: 'Employee',
    PROFESSOR: 'Professor',
    CLIENT:  'Client',
};

export const NAV_CONFIG = [
    {
        section: 'General',
        items: [
            {
                path:  '/dashboard',
                end:   true,
                label: 'Dashboard',
                icon:  'layout-dashboard',
                roles: ['Admin', 'Employee', 'Professor', 'Client'],
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
                roles: ['Admin', 'Employee', 'Professor', 'Client'],
            },
            {
                path:  '/dashboard/canchas',
                label: 'Canchas',
                icon:  'goal',
                roles: ['Admin', 'Employee', 'Professor', 'Client'],
            },
            {
                path:  '/dashboard/torneos',
                label: 'Torneos',
                icon:  'trophy',
                roles: ['Admin', 'Employee', 'Professor', 'Client'],
            },
            {
                path:  '/dashboard/clases',
                label: 'Clases',
                icon:  'dumbbell',
                roles: ['Admin', 'Employee', 'Professor', 'Client'],
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
                roles: ['Admin', 'Employee'],
            },
            {
                path:  '/dashboard/profesores',
                label: 'Profesores',
                icon:  'user-round',
                roles: ['Admin', 'Employee'],
            },
            {
                path:  '/dashboard/empleados',
                label: 'Empleados',
                icon:  'briefcase',
                roles: ['Admin'],
            },
            {
                path:  '/dashboard/asistencias',
                label: 'Asistencias',
                icon:  'clipboard-check',
                roles: ['Admin', 'Employee', 'Professor'], 
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
                roles: ['Admin', 'Employee'],
            },
            {
                path:  '/dashboard/recibos',
                label: 'Recibos',
                icon:  'receipt',
                roles: ['Admin', 'Employee'],
            },
            {
                path:  '/dashboard/reportes',
                label: 'Reportes',
                icon:  'bar-chart-3',
                roles: ['Admin', 'Employee'],
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
                roles: ['Admin', 'Employee', 'Professor', 'Client'],
            },
        ],
    },
];

export function getNavForRole(role) {
    return NAV_CONFIG
        .map(section => ({
            ...section,
            items: section.items.filter(item => item.roles.includes(role)),
        }))
        .filter(section => section.items.length > 0);
}