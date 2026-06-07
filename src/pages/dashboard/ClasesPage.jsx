// src/pages/dashboard/ClasesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useClases, ALUMNOS_DISPONIBLES } from '../../context/ClasesContext';
import { useProfesores } from '../../context/ProfesoresContext';
import { tieneCertificacionVerificada } from '../../utils/profesoresCertificacion';
import { useCobros } from '../../context/CobrosContext';
import { useAuth } from '../../context/AuthContext';
import ClasesTable      from '../../components/clases/ClasesTable';
import ClaseModal       from '../../components/clases/ClaseModal';
import AsistenciaModal  from '../../components/clases/AsistenciaModal';
import ClaseModalDetalle from '../../components/clases/ClaseModalDetalle';
import ClaseModalBaja   from '../../components/clases/ClaseModalBaja';
import Can              from '../../components/Can';
import LoadingSpinner   from '../../components/ui/LoadingSpinner';
import ErrorMessage     from '../../components/ui/ErrorMessage';

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

// COMPONENTE LOCAL: Modal pasarela de pagos simulada
function SimuladorPagoClaseModal({ open, clase, onConfirmar, onCerrar }) {
    const [procesando, setProcesando] = useState(false);
    if (!open || !clase) return null;

    const handlePagar = () => {
        setProcesando(true);
        setTimeout(() => {
            setProcesando(false);
            onConfirmar();
        }, 1200);
    };

    return (
        <div className="dash-modal-overlay activo">
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h3>Pasarela de Pago Simulado</h3>
                    <button className="dash-modal-close" onClick={onCerrar} disabled={procesando}><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body" style={{ padding: '20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Estás inscribiéndote a:</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text)', margin: '4px 0' }}>{clase.nombre}</h4>
                        <span className="badge info" style={{ marginTop: '4px' }}>{clase.fecha} — {clase.horario} hs</span>
                    </div>
                    <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Monto Final a abonar:</span>
                        <strong style={{ fontSize: '1.3rem', color: 'var(--success-color, #16a34a)' }}>${Number(clase.precio).toLocaleString('es-AR')}</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.4, textAlign: 'center' }}>
                        Al presionar "Pagar con MercadoPago" se simulará la pasarela bancaria externa aprobando el token local.
                    </p>
                </div>
                <div className="dash-modal-footer" style={{ borderTop: '1px solid var(--border)' }}>
                    <button className="btn-modal-cancel" onClick={onCerrar} disabled={procesando}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handlePagar} disabled={procesando} style={{ background: '#009ee3', borderColor: '#009ee3' }}>
                        {procesando ? 'Procesando cobro...' : 'Pagar con MercadoPago'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ClasesPageContent() {
    const { clases, loading, error, fetchClases, crearClase, modificarClase, cancelarClase, registrarAsistencia, inscribirAlumno } = useClases();
    const { profesores } = useProfesores();
    const cobrosContext = useCobros();
    const { user } = useAuth();

    const [filtro,  setFiltro]  = useState('');
    const [toasts,  setToasts]  = useState([]);

    const [modalForm,       setModalForm]       = useState({ open: false, modo: 'nuevo', clase: null });
    const [modalAsistencia, setModalAsistencia] = useState({ open: false, clase: null });
    const [modalDetalle,    setModalDetalle]    = useState({ open: false, clase: null });
    const [modalBaja,       setModalBaja]       = useState({ open: false, clase: null });
    const [modalPago,       setModalPago]       = useState({ open: false, clase: null }); // Nuevo estado

    useEffect(() => { fetchClases(); }, [fetchClases]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // PROCESO DE INSCRIPCIÓN Y COBRO SINCRONIZADO EN LOCALSTORAGE
    async function handleConfirmarPago() {
        const targetClase = modalPago.clase;
        if (!targetClase || !user) return;

        // 1. Guardar inscripción en el array de alumnos de la clase
        await inscribirAlumno(targetClase.idClase, user);

        // 2. Generar el registro de Cobro como "pagado" instantáneamente
        if (cobrosContext?.crearItem) {
            try {
                await cobrosContext.crearItem({
                    idReserva: null,
                    cliente: {
                        idUsuario: user.idUsuario || user.id || 1,
                        nombre: user.nombre || 'Cliente',
                        apellido: user.apellido || 'Demo',
                        dni: user.dni || '33788901'
                    },
                    concepto: `Inscripción clase: ${targetClase.nombre}`,
                    tipoCobro: 'Inscripción Clase',
                    monto: targetClase.precio,
                    montoFinal: targetClase.precio,
                    fecha: new Date().toISOString().split('T')[0],
                    estado: 'pagado',
                    metodo: 'MercadoPago'
                });
            } catch (err) {
                console.warn("CobrosContext omitido en este render", err);
            }
        }

        mostrarToast(`¡Te inscribiste con éxito a ${targetClase.nombre}!`, 'success');
        setModalPago({ open: false, clase: null });
    }

    async function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            await modificarClase(datos);
            mostrarToast('Clase actualizada correctamente.', 'success');
        } else {
            await crearClase(datos);
            mostrarToast('Clase programada exitosamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', clase: null });
    }

    async function handleAsistencia(idClase, recordAsistencias) {
        await registrarAsistencia(idClase, recordAsistencias);
        mostrarToast('Asistencia registrada correctamente.', 'success');
        setModalAsistencia({ open: false, clase: null });
    }

    async function handleToggleEstado(clase) {
        await cancelarClase(clase.idClase);
        mostrarToast(clase.estado === 'cancelada' ? 'Clase reprogramada con éxito.' : 'Clase cancelada correctamente.', clase.estado === 'cancelada' ? 'success' : 'warning');
        setModalBaja({ open: false, clase: null });
    }

    const clasesFiltradas = filtro
        ? clases.filter(c => c.nombre.toLowerCase().includes(filtro.toLowerCase()) || c.tipoClase.toLowerCase().includes(filtro.toLowerCase()))
        : clases;

    const programadas = clases.filter(c => c.estado === 'programada').length;
    const canceladas  = clases.filter(c => c.estado === 'cancelada').length;
    const profesoresDisponibles = profesores
        .filter(p => p.activo ?? p.estado === 'activo')
        .map(p => ({
            id: p.idUsuario,
            idUsuario: p.idUsuario,
            nombre: p.nombre,
            apellido: p.apellido,
            email: p.email,
            verificacionCertificacion: tieneCertificacionVerificada(p),
        }));

    if (loading) return <LoadingSpinner />;
    if (error)   return <ErrorMessage message={error} />;

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Gestión de Clases</h2>
                    <span className="crud-count">{clases.length} total</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input type="text" placeholder="Buscar clase..." value={filtro} onChange={e => setFiltro(e.target.value)} />
                    </div>
                    <Can roles={['Admin', 'Employee']}>
                        <button className="btn-primary-action" onClick={() => setModalForm({ open: true, modo: 'nuevo', clase: null })}>
                            <i data-lucide="calendar-plus" /> Programar Clase
                        </button>
                    </Can>
                </div>
            </div>

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

            <div className="panel-card tabla-panel">
                <ClasesTable
                    clases={clasesFiltradas} filtro={filtro} onLimpiarFiltro={() => setFiltro('')}
                    onVer={(c) => setModalDetalle({ open: true, clase: c })}
                    onEditar={(c) => setModalForm({ open: true, modo: 'editar', clase: c })}
                    onAsistencia={(c) => setModalAsistencia({ open: true, clase: c })}
                    onCancelar={(c) => setModalBaja({ open: true, clase: c })}
                    onSolicitarInscripcion={(c) => setModalPago({ open: true, clase: c })} // Disparador
                />
            </div>

            {/* MODALES REGULARES */}
            <Can roles={['Admin', 'Employee']}>
                <ClaseModal open={modalForm.open} modo={modalForm.modo} clase={modalForm.clase} profesoresDisp={profesoresDisponibles} alumnosDisp={ALUMNOS_DISPONIBLES} onGuardar={handleGuardar} onCerrar={() => setModalForm({ open: false, modo: 'nuevo', clase: null })} />
            </Can>
            <Can roles={['Admin', 'Employee', 'Professor']}>
                <AsistenciaModal open={modalAsistencia.open} clase={modalAsistencia.clase} onGuardar={handleAsistencia} onCerrar={() => setModalAsistencia({ open: false, clase: null })} />
            </Can>
            <ClaseModalDetalle open={modalDetalle.open} clase={modalDetalle.clase} onCerrar={() => setModalDetalle({ open: false, clase: null })} />
            <Can roles={['Admin', 'Employee']}>
                <ClaseModalBaja open={modalBaja.open} clase={modalBaja.clase} onConfirmar={handleToggleEstado} onCerrar={() => setModalBaja({ open: false, clase: null })} />
            </Can>

            {/* MODAL SIMULADOR PASARELA DE PAGO */}
            <SimuladorPagoClaseModal open={modalPago.open} clase={modalPago.clase} onConfirmar={handleConfirmarPago} onCerrar={() => setModalPago({ open: false, clase: null })} />

            <Toast toasts={toasts} />
        </>
    );
}
