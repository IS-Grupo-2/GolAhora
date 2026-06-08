// src/pages/dashboard/ProfesoresPage.jsx
import { useState, useEffect, useCallback } from 'react';
import ProfesoresTable from '../../components/profesores/ProfesoresTable';
import ProfesorModal from '../../components/profesores/ProfesorModal';
import ProfesorModalDetalle from '../../components/profesores/ProfesorModalDetalle';
import ProfesorModalBaja from '../../components/profesores/ProfesorModalBaja';
import Can from '../../components/Can';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useProfesores } from '../../context/ProfesoresContext';
import { useAuth } from '../../context/AuthContext';
import { verificarCertificacionesProfesor } from '../../utils/profesoresCertificacion';

// ── Toast interno ─────────────────────────────────────────────────────────────
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

// ── Contenido de la Página ────────────────────────────────────────────────────
function esProfesorActual(profesor, user) {
    if (!user || user.role !== 'Professor') return true;

    const idsUsuario = [user.idUsuario, user.id].filter(Boolean).map(String);
    const idsProfesor = [profesor.idUsuario, profesor.id].filter(Boolean).map(String);

    if (idsUsuario.some(id => idsProfesor.includes(id))) return true;

    const emailUsuario = user.email?.toLowerCase();
    const emailProfesor = profesor.email?.toLowerCase();
    if (emailUsuario && emailProfesor && emailUsuario === emailProfesor) return true;

    const usernameUsuario = (user.username || user.userName)?.toLowerCase();
    const usernameProfesor = (profesor.username || profesor.userName)?.toLowerCase();
    return Boolean(usernameUsuario && usernameProfesor && usernameUsuario === usernameProfesor);
}

function normalizarBusqueda(valor) {
    return String(valor || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export default function ProfesoresPageContent() {
    const { profesores, loading, error, crearProfesor, modificarProfesor, darDeBaja } = useProfesores();
    const { user } = useAuth();
    
    const [filtro, setFiltro] = useState('');
    const [toasts, setToasts] = useState([]);

    // Estado de modales
    const [modalForm,    setModalForm]    = useState({ open: false, modo: 'nuevo', profesor: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, profesor: null });
    const [modalBaja,    setModalBaja]    = useState({ open: false, profesor: null });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // ── CRUD handlers conectados al Contexto ──
    async function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            await modificarProfesor(datos);
            mostrarToast('Profesor actualizado correctamente.', 'success');
        } else {
            await crearProfesor(datos);
            mostrarToast('Profesor registrado correctamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', profesor: null });
    }

    async function handleToggleEstado(profesor) {
        await darDeBaja(profesor.idUsuario);
        const deBaja = profesor.activo ?? (profesor.estado === 'activo');
        mostrarToast(
            deBaja
                ? `${profesor.nombre} ${profesor.apellido} fue dado de baja.`
                : `${profesor.nombre} ${profesor.apellido} fue reactivado.`,
            deBaja ? 'warning' : 'success'
        );
        setModalBaja({ open: false, profesor: null });
    }

    async function handleVerificarCertificacion(profesor) {
        const profesorActualizado = verificarCertificacionesProfesor(profesor);
        await modificarProfesor(profesorActualizado);

        mostrarToast(
            `Certificacion de ${profesor.nombre} ${profesor.apellido} verificada correctamente.`,
            'success'
        );
    }

    // ── Abrir modales ──
    const abrirNuevo   = ()  => setModalForm({ open: true, modo: 'nuevo',  profesor: null });
    const abrirEditar  = (p) => setModalForm({ open: true, modo: 'editar', profesor: p });
    const abrirDetalle = (p) => setModalDetalle({ open: true, profesor: p });
    const abrirBaja    = (p) => setModalBaja({ open: true, profesor: p });

    // ── Stats y Filtrado ──
    const profesoresBase = Array.isArray(profesores) ? profesores : [];
    const profesoresVisibles = user?.role === 'Professor'
        ? profesoresBase.filter(p => esProfesorActual(p, user))
        : profesoresBase;

    const activos   = profesoresVisibles.filter(p => p.activo).length;
    const inactivos = profesoresVisibles.filter(p => !p.activo).length;

    const busqueda = normalizarBusqueda(filtro.trim());
    const profesoresFiltrados = busqueda
        ? profesoresVisibles.filter(p => [
              p?.nombre,
              p?.apellido,
              p?.especialidad,
              p?.email,
              p?.username,
              p?.userName,
              p?.telefono,
          ].some(valor => normalizarBusqueda(valor).includes(busqueda)))
        : profesoresVisibles;

    if (loading) return <LoadingSpinner message="Cargando profesores..." />;
    if (error) return <ErrorMessage message={`Ocurrió un error: ${error}`} />;

    return (
        <>
            {/* TOOLBAR */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Profesores</h2>
                    <span className="crud-count">{profesoresVisibles.length} total</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input
                            type="text"
                            placeholder="Buscar profesor..."
                            value={filtro}
                            onChange={e => setFiltro(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    {/* Componente Can protegiendo el botón de crear */}
                    <Can roles={['Admin']}>
                        <button className="btn-primary-action" onClick={abrirNuevo}>
                            <i data-lucide="user-plus" />
                            Nuevo profesor
                        </button>
                    </Can>
                </div>
            </div>

            {/* MINI STATS */}
            <div className="crud-mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-num">{profesoresVisibles.length}</span>
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
                <ProfesoresTable
                    profesores={profesoresFiltrados}
                    filtro={filtro}
                    onLimpiarFiltro={() => setFiltro('')}
                    onVer={abrirDetalle}
                    onEditar={abrirEditar}
                    onBaja={abrirBaja}
                    onVerificarCertificacion={handleVerificarCertificacion}
                />
            </div>

            {/* MODALES */}
            <ProfesorModal
                open={modalForm.open}
                modo={modalForm.modo}
                profesor={modalForm.profesor}
                onGuardar={handleGuardar}
                onCerrar={() => setModalForm({ open: false, modo: 'nuevo', profesor: null })}
            />

            <ProfesorModalDetalle
                open={modalDetalle.open}
                profesor={modalDetalle.profesor}
                onCerrar={() => setModalDetalle({ open: false, profesor: null })}
            />

            <ProfesorModalBaja
                open={modalBaja.open}
                profesor={modalBaja.profesor}
                onConfirmar={handleToggleEstado}
                onCerrar={() => setModalBaja({ open: false, profesor: null })}
            />

            {/* TOASTS */}
            <Toast toasts={toasts} />
        </>
    );
}
