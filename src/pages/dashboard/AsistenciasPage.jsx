// src/pages/dashboard/AsistenciasPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import AsistenciasTable from '../../components/asistencias/AsistenciasTable';
import AsistenciaTomaModal from '../../components/asistencias/AsistenciaTomaModal';
import AsistenciaDetalleModal from '../../components/asistencias/AsistenciaDetalleModal';

// ── Datos Mock Base ───────────────────────────────────────────────────────────
const ALUMNOS_MOCK = [
    { id: 101, nombre: 'Mateo', apellido: 'Messi', dni: '55666777' },
    { id: 102, nombre: 'Ciro', apellido: 'Messi', dni: '55888999' },
    { id: 103, nombre: 'Benjamín', apellido: 'Agüero', dni: '54111222' }
];

const CLASES_MOCK_GLOBALES = [
    {
        idClase: 1, nombre: 'Escuelita Sub-12', tipoClase: 'Grupal', cancha: 'Cancha 1 (F5)',
        fecha: '2026-05-23', horario: '17:00', duracionMin: 90, 
        profesor: { id: 1, nombre: 'Carlos', apellido: 'Gómez' },
        alumnos: [ALUMNOS_MOCK[0], ALUMNOS_MOCK[1]]
    },
    {
        idClase: 2, nombre: 'Entrenamiento Arqueros', tipoClase: 'Particular', cancha: 'Cancha 2 (F7)',
        fecha: '2026-05-24', horario: '19:00', duracionMin: 60,
        profesor: { id: 1, nombre: 'Carlos', apellido: 'Gómez' },
        alumnos: [ALUMNOS_MOCK[2]]
    },
    {
        idClase: 3, nombre: 'Preparación Física', tipoClase: 'Grupal', cancha: 'Pista Funcional',
        fecha: '2026-05-23', horario: '18:00', duracionMin: 60,
        profesor: { id: 2, nombre: 'Lucía', apellido: 'Fernández' }, // Otro profe
        alumnos: []
    }
];

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

export default function AsistenciasPage() {
    // 1. Identificación del Profesor Logueado
    const { user } = useAuth();
    // Fallback por si testeas sin login: asumimos que somos el Profe ID 1 (Carlos)
    const currentUser = user || { id: 1, nombre: 'Carlos', rol: 'profesor' };

    // 2. Filtramos sólo las clases de este profesor
    const misClases = CLASES_MOCK_GLOBALES.filter(c => c.profesor.id === currentUser.id);

    // 3. Estado: Mapeo de idClase -> Array de objetos ASISTENCIA (UML)
    const [asistenciasBD, setAsistenciasBD] = useState({});
    
    const [filtro, setFiltro] = useState('');
    const [toasts, setToasts] = useState([]);

    const [modalToma, setModalToma] = useState({ open: false, clase: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, clase: null });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    function handleGuardarAsistencia(idClase, arrayAsistenciasUML) {
        setAsistenciasBD(prev => ({
            ...prev,
            [idClase]: arrayAsistenciasUML
        }));
        mostrarToast('Registro de asistencia guardado exitosamente.', 'success');
        setModalToma({ open: false, clase: null });
    }

    const clasesFiltradas = filtro
        ? misClases.filter(c => c.nombre.toLowerCase().includes(filtro.toLowerCase()))
        : misClases;

    // Stats
    const totalClases = misClases.length;
    const clasesCompletadas = Object.keys(asistenciasBD).length;
    const clasesPendientes = totalClases - clasesCompletadas;

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Mis Clases (Asistencia)</h2>
                    <span className="crud-count">{totalClases} asignadas</span>
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

            <div className="crud-mini-stats">
                <div className="mini-stat blue">
                    <span className="mini-stat-num">{totalClases}</span>
                    <span className="mini-stat-label">Total Clases</span>
                </div>
                <div className="mini-stat green">
                    <span className="mini-stat-num">{clasesCompletadas}</span>
                    <span className="mini-stat-label">Listas Pasadas</span>
                </div>
                <div className="mini-stat red">
                    <span className="mini-stat-num">{clasesPendientes}</span>
                    <span className="mini-stat-label">Pendientes</span>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                <AsistenciasTable
                    clases={clasesFiltradas}
                    asistenciasPorClase={asistenciasBD}
                    filtro={filtro}
                    onLimpiarFiltro={() => setFiltro('')}
                    onVer={(c) => setModalDetalle({ open: true, clase: c })}
                    onTomar={(c) => setModalToma({ open: true, clase: c })}
                />
            </div>

            {/* Modal para Tomar Lista */}
            <AsistenciaTomaModal 
                open={modalToma.open} 
                clase={modalToma.clase}
                registrosPrevios={modalToma.clase ? asistenciasBD[modalToma.clase.idClase] : []}
                onGuardar={handleGuardarAsistencia} 
                onCerrar={() => setModalToma({ open: false, clase: null })} 
            />

            {/* Modal para Ver Detalle */}
            <AsistenciaDetalleModal
                open={modalDetalle.open}
                clase={modalDetalle.clase}
                registros={modalDetalle.clase ? asistenciasBD[modalDetalle.clase.idClase] : []}
                onCerrar={() => setModalDetalle({ open: false, clase: null })}
            />

            <Toast toasts={toasts} />
        </>
    );
}