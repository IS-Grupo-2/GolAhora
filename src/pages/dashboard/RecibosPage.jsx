// src/pages/dashboard/RecibosPage.jsx
import { useState, useEffect, useCallback } from 'react';
import RecibosTable from '../../components/recibos/RecibosTable';
import ReciboModal from '../../components/recibos/ReciboModal';
import ReciboModalDetalle from '../../components/recibos/ReciboModalDetalle';
import ReciboModalBaja from '../../components/recibos/ReciboModalBaja';

// ── Datos Mock (Cobros pendientes para emitir recibo) ─────────────────────────
const COBROS_MOCK = [
    { idCobro: 1003, cliente: { nombre: 'Lucas', apellido: 'Díaz', dni: '39800123' }, concepto: 'Torneo Relámpago', montoFinal: 8500 },
    { idCobro: 1004, cliente: { nombre: 'Valentina', apellido: 'García', dni: '44301987' }, concepto: 'Clase Particular', montoFinal: 6000 }
];

const INITIAL_RECIBOS = [
    {
        idRecibo: 1,
        nroRecibo: '0001-00001234',
        cobro: { idCobro: 1001, concepto: 'Alquiler F5 Noche', montoFinal: 12750 },
        cliente: { nombre: 'Juan', apellido: 'Pérez', dni: '40255711' },
        pago: { metodoPago: 'Transferencia', nroTransaccion: 'TRX-987654', fechaPago: '2026-05-22', estado: 'Completado' },
        fecha: '2026-05-22',
        total: 12750,
        detalles: 'Abonado en su totalidad',
        estado: 'emitido'
    }
];

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

export default function RecibosPage() {
    const [recibos, setRecibos] = useState(INITIAL_RECIBOS);
    const [nextId, setNextId] = useState(2);
    const [filtro, setFiltro] = useState('');
    const [toasts, setToasts] = useState([]);

    const [modalForm, setModalForm]       = useState({ open: false, modo: 'nuevo', recibo: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, recibo: null });
    const [modalBaja, setModalBaja]       = useState({ open: false, recibo: null });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    const mostrarToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    }, []);

    // Formateador de números de recibo falso
    const generarNroRecibo = (id) => `0001-${String(id + 1234).padStart(8, '0')}`;

    // ── CRUD Handlers ──────────────────────────────────────────────────────────
    function handleGuardar(datos) {
        if (modalForm.modo === 'editar') {
            setRecibos(prev => prev.map(r => r.idRecibo === datos.idRecibo ? { ...r, ...datos } : r));
            mostrarToast('Recibo modificado correctamente.', 'success');
        } else {
            const nuevo = { ...datos, idRecibo: nextId, nroRecibo: generarNroRecibo(nextId) };
            setRecibos(prev => [nuevo, ...prev]);
            setNextId(n => n + 1);
            mostrarToast('Recibo emitido exitosamente.', 'success');
        }
        setModalForm({ open: false, modo: 'nuevo', recibo: null });
    }

    function handleToggleEstado(recibo) {
        const nuevoEstado = recibo.estado === 'emitido' ? 'anulado' : 'emitido';
        setRecibos(prev => prev.map(r => r.idRecibo === recibo.idRecibo ? { ...r, estado: nuevoEstado } : r));
        mostrarToast(`Recibo ${nuevoEstado === 'anulado' ? 'anulado' : 'reactivado'}.`, nuevoEstado === 'anulado' ? 'warning' : 'success');
        setModalBaja({ open: false, recibo: null });
    }

    // RF56: Imprimir / Generar PDF
    function handleImprimir(recibo) {
        mostrarToast(`Preparando impresión de recibo ${recibo.nroRecibo}...`, 'info');
        setTimeout(() => {
            window.print();
        }, 800);
    }

    // ── Filtros y Stats ───────────────────────────────────────────────────────
    const recibosFiltrados = filtro
        ? recibos.filter(r => 
            r.cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
            r.cliente.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
            r.nroRecibo.includes(filtro)
          )
        : recibos;

    const recibosEmitidos = recibos.filter(r => r.estado === 'emitido').length;

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Recibos de Pago</h2>
                    <span className="crud-count">{recibos.length} registros</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input 
                            type="text" 
                            placeholder="Buscar por N° o cliente..." 
                            value={filtro} 
                            onChange={e => setFiltro(e.target.value)} 
                        />
                    </div>
                    <button className="btn-primary-action" onClick={() => setModalForm({ open: true, modo: 'nuevo', recibo: null })}>
                        <i data-lucide="receipt" /> Emitir Recibo
                    </button>
                </div>
            </div>

            <div className="crud-mini-stats">
                <div className="mini-stat blue">
                    <span className="mini-stat-num">{recibosEmitidos}</span>
                    <span className="mini-stat-label">Comprobantes Emitidos</span>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                <RecibosTable
                    recibos={recibosFiltrados}
                    filtro={filtro}
                    onLimpiarFiltro={() => setFiltro('')}
                    onVer={(r) => setModalDetalle({ open: true, recibo: r })}
                    onEditar={(r) => setModalForm({ open: true, modo: 'editar', recibo: r })}
                    onBaja={(r) => setModalBaja({ open: true, recibo: r })}
                    onImprimir={handleImprimir}
                />
            </div>

            <ReciboModal 
                open={modalForm.open} 
                modo={modalForm.modo} 
                recibo={modalForm.recibo} 
                cobrosPendientes={COBROS_MOCK}
                onGuardar={handleGuardar} 
                onCerrar={() => setModalForm({ open: false, modo: 'nuevo', recibo: null })} 
            />

            <ReciboModalDetalle
                open={modalDetalle.open}
                recibo={modalDetalle.recibo}
                onImprimir={handleImprimir}
                onCerrar={() => setModalDetalle({ open: false, recibo: null })}
            />

            <ReciboModalBaja
                open={modalBaja.open}
                recibo={modalBaja.recibo}
                onConfirmar={handleToggleEstado}
                onCerrar={() => setModalBaja({ open: false, recibo: null })}
            />

            <Toast toasts={toasts} />
        </>
    );
}