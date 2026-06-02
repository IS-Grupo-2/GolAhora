// src/pages/dashboard/ClasesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useClases, PROFESORES_DISPONIBLES, ALUMNOS_DISPONIBLES } from '../../context/ClasesContext';
import ClasesTable      from '../../components/clases/ClasesTable';
import ClaseModal       from '../../components/clases/ClaseModal';
import AsistenciaModal  from '../../components/clases/AsistenciaModal';
import ClaseModalDetalle from '../../components/clases/ClaseModalDetalle';
import ClaseModalBaja   from '../../components/clases/ClaseModalBaja';
import Can              from '../../components/Can';
import LoadingSpinner   from '../../components/ui/LoadingSpinner';
import ErrorMessage     from '../../components/ui/ErrorMessage';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.tipo} toast-show`}>
                    <i data-lucide={
                        t.tipo === 'success' ? 'check-circle-2' :
                        t.tipo === 'warning' ? 'alert-triangle' :
                        'info'
                    } />
                    <span>{t.mensaje}</span>
                </div>
            ))}
        </div>
    );
}

// ── Contenido interno (consume el contexto) ───────────────────────────────────
export default function ClasesPageContent() {
    const {
        clases,
        loading,
        error,
        fetchClases,
        crearClase,
        modificarClase,
        cancelarClase,
        registrarAsistencia,
    } = useClases();

    const [filtro,  setFiltro]  = useState('');
    const [toasts,  setToasts]  = useState([]);

    // Estado de modales
    const [modalForm,       setModalForm]       = useState({ open: false, modo: 'nuevo', clase: null });
    const [modalAsistencia, setModalAsistencia] = useState({ open: false, clase: null });
    const [modalDetalle,    setModalDetalle]    = useState({ open: false, clase: null });
    const [modalBaja,       setModalBaja]       = useState({ open: false, clase: null });

    // Fetch al montar
    useEffect(() => { fetchClases(); }, [fetchClases]);

    // Re-inicializar íconos Lucide en cada render
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    // ── Toast ──────────────────────────────────────────────────────────────────
    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // ── Handlers ───────────────────────────────────────────────────────────────
    async function handleGuardar(datos) {
        try {
            if (modalForm.modo === 'editar') {
                await modificarClase(datos);
                mostrarToast('Clase actualizada correctamente.', 'success');
            } else {
                await crearClase(datos);
                mostrarToast('Clase programada exitosamente.', 'success');
            }
            setModalForm({ open: false, modo: 'nuevo', clase: null });
        } catch {
            mostrarToast('Ocurrió un error. Intentá de nuevo.', 'error');
        }
    }

    async function handleAsistencia(idClase, recordAsistencias) {
        try {
            await registrarAsistencia(idClase, recordAsistencias);
            mostrarToast('Asistencia registrada correctamente.', 'success');
            setModalAsistencia({ open: false, clase: null });
        } catch {
            mostrarToast('Error al registrar asistencia.', 'error');
        }
    }

    async function handleToggleEstado(clase) {
        try {
            await cancelarClase(clase.idClase);
            const esCancelada = clase.estado === 'cancelada';
            mostrarToast(
                esCancelada ? 'Clase reprogramada con éxito.' : 'Clase cancelada correctamente.',
                esCancelada ? 'success' : 'warning'
            );
            setModalBaja({ open: false, clase: null });
        } catch {
            mostrarToast('Error al cambiar estado de la clase.', 'error');
        }
    }

    // ── Filtrado y stats ───────────────────────────────────────────────────────
    const clasesFiltradas = filtro
        ? clases.filter(c =>
            c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            c.tipoClase.toLowerCase().includes(filtro.toLowerCase())
          )
        : clases;

    const programadas = clases.filter(c => c.estado === 'programada').length;
    const canceladas  = clases.filter(c => c.estado === 'cancelada').length;

    // ── Render ─────────────────────────────────────────────────────────────────
    if (loading) return <LoadingSpinner />;
    if (error)   return <ErrorMessage message={error} />;

    return (
        <>
            {/* TOOLBAR */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Gestión de Clases</h2>
                    <span className="crud-count">{clases.length} total</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input
                            type="text"
                            placeholder="Buscar clase..."
                            value={filtro}
                            onChange={e => setFiltro(e.target.value)}
                        />
                    </div>

                    {/* Solo admin y empleado pueden programar clases */}
                    <Can roles={['admin', 'empleado']}>
                        <button
                            className="btn-primary-action"
                            onClick={() => setModalForm({ open: true, modo: 'nuevo', clase: null })}
                        >
                            <i data-lucide="calendar-plus" /> Programar Clase
                        </button>
                    </Can>
                </div>
            </div>

            {/* MINI STATS — visibles para todos */}
            <div className="crud-mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-num">{clases.length}</span>
                    <span className="mini-stat-label">Total</span>
                </div>
                <div className="mini-stat green">
                    <span className="mini-stat-num">{programadas}</span>
                    <span className="mini-stat-label">Programadas</span>
                </div>
                <div className="mini-stat red">
                    <span className="mini-stat-num">{canceladas}</span>
                    <span className="mini-stat-label">Canceladas</span>
                </div>
            </div>

            {/* TABLA — visible para todos los roles */}
            <div className="panel-card tabla-panel">
                <ClasesTable
                    clases={clasesFiltradas}
                    filtro={filtro}
                    onLimpiarFiltro={() => setFiltro('')}
                    onVer={(c) => setModalDetalle({ open: true, clase: c })}
                    onEditar={(c) => setModalForm({ open: true, modo: 'editar', clase: c })}
                    onAsistencia={(c) => setModalAsistencia({ open: true, clase: c })}
                    onCancelar={(c) => setModalBaja({ open: true, clase: c })}
                />
            </div>

            {/* MODAL CREAR / EDITAR — admin y empleado */}
            <Can roles={['admin', 'empleado']}>
                <ClaseModal
                    open={modalForm.open}
                    modo={modalForm.modo}
                    clase={modalForm.clase}
                    profesoresDisp={PROFESORES_DISPONIBLES}
                    alumnosDisp={ALUMNOS_DISPONIBLES}
                    onGuardar={handleGuardar}
                    onCerrar={() => setModalForm({ open: false, modo: 'nuevo', clase: null })}
                />
            </Can>

            {/* MODAL ASISTENCIA — admin, empleado y profesor */}
            <Can roles={['admin', 'empleado', 'profesor']}>
                <AsistenciaModal
                    open={modalAsistencia.open}
                    clase={modalAsistencia.clase}
                    onGuardar={handleAsistencia}
                    onCerrar={() => setModalAsistencia({ open: false, clase: null })}
                />
            </Can>

            {/* MODAL DETALLE — todos los roles */}
            <ClaseModalDetalle
                open={modalDetalle.open}
                clase={modalDetalle.clase}
                onCerrar={() => setModalDetalle({ open: false, clase: null })}
            />

            {/* MODAL CANCELAR — admin y empleado */}
            <Can roles={['admin', 'empleado']}>
                <ClaseModalBaja
                    open={modalBaja.open}
                    clase={modalBaja.clase}
                    onConfirmar={handleToggleEstado}
                    onCerrar={() => setModalBaja({ open: false, clase: null })}
                />
            </Can>

            <Toast toasts={toasts} />
        </>
    );
}
