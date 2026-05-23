import { useState, useEffect, useCallback } from 'react';
import ClasesTable from '../../components/clases/ClasesTable';
import ClaseModal from '../../components/clases/ClaseModal';
import AsistenciaModal from '../../components/clases/AsistenciaModal';
import ClaseModalDetalle from '../../components/clases/ClaseModalDetalle';
import ClaseModalBaja from '../../components/clases/ClaseModalBaja';

// ── Datos mock de Profesores (RF38 y RF39) ────────────────────────────────────
const PROFESORES_MOCK = [
    { id: 1, nombre: 'Carlos', apellido: 'Gómez', verificacionCertificacion: true },
    { id: 2, nombre: 'Lucía', apellido: 'Fernández', verificacionCertificacion: true }
];

// ── Datos mock de Alumnos / Clientes ───────────────────────────────────────────
const ALUMNOS_MOCK = [
    { id: 101, nombre: 'Juan', apellido: 'Pérez', email: 'juan@mail.com' },
    { id: 102, nombre: 'Martín', apellido: 'López', email: 'martin.l@mail.com' },
    { id: 103, nombre: 'Camila', apellido: 'Torres', email: 'cami.torres@gmail.com' },
    { id: 104, nombre: 'Lucas', apellido: 'Díaz', email: 'lucas.diaz@mail.com' },
    { id: 105, nombre: 'Valentina', apellido: 'García', email: 'vale.garcia@mail.com' },
    { id: 106, nombre: 'Rodrigo', apellido: 'Fernández', email: 'rodri.f@mail.com' },
    { id: 107, nombre: 'Sofía', apellido: 'Martínez', email: 'sofi.martinez@mail.com' },
    { id: 108, nombre: 'Nicolás', apellido: 'Romero', email: 'nico.romero@mail.com' }
];

// ── Datos mock de Clases ──────────────────────────────────────────────────────
const INITIAL_CLASES = [
    {
        idClase: 1, nombre: 'Escuelita Sub-12', descripcion: 'Entrenamiento táctico',
        tipoClase: 'Escuelita', profesor: PROFESORES_MOCK[0], cancha: 'Cancha 1 (F5)',
        fecha: '2026-05-30', horario: '17:00', duracionMin: 90, maxAlumnos: 20, precio: 3000,
        estado: 'programada',
        alumnos: [
            { id: 101, nombre: 'Mateo Messi', presente: false },
            { id: 102, nombre: 'Ciro Messi', presente: false }
        ]
    },
    {
        idClase: 2, nombre: 'Entrenamiento Arqueros', descripcion: 'Reflejos y saque',
        tipoClase: 'Particular', profesor: null, cancha: 'Cancha 2 (F7)',
        fecha: '2026-05-30', horario: '19:00', duracionMin: 60, maxAlumnos: 2, precio: 8000,
        estado: 'programada',
        alumnos: []
    }
];

// ── Toast interno ─────────────────────────────────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClasesPage() {
    const [clases, setClases] = useState(INITIAL_CLASES);
    const [nextId, setNextId] = useState(3);
    const [filtro, setFiltro] = useState('');
    const [toasts, setToasts] = useState([]);

    // Estado de modales
    const [modalForm, setModalForm]             = useState({ open: false, modo: 'nuevo', clase: null });
    const [modalAsistencia, setModalAsistencia] = useState({ open: false, clase: null });
    const [modalDetalle, setModalDetalle]       = useState({ open: false, clase: null });
    const [modalBaja, setModalBaja]             = useState({ open: false, clase: null });

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

    // ── CRUD Handlers ──────────────────────────────────────────────────────────
    function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            setClases(prev => prev.map(c => c.idClase === datos.idClase ? { ...c, ...datos } : c));
            mostrarToast('Clase actualizada.', 'success');
        } else {
            const nueva = { ...datos, idClase: nextId, alumnos: [] };
            setClases(prev => [...prev, nueva]);
            setNextId(n => n + 1);
            mostrarToast('Clase programada exitosamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', clase: null });
    }

    function handleAsistencia(idClase, recordAsistencias) {
        setClases(prev => prev.map(c => {
            if (c.idClase === idClase) {
                const alumnosActualizados = c.alumnos.map(al => ({
                    ...al,
                    presente: recordAsistencias[al.id]
                }));
                return { ...c, alumnos: alumnosActualizados };
            }
            return c;
        }));
        mostrarToast('Asistencia registrada correctamente.', 'success');
        setModalAsistencia({ open: false, clase: null });
    }

    function handleToggleEstado(clase) {
        const nuevoEstado = clase.estado === 'cancelada' ? 'programada' : 'cancelada';
        setClases(prev => prev.map(c => c.idClase === clase.idClase ? { ...c, estado: nuevoEstado } : c));
        
        if (nuevoEstado === 'cancelada') {
            mostrarToast('Clase cancelada correctamente.', 'warning');
        } else {
            mostrarToast('Clase reprogramada con éxito.', 'success');
        }
        setModalBaja({ open: false, clase: null });
    }

    // ── Filtrado y Stats ───────────────────────────────────────────────────────
    const clasesFiltradas = filtro
        ? clases.filter(c => 
            c.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
            c.tipoClase.toLowerCase().includes(filtro.toLowerCase())
          )
        : clases;

    const programadas = clases.filter(c => c.estado === 'programada').length;
    const canceladas  = clases.filter(c => c.estado === 'cancelada').length;

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
                    <button className="btn-primary-action" onClick={() => setModalForm({ open: true, modo: 'nuevo', clase: null })}>
                        <i data-lucide="calendar-plus" /> Programar Clase
                    </button>
                </div>
            </div>

            {/* MINI STATS */}
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

            {/* TABLA */}
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

            {/* MODALES */}
            <ClaseModal 
                open={modalForm.open} 
                modo={modalForm.modo} 
                clase={modalForm.clase} 
                profesoresDisp={PROFESORES_MOCK} 
                alumnosDisp={ALUMNOS_MOCK}
                onGuardar={handleGuardar} 
                onCerrar={() => setModalForm({ open: false, modo: 'nuevo', clase: null })} 
            />
            
            <AsistenciaModal 
                open={modalAsistencia.open} 
                clase={modalAsistencia.clase} 
                onGuardar={handleAsistencia} 
                onCerrar={() => setModalAsistencia({ open: false, clase: null })} 
            />

            <ClaseModalDetalle
                open={modalDetalle.open}
                clase={modalDetalle.clase}
                onCerrar={() => setModalDetalle({ open: false, clase: null })}
            />

            <ClaseModalBaja
                open={modalBaja.open}
                clase={modalBaja.clase}
                onConfirmar={handleToggleEstado}
                onCerrar={() => setModalBaja({ open: false, clase: null })}
            />

            {/* TOASTS */}
            <Toast toasts={toasts} />
        </>
    );
}