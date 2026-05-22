// src/pages/dashboard/UsuariosPage.jsx
import { useState, useEffect, useCallback } from 'react';
import UsuariosTable from '../../components/usuarios/UsuariosTable';
import UsuarioModal from '../../components/usuarios/UsuarioModal';
import UsuarioModalDetalle from '../../components/usuarios/UsuarioModalDetalle';
import UsuarioModalBaja from '../../components/usuarios/UsuarioModalBaja';
import '../../styles/pages/usuarios.css';

// ── Datos iniciales (reemplazar por fetch al backend) ─────────────────────────
const INITIAL_USUARIOS = [
    { id: 1, nombre: 'Juan',      apellido: 'Pérez',     fechaNacimiento: '1998-04-12', nroSocio: 'SOC-1001', dni: '40255711', email: 'juan@mail.com',           telefono: '11-2222-3333', username: 'juanp',   estado: 'activo',   fechaAlta: '2025-03-15' },
    { id: 2, nombre: 'Martín',    apellido: 'López',     fechaNacimiento: '2000-05-12', nroSocio: 'SOC-1003', dni: '38741200', email: 'martin.l@mail.com',        telefono: '11-3456-7890', username: 'martinl', estado: 'activo',   fechaAlta: '2025-02-03' },
    { id: 3, nombre: 'Camila',    apellido: 'Torres',    fechaNacimiento: '1998-07-02', nroSocio: 'SOC-1004', dni: '42100055', email: 'cami.torres@gmail.com',    telefono: '11-4567-8901', username: 'camit',   estado: 'activo',   fechaAlta: '2025-02-18' },
    { id: 4, nombre: 'Lucas',     apellido: 'Díaz',      fechaNacimiento: '1999-08-15', nroSocio: 'SOC-1005', dni: '39800123', email: 'lucas.diaz@mail.com',      telefono: '11-5678-9012', username: 'lucasd',  estado: 'inactivo', fechaAlta: '2025-03-01' },
    { id: 5, nombre: 'Valentina', apellido: 'García',    fechaNacimiento: '2000-01-20', nroSocio: 'SOC-1006', dni: '44301987', email: 'vale.garcia@mail.com',     telefono: '11-6789-0123', username: 'valeg',   estado: 'activo',   fechaAlta: '2025-03-22' },
    { id: 6, nombre: 'Rodrigo',   apellido: 'Fernández', fechaNacimiento: '1998-11-10', nroSocio: 'SOC-1007', dni: '37500660', email: 'rodri.f@mail.com',         telefono: '11-7890-1234', username: 'rodrif',  estado: 'activo',   fechaAlta: '2025-04-05' },
    { id: 7, nombre: 'Sofía',     apellido: 'Martínez',  fechaNacimiento: '2000-03-25', nroSocio: 'SOC-1008', dni: '43650098', email: 'sofi.martinez@mail.com',   telefono: '11-8901-2345', username: 'sofim',   estado: 'inactivo', fechaAlta: '2025-04-14' },
    { id: 8, nombre: 'Nicolás',   apellido: 'Romero',    fechaNacimiento: '1999-06-30', nroSocio: 'SOC-1009', dni: '41235387', email: 'nico.romero@mail.com',     telefono: '11-9012-4444', username: 'nicor',   estado: 'activo',   fechaAlta: '2025-05-02' },
];

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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState(INITIAL_USUARIOS);
    const [nextId,   setNextId]   = useState(9);
    const [filtro,   setFiltro]   = useState('');
    const [toasts,   setToasts]   = useState([]);

    // Modales
    const [modalForm,    setModalForm]    = useState({ open: false, modo: 'nuevo', usuario: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, usuario: null });
    const [modalBaja,    setModalBaja]    = useState({ open: false, usuario: null });

    // ── Lucide ──
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    // ── Toast helper ──
    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // ── CRUD handlers ──────────────────────────────────────────────────────────
    function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            setUsuarios(prev =>
                prev.map(u => u.id === datos.id ? { ...u, ...datos } : u)
            );
            mostrarToast('Cliente actualizado correctamente.', 'success');
        } else {
            const nuevo = {
                ...datos,
                id:       nextId,
                estado:   'activo',
                fechaAlta: new Date().toISOString().split('T')[0],
            };
            setUsuarios(prev => [...prev, nuevo]);
            setNextId(n => n + 1);
            mostrarToast('Cliente registrado correctamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', usuario: null });
    }

    function handleToggleEstado(usuario) {
        const deBaja  = usuario.estado === 'activo';
        setUsuarios(prev =>
            prev.map(u => u.id === usuario.id ? { ...u, estado: deBaja ? 'inactivo' : 'activo' } : u)
        );
        mostrarToast(
            deBaja
                ? `${usuario.nombre} ${usuario.apellido} fue dado de baja.`
                : `${usuario.nombre} ${usuario.apellido} fue reactivado.`,
            deBaja ? 'warning' : 'success'
        );
        setModalBaja({ open: false, usuario: null });
    }

    // ── Modal openers ──────────────────────────────────────────────────────────
    const abrirNuevo   = ()  => setModalForm({ open: true, modo: 'nuevo', usuario: null });
    const abrirEditar  = (u) => setModalForm({ open: true, modo: 'editar', usuario: u });
    const abrirDetalle = (u) => setModalDetalle({ open: true, usuario: u });
    const abrirBaja    = (u) => setModalBaja({ open: true, usuario: u });

    // Desde detalle → editar
    function handleEditarDesdeDetalle(u) {
        setModalDetalle({ open: false, usuario: null });
        abrirEditar(u);
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    const activos   = usuarios.filter(u => u.estado === 'activo').length;
    const inactivos = usuarios.filter(u => u.estado === 'inactivo').length;

    const usuariosFiltrados = filtro
        ? usuarios.filter(u => {
              const q = filtro.toLowerCase();
              return (
                  `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
                  u.dni.includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  u.username.toLowerCase().includes(q)
              );
          })
        : usuarios;

    return (
        <>
            {/* TOOLBAR */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Clientes</h2>
                    <span className="crud-count">{usuarios.length} total</span>
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
                    <button className="btn-primary-action" onClick={abrirNuevo}>
                        <i data-lucide="user-plus" />
                        Nuevo cliente
                    </button>
                </div>
            </div>

            {/* MINI STATS */}
            <div className="crud-mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-num">{usuarios.length}</span>
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