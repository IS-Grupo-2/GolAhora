// src/pages/dashboard/CanchasPage.jsx
import { useState, useEffect, useCallback } from 'react';

// Tablas & Paneles
import CanchasTable        from '../../components/canchas/CanchasTable';
import TiposTable          from '../../components/canchas/TiposTable';
import DisponibilidadPanel from '../../components/canchas/DisponibilidadPanel';

// Modales Canchas
import CanchaModal         from '../../components/canchas/modales/CanchaModal';
import CanchaModalDetalle  from '../../components/canchas/modales/CanchaModalDetalle';
import CanchaModalBaja     from '../../components/canchas/modales/CanchaModalBaja';

// Modales Tipos
import TipoModal           from '../../components/canchas/modales/TipoModal';
import TipoModalDetalle    from '../../components/canchas/modales/TipoModalDetalle';
import TipoModalBaja       from '../../components/canchas/modales/TipoModalBaja';

// Modal Disponibilidad
import DispModal           from '../../components/canchas/modales/DispModal';

// ── Datos Mock ──────────────────────────────────────────────────────────────
const INITIAL_TIPOS = [
    { id: 1, nombre: 'Fútbol 5',  superficie: 'Césped sintético', capacidadJugadores: 10, duracionMaxReservaMin: 60,  precioHora: 15000, descripcion: 'Cancha pequeña ideal para grupos reducidos.' },
    { id: 2, nombre: 'Fútbol 7',  superficie: 'Césped natural',   capacidadJugadores: 14, duracionMaxReservaMin: 90,  precioHora: 22000, descripcion: 'Formato intermedio, muy popular en torneos.' },
    { id: 3, nombre: 'Fútbol 11', superficie: 'Tierra',           capacidadJugadores: 22, duracionMaxReservaMin: 120, precioHora: 35000, descripcion: 'Cancha reglamentaria para partidos completos.' },
    { id: 4, nombre: 'Paddle',    superficie: 'Cristal y césped', capacidadJugadores: 4,  duracionMaxReservaMin: 60,  precioHora: 12000, descripcion: 'Canchas de paddle cubiertas y ventiladas.' },
];

const INITIAL_CANCHAS = [
    { id: 1, numero: 1, nombre: 'Cancha 1', idTipo: 1, estado: 'activa',   descripcion: 'Ubicada en sector norte, iluminación LED.' },
    { id: 2, numero: 2, nombre: 'Cancha 2', idTipo: 1, estado: 'activa',   descripcion: 'Sector sur, vestuarios propios.' },
    { id: 3, numero: 3, nombre: 'Cancha 3', idTipo: 2, estado: 'activa',   descripcion: 'Vista panorámica, ideal para torneos.' },
    { id: 4, numero: 4, nombre: 'Cancha 4', idTipo: 2, estado: 'inactiva', descripcion: 'En mantenimiento por renovación de césped.' },
    { id: 5, numero: 5, nombre: 'Cancha 5', idTipo: 3, estado: 'activa',   descripcion: 'La más grande del complejo.' },
    { id: 6, numero: 6, nombre: 'Cancha 6', idTipo: 4, estado: 'activa',   descripcion: 'Paddle cubierta, techada y climatizada.' },
];

const INITIAL_DISP = [
    { id: 1, idCancha: 1, diaSemana: 'Lunes',     horaInicio: 8,  horaFin: 23, disponible: true },
    { id: 2, idCancha: 1, diaSemana: 'Martes',    horaInicio: 8,  horaFin: 23, disponible: true },
    { id: 3, idCancha: 1, diaSemana: 'Miércoles', horaInicio: 8,  horaFin: 23, disponible: true },
    { id: 6, idCancha: 1, diaSemana: 'Sábado',    horaInicio: 9,  horaFin: 22, disponible: true },
    { id: 7, idCancha: 1, diaSemana: 'Domingo',   horaInicio: 10, horaFin: 20, disponible: false },
    { id: 8, idCancha: 2, diaSemana: 'Lunes',     horaInicio: 8,  horaFin: 22, disponible: true },
];

// ── Toast Interno ─────────────────────────────────────────────────────────────
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

