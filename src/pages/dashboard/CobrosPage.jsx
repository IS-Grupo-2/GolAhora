// src/pages/dashboard/CobrosPage.jsx
import { useState, useEffect, useCallback } from 'react';
import CobrosTable from '../../components/cobros/CobrosTable';
import CobroModal from '../../components/cobros/CobroModal';
import CobroModalDetalle from '../../components/cobros/CobroModalDetalle';
import CobroModalBaja from '../../components/cobros/CobroModalBaja';

// ── Datos Mock (Clientes y Descuentos para RF50) ──────────────────────────────
const CLIENTES_MOCK = [
    { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '40255711' },
    { id: 2, nombre: 'Camila', apellido: 'Torres', dni: '42100055' }
];

const DESCUENTOS_MOCK = [
    { id: 1, nombre: 'Socio Activo', porcentaje: 15 },
    { id: 2, nombre: 'Promo Familiar', porcentaje: 25 },
    { id: 3, nombre: 'Convenio Facultad', porcentaje: 10 }
];

const INITIAL_COBROS = [
    {
        idCobro: 1001, cliente: CLIENTES_MOCK[0], concepto: 'Alquiler F5 Noche', 
        tipoCobro: 'Reserva Cancha', monto: 15000, montoFinal: 12750, 
        descuento: DESCUENTOS_MOCK[0], fecha: '2026-05-22', estado: 'pagado'
    },
    {
        idCobro: 1002, cliente: CLIENTES_MOCK[1], concepto: 'Cuota Escuelita Mayo', 
        tipoCobro: 'Clase/Entrenamiento', monto: 20000, montoFinal: 20000, 
        descuento: null, fecha: '2026-05-20', estado: 'anulado'
    }
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CobrosPage() {
    const [cobros, setCobros] = useState(INITIAL_COBROS);
    const [nextId, setNextId] = useState(1003);
    const [filtro, setFiltro] = useState('');
    const [toasts, setToasts] = useState([]);

    const [modalForm, setModalForm]       = useState({ open: false, modo: 'nuevo', cobro: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, cobro: null });
    const [modalBaja, setModalBaja]       = useState({ open: false, cobro: null });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // ── CRUD Handlers ──────────────────────────────────────────────────────────
    function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            setCobros(prev => prev.map(c => c.idCobro === datos.idCobro ? { ...c, ...datos } : c));
            mostrarToast('Cobro modificado correctamente.', 'success');
        } else {
            const nuevo = { ...datos, idCobro: nextId };
            setCobros(prev => [nuevo, ...prev]);
            setNextId(n => n + 1);
            mostrarToast('Cobro registrado exitosamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', cobro: null });
    }

    function handleToggleEstado(cobro) {
        const nuevoEstado = cobro.estado === 'pagado' ? 'anulado' : 'pagado';
        setCobros(prev => prev.map(c => c.idCobro === cobro.idCobro ? { ...c, estado: nuevoEstado } : c));
        mostrarToast(`Cobro ${nuevoEstado === 'anulado' ? 'anulado' : 'reactivado'}.`, nuevoEstado === 'anulado' ? 'warning' : 'success');
        setModalBaja({ open: false, cobro: null });
    }

    // RF49: Imprimir
    function handleImprimir(cobro) {
        mostrarToast(`Generando comprobante de pago #${cobro.idCobro}...`, 'info');
        setTimeout(() => {
            window.print(); // Invoca el diálogo de impresión real del navegador
        }, 800);
    }

    // ── Filtros y Stats ───────────────────────────────────────────────────────
    const cobrosFiltrados = filtro
        ? cobros.filter(c => 
            c.cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
            c.cliente.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
            c.concepto.toLowerCase().includes(filtro.toLowerCase())
          )
        : cobros;

    const totalRecaudado = cobros.filter(c => c.estado === 'pagado').reduce((acc, c) => acc + c.montoFinal, 0);
    const totalCobros = cobros.filter(c => c.estado === 'pagado').length;

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Gestión de Cobros</h2>
                    <span className="crud-count">{cobros.length} registros</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input 
                            type="text" 
                            placeholder="Buscar por cliente o concepto..." 
                            value={filtro} 
                            onChange={e => setFiltro(e.target.value)} 
                        />
                    </div>
                    <button className="btn-primary-action" onClick={() => setModalForm({ open: true, modo: 'nuevo', cobro: null })}>
                        <i data-lucide="receipt" /> Registrar Cobro
                    </button>
                </div>
            </div>

            <div className="crud-mini-stats">
                <div className="mini-stat green">
                    <span className="mini-stat-num">${new Intl.NumberFormat('es-AR').format(totalRecaudado)}</span>
                    <span className="mini-stat-label">Recaudación (Acreditado)</span>
                </div>
                <div className="mini-stat blue">
                    <span className="mini-stat-num">{totalCobros}</span>
                    <span className="mini-stat-label">Cobros Realizados</span>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                <CobrosTable
                    cobros={cobrosFiltrados}
                    filtro={filtro}
                    onLimpiarFiltro={() => setFiltro('')}
                    onVer={(c) => setModalDetalle({ open: true, cobro: c })}
                    onEditar={(c) => setModalForm({ open: true, modo: 'editar', cobro: c })}
                    onBaja={(c) => setModalBaja({ open: true, cobro: c })}
                    onImprimir={handleImprimir}
                />
            </div>

            <CobroModal 
                open={modalForm.open} 
                modo={modalForm.modo} 
                cobro={modalForm.cobro} 
                clientes={CLIENTES_MOCK}
                descuentos={DESCUENTOS_MOCK}
                onGuardar={handleGuardar} 
                onCerrar={() => setModalForm({ open: false, modo: 'nuevo', cobro: null })} 
            />

            <CobroModalDetalle
                open={modalDetalle.open}
                cobro={modalDetalle.cobro}
                onImprimir={handleImprimir}
                onCerrar={() => setModalDetalle({ open: false, cobro: null })}
            />

            <CobroModalBaja
                open={modalBaja.open}
                cobro={modalBaja.cobro}
                onConfirmar={handleToggleEstado}
                onCerrar={() => setModalBaja({ open: false, cobro: null })}
            />

            <Toast toasts={toasts} />
        </>
    );
}