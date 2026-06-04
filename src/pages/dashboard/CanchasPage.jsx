// src/pages/dashboard/CanchasPage.jsx
import { useState, useEffect, useCallback } from 'react';
import CanchasTable from '../../components/canchas/CanchasTable';
import TiposTable from '../../components/canchas/TiposTable';
import DisponibilidadPanel from '../../components/canchas/DisponibilidadPanel';
import CanchaModal from '../../components/canchas/modales/CanchaModal';
import CanchaModalDetalle from '../../components/canchas/modales/CanchaModalDetalle';
import CanchaModalBaja from '../../components/canchas/modales/CanchaModalBaja';
import TipoModal from '../../components/canchas/modales/TipoModal';
import TipoModalDetalle from '../../components/canchas/modales/TipoModalDetalle';
import TipoModalBaja from '../../components/canchas/modales/TipoModalBaja';
import DispModal from '../../components/canchas/modales/DispModal';

import Can from '../../components/Can';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useCanchas } from '../../context/CanchasContext';

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

export default function CanchasPageContent() {
    const { 
        canchas, tiposCanchas: tipos, disponibilidades: disps, loading, error,
        crearCancha, modificarCancha, toggleEstadoCancha,
        crearTipo, modificarTipo, eliminarTipo,
        crearDisp, modificarDisp, toggleDisp, eliminarDisp
    } = useCanchas();

    const [tabActivo, setTabActivo] = useState('canchas');
    const [canchaSelDispId, setCanchaSelDispId] = useState(null);
    const [filtroCanchas, setFiltroCanchas] = useState('');
    const [filtroTipos, setFiltroTipos] = useState('');
    const [toasts, setToasts] = useState([]);

    // Modales
    const [modalCancha, setModalCancha] = useState({ open: false, modo: 'nuevo', data: null });
    const [modalDetCancha, setModalDetCancha] = useState({ open: false, data: null });
    const [modalBajaCancha, setModalBajaCancha] = useState({ open: false, data: null });

    const [modalTipo, setModalTipo] = useState({ open: false, modo: 'nuevo', data: null });
    const [modalDetTipo, setModalDetTipo] = useState({ open: false, data: null });
    const [modalBajaTipo, setModalBajaTipo] = useState({ open: false, data: null });

    const [modalDisp, setModalDisp] = useState({ open: false, modo: 'nuevo', data: null, idCanchaFallback: null });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    useEffect(() => {
        if (tabActivo === 'disponibilidad' && canchas.length > 0) {
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

    // ── Handlers Canchas ──
    async function guardarCancha(datos) {
        if (modalCancha.modo === 'editar') {
            await modificarCancha(datos);
            mostrarToast('Cancha actualizada.');
        } else {
            await crearCancha(datos);
            mostrarToast('Cancha registrada.');
        }
        setModalCancha({ open: false, modo: 'nuevo', data: null });
    }
    async function handleToggleEstadoCancha(cancha) {
        await toggleEstadoCancha(cancha);
        mostrarToast(`Estado de "${cancha.nombre}" actualizado.`);
        setModalBajaCancha({ open: false, data: null });
    }

    // ── Handlers Tipos ──
    async function guardarTipo(datos) {
        if (modalTipo.modo === 'editar') {
            await modificarTipo(datos);
            mostrarToast('Tipo de cancha actualizado.');
        } else {
            await crearTipo(datos);
            mostrarToast('Tipo de cancha registrado.');
        }
        setModalTipo({ open: false, modo: 'nuevo', data: null });
    }
    async function handleEliminarTipo(tipo) {
        await eliminarTipo(tipo.id);
        mostrarToast('Tipo de cancha eliminado.');
        setModalBajaTipo({ open: false, data: null });
    }

    // ── Handlers Disponibilidad ──
    async function guardarDisp(datos) {
        if (modalDisp.modo === 'editar') {
            await modificarDisp(datos);
            mostrarToast('Franja horaria actualizada.');
        } else {
            await crearDisp(datos);
            mostrarToast('Franja horaria registrada.');
        }
        setCanchaSelDispId(datos.idCancha);
        setModalDisp({ open: false, modo: 'nuevo', data: null, idCanchaFallback: null });
    }
    async function handleToggleDisp(disp) {
        await toggleDisp(disp.id);
        mostrarToast(disp.disponible ? 'Franja bloqueada.' : 'Franja habilitada.', disp.disponible ? 'warning' : 'success');
    }
    async function handleEliminarDisp(disp) {
        if (window.confirm('¿Eliminar esta franja horaria permanentemente?')) {
            await eliminarDisp(disp.id);
            mostrarToast('Franja eliminada.');
        }
    }

    if (loading) return <LoadingSpinner message="Cargando configuración de canchas..." />;
    if (error) return <ErrorMessage message={`Ocurrió un error: ${error}`} />;

    return (
        <div className="canchas-module">
            {/* TABS */}
            <div className="module-tabs">
                <button className={`module-tab ${tabActivo === 'canchas' ? 'active' : ''}`} onClick={() => setTabActivo('canchas')}>
                    <i data-lucide="goal" /> Canchas
                </button>
                <Can roles={['Admin']}>
                    <button className={`module-tab ${tabActivo === 'tipos' ? 'active' : ''}`} onClick={() => setTabActivo('tipos')}>
                        <i data-lucide="layers" /> Tipos de Cancha
                    </button>
                </Can>
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
                        canchas={canchas}
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
                        onToggleDisp={handleToggleDisp}
                        onEditarDisp={(d) => setModalDisp({ open: true, modo: 'editar', data: d })}
                        onEliminarDisp={handleEliminarDisp}
                    />
                )}
            </div>

            {/* MODALES */}
            <CanchaModal open={modalCancha.open} modo={modalCancha.modo} cancha={modalCancha.data} tipos={tipos} canchasActivas={canchas} onGuardar={guardarCancha} onCerrar={() => setModalCancha({ open: false, modo: 'nuevo', data: null })} />
            <CanchaModalDetalle open={modalDetCancha.open} cancha={modalDetCancha.data} tipos={tipos} onCerrar={() => setModalDetCancha({ open: false, data: null })} />
            <CanchaModalBaja open={modalBajaCancha.open} cancha={modalBajaCancha.data} onConfirmar={handleToggleEstadoCancha} onCerrar={() => setModalBajaCancha({ open: false, data: null })} />
            
            <TipoModal open={modalTipo.open} modo={modalTipo.modo} tipo={modalTipo.data} onGuardar={guardarTipo} onCerrar={() => setModalTipo({ open: false, modo: 'nuevo', data: null })} />
            <TipoModalDetalle open={modalDetTipo.open} tipo={modalDetTipo.data} onCerrar={() => setModalDetTipo({ open: false, data: null })} />
            <TipoModalBaja open={modalBajaTipo.open} tipo={modalBajaTipo.data} onConfirmar={handleEliminarTipo} onCerrar={() => setModalBajaTipo({ open: false, data: null })} />
            
            <DispModal open={modalDisp.open} modo={modalDisp.modo} disp={modalDisp.data} idCanchaFallback={modalDisp.idCanchaFallback} canchas={canchas} dispsExistentes={disps} onGuardar={guardarDisp} onCerrar={() => setModalDisp({ open: false, modo: 'nuevo', data: null })} />

            <Toast toasts={toasts} />
        </div>
    );
}
