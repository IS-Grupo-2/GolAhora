// src/pages/dashboard/UsuariosPage.jsx
import { useState, useEffect, useCallback } from 'react';
import UsuariosTable from '../../components/usuarios/UsuariosTable';
import UsuarioModal from '../../components/usuarios/UsuarioModal';
import UsuarioModalDetalle from '../../components/usuarios/UsuarioModalDetalle';
import UsuarioModalBaja from '../../components/usuarios/UsuarioModalBaja';
import Can from '../../components/Can';
import { ClientesProvider, useClientes } from '../../context/ClientesContext';
import '../../styles/pages/usuarios.css';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

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
function UsuariosPageContent() {
    // Usamos el contexto en lugar del estado local
    const { clientes, loading, error, crearCliente, modificarCliente, darDeBaja } = useClientes();
    
    const [filtro, setFiltro] = useState('');
    const [toasts, setToasts] = useState([]);

    // Modales
    const [modalForm, setModalForm] = useState({ open: false, modo: 'nuevo', usuario: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, usuario: null });
    const [modalBaja, setModalBaja] = useState({ open: false, usuario: null });

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
            await modificarCliente(datos);
            mostrarToast('Cliente actualizado correctamente.', 'success');
        } else {
            await crearCliente(datos);
            mostrarToast('Cliente registrado correctamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', usuario: null });
    }

    async function handleToggleEstado(usuario) {
        await darDeBaja(usuario.idUsuario); // Usamos idUsuario que viene del mock
        const deBaja = usuario.activo;
        mostrarToast(
            deBaja
                ? `${usuario.nombre} ${usuario.apellido} fue dado de baja.`
                : `${usuario.nombre} ${usuario.apellido} fue reactivado.`,
            deBaja ? 'warning' : 'success'
        );
        setModalBaja({ open: false, usuario: null });
    }

    // ── Modal openers ──
    const abrirNuevo = () => setModalForm({ open: true, modo: 'nuevo', usuario: null });
    const abrirEditar = (u) => setModalForm({ open: true, modo: 'editar', usuario: u });
    const abrirDetalle = (u) => setModalDetalle({ open: true, usuario: u });
    const abrirBaja = (u) => setModalBaja({ open: true, usuario: u });

    function handleEditarDesdeDetalle(u) {
        setModalDetalle({ open: false, usuario: null });
        abrirEditar(u);
    }

    // ── Stats ──
    const activos = clientes.filter(u => u.activo).length;
    const inactivos = clientes.filter(u => !u.activo).length;

    const usuariosFiltrados = filtro
        ? clientes.filter(u => {
              const q = filtro.toLowerCase();
              return (
                  `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
                  u.dni.includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  u.userName.toLowerCase().includes(q)
              );
          })
        : clientes;

    if (loading) return <LoadingSpinner message="Cargando clientes..." />;
    if (error) return <ErrorMessage message={`Ocurrió un error: ${error}`} />;

    return (
        <>
            {/* TOOLBAR */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Clientes</h2>
                    <span className="crud-count">{clientes.length} total</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI o email…"
                            value={filtro}
                            onChange={e => setFiltro(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    {/* Componente Can protegiendo el botón de crear */}
                    <Can roles={['admin', 'empleado']}>
                        <button className="btn-primary-action" onClick={abrirNuevo}>
                            <i data-lucide="user-plus" />
                            Nuevo cliente
                        </button>
                    </Can>
                </div>
            </div>

            {/* MINI STATS */}
            <div className="crud-mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-num">{clientes.length}</span>
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
                <UsuariosTable
                    usuarios={usuariosFiltrados}
                    filtro={filtro}
                    onLimpiarFiltro={() => setFiltro('')}
                    onVer={abrirDetalle}
                    onEditar={abrirEditar}
                    onBaja={abrirBaja}
                />
            </div>

            {/* MODALES */}
            <UsuarioModal
                open={modalForm.open}
                modo={modalForm.modo}
                usuario={modalForm.usuario}
                onGuardar={handleGuardar}
                onCerrar={() => setModalForm({ open: false, modo: 'nuevo', usuario: null })}
            />

            <UsuarioModalDetalle
                open={modalDetalle.open}
                usuario={modalDetalle.usuario}
                onCerrar={() => setModalDetalle({ open: false, usuario: null })}
                onEditar={handleEditarDesdeDetalle}
            />

            <UsuarioModalBaja
                open={modalBaja.open}
                usuario={modalBaja.usuario}
                onConfirmar={handleToggleEstado}
                onCerrar={() => setModalBaja({ open: false, usuario: null })}
            />

            {/* TOASTS */}
            <Toast toasts={toasts} />
        </>
    );
}

// ── Export default envolviendo en el Provider ─────────────────────────────────
export default function UsuariosPage() {
    return (
        <ClientesProvider>
            <UsuariosPageContent />
        </ClientesProvider>
    );
}