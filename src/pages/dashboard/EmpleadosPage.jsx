// src/pages/dashboard/EmpleadosPage.jsx
import { useState, useEffect, useCallback } from 'react';
import EmpleadosTable       from '../../components/empleados/EmpleadosTable';
import EmpleadoModal        from '../../components/empleados/EmpleadoModal';
import EmpleadoModalDetalle from '../../components/empleados/EmpleadoModalDetalle';
import EmpleadoModalBaja    from '../../components/empleados/EmpleadoModalBaja';

// ── Datos Mock ──────────────────────────────────────────────────────────────
const INITIAL_EMPLEADOS = [
    { id: 1, nombre: 'Carlos',  apellido: 'Ramírez',   dni: '38455122', email: 'carlos.ramirez@golahora.com',   telefono: '11-44556677', userName: 'cramirez',   activo: true,  legajo: 'EMP-1001', fechaIngreso: '2024-06-01', cargo: 'Cajero',         turno: 'Mañana', sector: 'Recepción' },
    { id: 2, nombre: 'Martín',  apellido: 'López',     dni: '39200555', email: 'martin.lopez@golahora.com',     telefono: '11-55667788', userName: 'mlopez',     activo: true,  legajo: 'EMP-1002', fechaIngreso: '2024-05-15', cargo: 'Operador',       turno: 'Tarde',  sector: 'Cancha' },
    { id: 3, nombre: 'Analía',  apellido: 'González',  dni: '37800111', email: 'analia.gonzalez@golahora.com',  telefono: '11-66778899', userName: 'agonzalez',  activo: true,  legajo: 'EMP-1003', fechaIngreso: '2024-04-20', cargo: 'Administrativo', turno: 'Mañana', sector: 'Administración' },
    { id: 4, nombre: 'Roberto', apellido: 'Fernández', dni: '36500333', email: 'roberto.fernandez@golahora.com', telefono: '11-77889900', userName: 'rfernandez', activo: false, legajo: 'EMP-1004', fechaIngreso: '2024-03-10', cargo: 'Limpieza',       turno: 'Noche',  sector: 'Mantenimiento' }
];

// ── Toast Interno ─────────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.tipo} toast-show`}>
                    <i data-lucide={
                        t.tipo === 'success' ? 'check-circle-2'
                        : t.tipo === 'warning' ? 'alert-triangle'
                        : 'info'
                    } />
                    <span>{t.mensaje}</span>
                </div>
            ))}
        </div>
    );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState(INITIAL_EMPLEADOS);
    const [nextId,    setNextId]    = useState(5);
    const [filtro,    setFiltro]    = useState('');
    const [toasts,    setToasts]    = useState([]);

    // Estados de Modales
    const [modalForm,    setModalForm]    = useState({ open: false, modo: 'nuevo', empleado: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, empleado: null });
    const [modalBaja,    setModalBaja]    = useState({ open: false, empleado: null });

    // Lucide Icons
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    // ── Toast ──────────────────────────────────────────────────────────────────
    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // ── CRUD Handlers ──────────────────────────────────────────────────────────
    function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            setEmpleados(prev =>
                prev.map(e => e.id === datos.id ? { ...e, ...datos } : e)
            );
            mostrarToast('Empleado actualizado correctamente.', 'success');
        } else {
            const nuevo = {
                ...datos,
                id: nextId,
                activo: true,
                fechaIngreso: new Date().toISOString().split('T')[0],
            };
            setEmpleados(prev => [...prev, nuevo]);
            setNextId(n => n + 1);
            mostrarToast('Nuevo empleado registrado correctamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', empleado: null });
    }

    function handleToggleEstado(empleado) {
        const estadoAnterior = empleado.activo;
        setEmpleados(prev =>
            prev.map(e => e.id === empleado.id
                ? { ...e, activo: !estadoAnterior }
                : e
            )
        );
        mostrarToast(
            !estadoAnterior ? 'Empleado reactivado correctamente' : 'Empleado dado de baja correctamente',
            !estadoAnterior ? 'success' : 'warning'
        );
        setModalBaja({ open: false, empleado: null });
    }

    // ── Modal Openers ──────────────────────────────────────────────────────────
    const abrirNuevo   = ()  => setModalForm({ open: true, modo: 'nuevo', empleado: null });
    const abrirEditar  = (e) => setModalForm({ open: true, modo: 'editar', empleado: e });
    const abrirDetalle = (e) => setModalDetalle({ open: true, empleado: e });
    const abrirBaja    = (e) => setModalBaja({ open: true, empleado: e });

    function handleEditarDesdeDetalle(e) {
        setModalDetalle({ open: false, empleado: null });
        abrirEditar(e);
    }

    // ── Filtros y Stats ────────────────────────────────────────────────────────
    const activos   = empleados.filter(e => e.activo).length;
    const inactivos = empleados.filter(e => !e.activo).length;

    const empleadosFiltrados = filtro
        ? empleados.filter(e => {
              const q = filtro.toLowerCase();
              return (
                  `${e.nombre} ${e.apellido}`.toLowerCase().includes(q) ||
                  e.dni.includes(q) ||
                  e.email.toLowerCase().includes(q) ||
                  e.legajo.toLowerCase().includes(q) ||
                  e.userName.toLowerCase().includes(q)
              );
          })
        : empleados;

    return (
        <>
            {/* TOOLBAR */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Empleados</h2>
                    <span className="crud-count">{empleados.length} total</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input
                            type="text"
                            placeholder="Buscar empleado..."
                            value={filtro}
                            onChange={e => setFiltro(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <button className="btn-primary-action" onClick={abrirNuevo}>
                        <i data-lucide="user-plus" />
                        Nuevo empleado
                    </button>
                </div>
            </div>

            {/* MINI STATS */}
            <div className="crud-mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-num">{empleados.length}</span>
                    <span className="mini-stat-label">Total</span>
                </div>
                <div className="mini-stat green">
                    <span className="mini-stat-num">{activos}</span>
                    <span className="mini-stat-label">Activos</span>
                </div>
                <div className="mini-stat red">
                    <span className="mini-stat-num">{inactivos}</span>
                    <span className="mini-stat-label">Inactivos</span>
                </div>
            </div>

            {/* TABLA */}
            <div className="panel-card tabla-panel">
                <EmpleadosTable
                    empleados={empleadosFiltrados}
                    filtro={filtro}
                    onLimpiarFiltro={() => setFiltro('')}
                    onVer={abrirDetalle}
                    onEditar={abrirEditar}
                    onBaja={abrirBaja}
                />
            </div>

            {/* MODALES */}
            <EmpleadoModal
                open={modalForm.open}
                modo={modalForm.modo}
                empleado={modalForm.empleado}
                onGuardar={handleGuardar}
                onCerrar={() => setModalForm({ open: false, modo: 'nuevo', empleado: null })}
            />

            <EmpleadoModalDetalle
                open={modalDetalle.open}
                empleado={modalDetalle.empleado}
                onCerrar={() => setModalDetalle({ open: false, empleado: null })}
                onEditar={handleEditarDesdeDetalle}
            />

            <EmpleadoModalBaja
                open={modalBaja.open}
                empleado={modalBaja.empleado}
                onConfirmar={handleToggleEstado}
                onCerrar={() => setModalBaja({ open: false, empleado: null })}
            />

            {/* TOASTS */}
            <Toast toasts={toasts} />
        </>
    );
}