export default function CanchasPage() {
    // Estados base
    const [tabActivo, setTabActivo] = useState('canchas');
    const [canchas, setCanchas]     = useState(INITIAL_CANCHAS);
    const [tipos, setTipos]         = useState(INITIAL_TIPOS);
    const [disps, setDisps]         = useState(INITIAL_DISP);
    const [canchaSelDispId, setCanchaSelDispId] = useState(null);

    // Contadores de IDs simulados
    const [nextIds, setNextIds] = useState({ cancha: 7, tipo: 5, disp: 17 });
    
    const [filtroCanchas, setFiltroCanchas] = useState('');
    const [filtroTipos, setFiltroTipos]     = useState('');
    const [toasts, setToasts] = useState([]);

    // Modales Canchas
    const [modalCancha, setModalCancha]     = useState({ open: false, modo: 'nuevo', data: null });
    const [modalDetCancha, setModalDetCancha] = useState({ open: false, data: null });
    const [modalBajaCancha, setModalBajaCancha] = useState({ open: false, data: null });

    // Modales Tipos
    const [modalTipo, setModalTipo]     = useState({ open: false, modo: 'nuevo', data: null });
    const [modalDetTipo, setModalDetTipo] = useState({ open: false, data: null });
    const [modalBajaTipo, setModalBajaTipo] = useState({ open: false, data: null });

    // Modal Disponibilidad
    const [modalDisp, setModalDisp] = useState({ open: false, modo: 'nuevo', data: null, idCanchaFallback: null });

    // Re-render íconos
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    // Mantenimiento de estado: asegurar cancha activa en tab Disponibilidad
    useEffect(() => {
        if (tabActivo === 'disponibilidad') {
            const check = canchas.find(c => c.id === canchaSelDispId);
            if (!check || check.estado !== 'activa') {
                const primeraActiva = canchas.find(c => c.estado === 'activa');
                setCanchaSelDispId(primeraActiva ? primeraActiva.id : null);
            }
        }
    }, [tabActivo, canchas, canchaSelDispId]);

    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // =====================================================
    //  HANDLERS: CANCHAS
    // =====================================================
    function guardarCancha(datos) {
        if (modalCancha.modo === 'editar') {
            setCanchas(prev => prev.map(c => c.id === datos.id ? { ...c, ...datos } : c));
            mostrarToast('Cancha actualizada.');
        } else {
            setCanchas(prev => [...prev, { ...datos, id: nextIds.cancha, estado: 'activa' }]);
            setNextIds(prev => ({ ...prev, cancha: prev.cancha + 1 }));
            mostrarToast('Cancha registrada.');
        }
        setModalCancha({ open: false, modo: 'nuevo', data: null });
    }

    function toggleEstadoCancha(cancha) {
        const esActiva = cancha.estado === 'activa';
        setCanchas(prev => prev.map(c => c.id === cancha.id ? { ...c, estado: esActiva ? 'inactiva' : 'activa' } : c));
        
        // Regla de negocio: Si se da de baja, bloquear sus disponibilidades
        if (esActiva) {
            setDisps(prev => prev.map(d => d.idCancha === cancha.id ? { ...d, disponible: false } : d));
        }

        mostrarToast(`Estado de "${cancha.nombre}" actualizado.`);
        setModalBajaCancha({ open: false, data: null });
    }

    // =====================================================
    //  HANDLERS: TIPOS
    // =====================================================
    function guardarTipo(datos) {
        if (modalTipo.modo === 'editar') {
            setTipos(prev => prev.map(t => t.id === datos.id ? { ...t, ...datos } : t));
            mostrarToast('Tipo de cancha actualizado.');
        } else {
            setTipos(prev => [...prev, { ...datos, id: nextIds.tipo }]);
            setNextIds(prev => ({ ...prev, tipo: prev.tipo + 1 }));
            mostrarToast('Tipo de cancha registrado.');
        }
        setModalTipo({ open: false, modo: 'nuevo', data: null });
    }

    function eliminarTipo(tipo) {
        setTipos(prev => prev.filter(t => t.id !== tipo.id));
        mostrarToast('Tipo de cancha eliminado.');
        setModalBajaTipo({ open: false, data: null });
    }

    // =====================================================
    //  HANDLERS: DISPONIBILIDAD
    // =====================================================
    function guardarDisp(datos) {
        if (modalDisp.modo === 'editar') {
            setDisps(prev => prev.map(d => d.id === datos.id ? { ...d, ...datos } : d));
            mostrarToast('Franja horaria actualizada.');
        } else {
            setDisps(prev => [...prev, { ...datos, id: nextIds.disp }]);
            setNextIds(prev => ({ ...prev, disp: prev.disp + 1 }));
            mostrarToast('Franja horaria registrada.');
        }
        setCanchaSelDispId(datos.idCancha);
        setModalDisp({ open: false, modo: 'nuevo', data: null, idCanchaFallback: null });
    }

    function toggleDisp(disp) {
        setDisps(prev => prev.map(d => d.id === disp.id ? { ...d, disponible: !d.disponible } : d));
        mostrarToast(disp.disponible ? 'Franja bloqueada.' : 'Franja habilitada.', disp.disponible ? 'warning' : 'success');
    }

    function eliminarDisp(disp) {
        if (window.confirm('¿Eliminar esta franja horaria permanentemente?')) {
            setDisps(prev => prev.filter(d => d.id !== disp.id));
            mostrarToast('Franja eliminada.');
        }
    }

    // =====================================================
    //  RENDER
    // =====================================================
    return (
        <div className="canchas-module">
            {/* TABS */}
            <div className="module-tabs">
                <button className={`module-tab ${tabActivo === 'canchas' ? 'active' : ''}`} onClick={() => setTabActivo('canchas')}>
                    <i data-lucide="goal" /> Canchas
                </button>
                <button className={`module-tab ${tabActivo === 'tipos' ? 'active' : ''}`} onClick={() => setTabActivo('tipos')}>
                    <i data-lucide="layers" /> Tipos de Cancha
                </button>
                <button className={`module-tab ${tabActivo === 'disponibilidad' ? 'active' : ''}`} onClick={() => setTabActivo('disponibilidad')}>
                    <i data-lucide="calendar-clock" /> Disponibilidad
                </button>
            </div>

            {/* CONTENIDO TAB */}
            <div id="tab-content">
                {tabActivo === 'canchas' && (
                    <CanchasTable 
                        canchas={canchas} 
                        tipos={tipos}
                        filtro={filtroCanchas}
                        setFiltro={setFiltroCanchas}
                        onNuevo={() => setModalCancha({ open: true, modo: 'nuevo', data: null })}
                        onVer={(c) => setModalDetCancha({ open: true, data: c })}
                        onEditar={(c) => setModalCancha({ open: true, modo: 'editar', data: c })}
                        onBaja={(c) => setModalBajaCancha({ open: true, data: c })}
                        onVerDisp={(c) => {
                            if (c.estado === 'activa') {
                                setCanchaSelDispId(c.id);
                                setTabActivo('disponibilidad');
                            } else {
                                mostrarToast('Debe reactivar la cancha para ver su disponibilidad', 'warning');
                            }
                        }}
                    />
                )}

                {tabActivo === 'tipos' && (
                    <TiposTable 
                        tipos={tipos} 
                        canchas={canchas} // Necesario para calcular uso
                        filtro={filtroTipos}
                        setFiltro={setFiltroTipos}
                        onNuevo={() => setModalTipo({ open: true, modo: 'nuevo', data: null })}
                        onVer={(t) => setModalDetTipo({ open: true, data: t })}
                        onEditar={(t) => setModalTipo({ open: true, modo: 'editar', data: t })}
                        onBaja={(t) => {
                            if (canchas.some(c => c.idTipo === t.id)) mostrarToast('El tipo está en uso por una o más canchas.', 'warning');
                            else setModalBajaTipo({ open: true, data: t });
                        }}
                    />
                )}

                {tabActivo === 'disponibilidad' && (
                    <DisponibilidadPanel 
                        canchas={canchas}
                        tipos={tipos}
                        disps={disps}
                        canchaActivaId={canchaSelDispId}
                        setCanchaActivaId={setCanchaSelDispId}
                        onNuevaDisp={() => setModalDisp({ open: true, modo: 'nuevo', data: null, idCanchaFallback: canchaSelDispId })}
                        onToggleDisp={toggleDisp}
                        onEditarDisp={(d) => setModalDisp({ open: true, modo: 'editar', data: d })}
                        onEliminarDisp={eliminarDisp}
                    />
                )}
            </div>

            {/* MODALES CANCHAS */}
            <CanchaModal open={modalCancha.open} modo={modalCancha.modo} cancha={modalCancha.data} tipos={tipos} canchasActivas={canchas} onGuardar={guardarCancha} onCerrar={() => setModalCancha({ open: false, modo: 'nuevo', data: null })} />
            <CanchaModalDetalle open={modalDetCancha.open} cancha={modalDetCancha.data} tipos={tipos} onCerrar={() => setModalDetCancha({ open: false, data: null })} />
            <CanchaModalBaja open={modalBajaCancha.open} cancha={modalBajaCancha.data} onConfirmar={toggleEstadoCancha} onCerrar={() => setModalBajaCancha({ open: false, data: null })} />

            {/* MODALES TIPOS */}
            <TipoModal open={modalTipo.open} modo={modalTipo.modo} tipo={modalTipo.data} onGuardar={guardarTipo} onCerrar={() => setModalTipo({ open: false, modo: 'nuevo', data: null })} />
            <TipoModalDetalle open={modalDetTipo.open} tipo={modalDetTipo.data} onCerrar={() => setModalDetTipo({ open: false, data: null })} />
            <TipoModalBaja open={modalBajaTipo.open} tipo={modalBajaTipo.data} onConfirmar={eliminarTipo} onCerrar={() => setModalBajaTipo({ open: false, data: null })} />

            {/* MODALES DISPONIBILIDAD */}
            <DispModal open={modalDisp.open} modo={modalDisp.modo} disp={modalDisp.data} idCanchaFallback={modalDisp.idCanchaFallback} canchas={canchas} dispsExistentes={disps} onGuardar={guardarDisp} onCerrar={() => setModalDisp({ open: false, modo: 'nuevo', data: null })} />

            <Toast toasts={toasts} />
        </div>
    );
}