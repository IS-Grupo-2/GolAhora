// src/pages/dashboard/EmpleadosPage.jsx
import { useState, useEffect, useCallback } from 'react';
import EmpleadosTable from '../../components/empleados/EmpleadosTable';
import EmpleadoModal from '../../components/empleados/EmpleadoModal';
import EmpleadoModalDetalle from '../../components/empleados/EmpleadoModalDetalle';
import EmpleadoModalBaja from '../../components/empleados/EmpleadoModalBaja';
import Can from '../../components/Can';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useEmpleados } from '../../context/EmpleadosContext';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.tipo} toast-show`}>
                    <i data-lucide={t.tipo === 'success' ? 'check-circle-2' : t.tipo === 'warning' ? 'alert-triangle' : 'info'} />
                    <span>{t.mensaje}</span>
                </div>
            ))}
        </div>
    );
}

// ── Contenido de la Página ────────────────────────────────────────────────────
export default function EmpleadosPageContent() {
    const { empleados, loading, error, crearEmpleado, modificarEmpleado, darDeBaja } = useEmpleados();
    
    const [filtro, setFiltro] = useState('');
    const [toasts, setToasts] = useState([]);

    const [modalForm, setModalForm] = useState({ open: false, modo: 'nuevo', empleado: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, empleado: null });
    const [modalBaja, setModalBaja] = useState({ open: false, empleado: null });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    async function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            await modificarEmpleado(datos);
            mostrarToast('Empleado actualizado correctamente.', 'success');
        } else {
            await crearEmpleado(datos);
            mostrarToast('Empleado registrado correctamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', empleado: null });
    }

    async function handleToggleEstado(empleado) {
        await darDeBaja(empleado.idUsuario);
        const deBaja = empleado.activo;
        mostrarToast(
            deBaja ? `${empleado.nombre} fue dado de baja.` : `${empleado.nombre} fue reactivado.`,
            deBaja ? 'warning' : 'success'
        );
        setModalBaja({ open: false, empleado: null });
    }

    const abrirNuevo = () => setModalForm({ open: true, modo: 'nuevo', empleado: null });
    const abrirEditar = (e) => setModalForm({ open: true, modo: 'editar', empleado: e });
    const abrirDetalle = (e) => setModalDetalle({ open: true, empleado: e });
    const abrirBaja = (e) => setModalBaja({ open: true, empleado: e });

    const activos = empleados.filter(e => e.activo).length;
    const inactivos = empleados.filter(e => !e.activo).length;

    const empleadosFiltrados = filtro
        ? empleados.filter(e => {
              const q = filtro.toLowerCase();
              return (
                  `${e.nombre} ${e.apellido}`.toLowerCase().includes(q) ||
                  (e.cargo || '').toLowerCase().includes(q) ||
                  (e.sector || '').toLowerCase().includes(q)
              );
          })
        : empleados;

    if (loading) return <LoadingSpinner message="Cargando empleados..." />;
    if (error) return <ErrorMessage message={`Ocurrió un error: ${error}`} />;

    return (
        <Can 
            roles={['Admin']} 
            fallback={<ErrorMessage message="Acceso denegado. Solo administradores pueden ver esta sección." />}
        >
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
                            placeholder="Buscar por nombre, cargo o sector..."
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
            <EmpleadoModal open={modalForm.open} modo={modalForm.modo} empleado={modalForm.empleado} onGuardar={handleGuardar} onCerrar={() => setModalForm({ open: false, modo: 'nuevo', empleado: null })} />
            <EmpleadoModalDetalle open={modalDetalle.open} empleado={modalDetalle.empleado} onCerrar={() => setModalDetalle({ open: false, empleado: null })} />
            <EmpleadoModalBaja open={modalBaja.open} empleado={modalBaja.empleado} onConfirmar={handleToggleEstado} onCerrar={() => setModalBaja({ open: false, empleado: null })} />
            
            <Toast toasts={toasts} />
        </Can>
    );
}

