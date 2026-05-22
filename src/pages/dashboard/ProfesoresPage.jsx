import { useState, useEffect, useCallback } from 'react';
import ProfesoresTable from '../../components/profesores/ProfesoresTable';
import ProfesorModal from '../../components/profesores/ProfesorModal';
import ProfesorModalDetalle from '../../components/profesores ProfesorModalDetalle';
import ProfesorModalBaja from '../../components/profesores/ProfesorModalBaja';

// ── Datos mock (reemplazar por fetch al backend) ───────────────────────────────
const INITIAL_PROFESORES = [
    {
        id: 1, legajo: 'PROF-1001', nombre: 'Carlos', apellido: 'Gómez',
        fechaNacimiento: '1989-04-12', dni: '32456789',
        email: 'carlos.gomez@mail.com', telefono: '11-2345-6789',
        username: 'cgomez', cargo: 'Profesor', turno: 'Tarde',
        especialidad: 'Fútbol Infantil', certificaciones: 'AFA Nivel 1',
        verificacionCertificacion: true, estado: 'activo',
        fechaIngreso: '2024-01-10', fechaRegistro: '2024-01-10',
    },
    {
        id: 2, legajo: 'PROF-1002', nombre: 'Lucía', apellido: 'Fernández',
        fechaNacimiento: '1992-08-21', dni: '36555111',
        email: 'lucia.fernandez@mail.com', telefono: '11-5555-1111',
        username: 'lfernandez', cargo: 'Profesora', turno: 'Mañana',
        especialidad: 'Preparación Física', certificaciones: 'Preparador Físico Nacional',
        verificacionCertificacion: true, estado: 'activo',
        fechaIngreso: '2024-02-14', fechaRegistro: '2024-02-14',
    },
    {
        id: 3, legajo: 'PROF-1003', nombre: 'Matías', apellido: 'Ruiz',
        fechaNacimiento: '1987-11-05', dni: '30111222',
        email: 'matias.ruiz@mail.com', telefono: '11-7777-8888',
        username: 'mruiz', cargo: 'Profesor', turno: 'Noche',
        especialidad: 'Entrenamiento Técnico', certificaciones: 'CONMEBOL Licencia C',
        verificacionCertificacion: false, estado: 'inactivo',
        fechaIngreso: '2023-09-01', fechaRegistro: '2023-09-01',
    },
];

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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfesoresPage() {
    const [profesores, setProfesores] = useState(INITIAL_PROFESORES);
    const [nextId,     setNextId]     = useState(4);
    const [filtro,     setFiltro]     = useState('');
    const [toasts,     setToasts]     = useState([]);

    // Estado de modales
    const [modalForm,    setModalForm]    = useState({ open: false, modo: 'nuevo', profesor: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, profesor: null });
    const [modalBaja,    setModalBaja]    = useState({ open: false, profesor: null });

    // Re-inicializar Lucide en cada render que afecte íconos
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    // ── Toast ──────────────────────────────────────────────────────────────────
    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // ── CRUD ───────────────────────────────────────────────────────────────────
    function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            setProfesores(prev =>
                prev.map(p => p.id === datos.id ? { ...p, ...datos } : p)
            );
            mostrarToast('Profesor actualizado.', 'success');
        } else {
            const nuevo = {
                ...datos,
                id:                     nextId,
                cargo:                  'Profesor',
                verificacionCertificacion: true,
                fechaIngreso:           new Date().toISOString().split('T')[0],
                fechaRegistro:          new Date().toISOString().split('T')[0],
                estado:                 'activo',
            };
            setProfesores(prev => [...prev, nuevo]);
            setNextId(n => n + 1);
            mostrarToast('Profesor registrado.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', profesor: null });
    }

    function handleToggleEstado(profesor) {
        const deBaja = profesor.estado === 'activo';
        setProfesores(prev =>
            prev.map(p => p.id === profesor.id
                ? { ...p, estado: deBaja ? 'inactivo' : 'activo' }
                : p
            )
        );
        mostrarToast('Estado actualizado.', 'warning');
        setModalBaja({ open: false, profesor: null });
    }

    // ── Abrir modales ──────────────────────────────────────────────────────────
    const abrirNuevo   = ()  => setModalForm({ open: true, modo: 'nuevo',  profesor: null });
    const abrirEditar  = (p) => setModalForm({ open: true, modo: 'editar', profesor: p });
    const abrirDetalle = (p) => setModalDetalle({ open: true, profesor: p });
    const abrirBaja    = (p) => setModalBaja({ open: true, profesor: p });

    // ── Filtrado ───────────────────────────────────────────────────────────────
    const profesoresFiltrados = filtro
        ? profesores.filter(p => {
              const q = filtro.toLowerCase();
              return (
                  `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
                  p.especialidad.toLowerCase().includes(q) ||
                  p.dni.includes(q)
              );
          })
        : profesores;

    // ── Stats ──────────────────────────────────────────────────────────────────
    const activos   = profesores.filter(p => p.estado === 'activo').length;
    const inactivos = profesores.filter(p => p.estado === 'inactivo').length;

    return (
        <>
            {/* TOOLBAR */}
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Profesores</h2>
                    <span className="crud-count">{profesores.length} total</span>
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
                    <button className="btn-primary-action" onClick={abrirNuevo}>
                        <i data-lucide="user-plus" />
                        Nuevo profesor
                    </button>
                </div>
            </div>

            {/* MINI STATS */}
            <div className="crud-mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-num">{profesores.length}</span>
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