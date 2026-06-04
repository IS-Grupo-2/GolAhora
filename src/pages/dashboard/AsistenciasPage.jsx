// src/pages/dashboard/AsistenciasPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAsistencias } from '../../context/AsistenciasContext';
import { useClases } from '../../context/ClasesContext';
import AsistenciasTable      from '../../components/asistencias/AsistenciasTable';
import AsistenciaTomaModal   from '../../components/asistencias/AsistenciaTomaModal';
import AsistenciaDetalleModal from '../../components/asistencias/AsistenciaDetalleModal';
import Can                   from '../../components/Can';
import LoadingSpinner        from '../../components/ui/LoadingSpinner';
import ErrorMessage          from '../../components/ui/ErrorMessage';
import useRole               from '../../hooks/useRole';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.tipo} toast-show`}>
                    <i data-lucide={t.tipo === 'success' ? 'check-circle-2' : 'info'} />
                    <span>{t.mensaje}</span>
                </div>
            ))}
        </div>
    );
}

// ── Contenido interno ─────────────────────────────────────────────────────────
export default function AsistenciasPageContent() {
    const { user } = useAuth();
    const { isAdmin, isEmployee, isProfessor } = useRole();
    const {
        asistenciasPorClase,
        loading: loadingAsistencias,
        error: errorAsistencias,
        fetchAsistencias,
        registrarAsistencia,
        modificarAsistencia,
    } = useAsistencias();
    
    // Sincronizar clases desde ClasesContext (fuente de verdad única)
    const {
        clases,
        loading: loadingClases,
        error: errorClases,
    } = useClases();

    const [filtro,        setFiltro]        = useState('');
    const [toasts,        setToasts]        = useState([]);
    const [modalToma,     setModalToma]     = useState({ open: false, clase: null, esMod: false });
    const [modalDetalle,  setModalDetalle]  = useState({ open: false, clase: null });

    // Fetch al montar
    useEffect(() => { fetchAsistencias(); }, [fetchAsistencias]);

    // Re-inicializar íconos Lucide
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // ── Filtrado por rol ───────────────────────────────────────────────────────
    // admin y empleado ven TODAS las clases
    // profesor ve solo las que le pertenecen
    const clasesPorRol = (() => {
        if (isAdmin || isEmployee) return clases;
        if (isProfessor && user) return clases.filter(c => c.profesor?.id === user.id);
        return []; // cliente: no debería llegar aquí (bloqueado en router)
    })();

    const clasesFiltradas = filtro
        ? clasesPorRol.filter(c => c.nombre.toLowerCase().includes(filtro.toLowerCase()))
        : clasesPorRol;

    // ── Stats ──────────────────────────────────────────────────────────────────
    const totalClases       = clasesPorRol.length;
    const clasesConRegistro = clasesPorRol.filter(c => asistenciasPorClase[c.idClase]?.length > 0).length;
    const clasesPendientes  = totalClases - clasesConRegistro;

    // ── Handlers ───────────────────────────────────────────────────────────────
    async function handleGuardarAsistencia(idClase, arrayAsistenciasUML) {
        try {
            const tieneRegistro = asistenciasPorClase[idClase]?.length > 0;
            if (tieneRegistro) {
                await modificarAsistencia(idClase, arrayAsistenciasUML);
                mostrarToast('Asistencia actualizada correctamente.', 'success');
            } else {
                await registrarAsistencia(idClase, arrayAsistenciasUML);
                mostrarToast('Registro de asistencia guardado exitosamente.', 'success');
            }
            setModalToma({ open: false, clase: null, esMod: false });
        } catch {
            mostrarToast('Error al guardar el registro.', 'error');
        }
    }

    // ── Labels dinámicos por rol ───────────────────────────────────────────────
    const titulo    = (isAdmin || isEmployee) ? 'Gestión de Asistencias' : 'Mis Clases (Asistencia)';
    const subtitulo = (isAdmin || isEmployee) ? `${totalClases} clases en total` : `${totalClases} asignadas`;

    const loading = loadingClases || loadingAsistencias;
    const error = errorClases || errorAsistencias;

    if (loading) return <LoadingSpinner />;
    if (error)   return <ErrorMessage message={error} />;

    return (
        <>
            {/* TOOLBAR */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">{titulo}</h2>
                    <span className="crud-count">{subtitulo}</span>
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
                </div>
            </div>

            {/* MINI STATS */}
            <div className="crud-mini-stats">
                <div className="mini-stat blue">
                    <span className="mini-stat-num">{totalClases}</span>
                    <span className="mini-stat-label">
                        {(isAdmin || isEmployee) ? 'Total Clases' : 'Mis Clases'}
                    </span>
                </div>
                <div className="mini-stat green">
                    <span className="mini-stat-num">{clasesConRegistro}</span>
                    <span className="mini-stat-label">Listas Pasadas</span>
                </div>
                <div className="mini-stat red">
                    <span className="mini-stat-num">{clasesPendientes}</span>
                    <span className="mini-stat-label">Pendientes</span>
                </div>
            </div>

            {/* TABLA */}
            <div className="panel-card tabla-panel">
                <AsistenciasTable
                    clases={clasesFiltradas}
                    asistenciasPorClase={asistenciasPorClase}
                    filtro={filtro}
                    onLimpiarFiltro={() => setFiltro('')}
                    onVer={(c) => setModalDetalle({ open: true, clase: c })}
                    onTomar={(c, esMod) => setModalToma({ open: true, clase: c, esMod })}
                />
            </div>

            {/* MODAL TOMAR / MODIFICAR ASISTENCIA — admin, empleado y profesor */}
            <Can roles={['Admin', 'Employee', 'Professor']}>
                <AsistenciaTomaModal
                    open={modalToma.open}
                    clase={modalToma.clase}
                    registrosPrevios={modalToma.clase ? (asistenciasPorClase[modalToma.clase.idClase] || []) : []}
                    onGuardar={handleGuardarAsistencia}
                    onCerrar={() => setModalToma({ open: false, clase: null, esMod: false })}
                />
            </Can>

            {/* MODAL DETALLE — admin, empleado y profesor */}
            <Can roles={['Admin', 'Employee', 'Professor']}>
                <AsistenciaDetalleModal
                    open={modalDetalle.open}
                    clase={modalDetalle.clase}
                    registros={modalDetalle.clase ? (asistenciasPorClase[modalDetalle.clase.idClase] || []) : []}
                    onCerrar={() => setModalDetalle({ open: false, clase: null })}
                />
            </Can>

            {/* Bloqueo explícito para cliente (refuerzo del router) */}
            <Can roles={['Client']}>
                <div className="tabla-empty" style={{ marginTop: '2rem' }}>
                    <i data-lucide="lock" />
                    <p>No tenés permisos para ver esta sección.</p>
                </div>
            </Can>

            <Toast toasts={toasts} />
        </>
    );
}
