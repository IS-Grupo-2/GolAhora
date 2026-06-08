// src/components/recibos/ReciboModalDetalle.jsx
import { useEffect } from 'react';
import { formatearFecha } from '../../utils/fechas';

function Campo({ label, valor, full }) {
    return (
        <div className={`detalle-campo${full ? ' detalle-full' : ''}`}>
            <span className="detalle-label">{label}</span>
            <span className="detalle-valor" style={{ fontWeight: 600 }}>{valor || '—'}</span>
        </div>
    );
}

function formatMoneda(valor) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
}

export default function ReciboModalDetalle({ open, recibo, onCerrar, onImprimir }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, recibo]);

    if (!open || !recibo) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                <div className="dash-modal-header" style={{ borderBottom: '2px dashed var(--border)' }}>
                    <div>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Recibo {recibo.nroRecibo}
                        </h3>
                        <span className={`badge ${recibo.estado === 'emitido' ? 'success' : 'danger'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                            {recibo.estado === 'emitido' ? 'Válido' : 'Anulado'}
                        </span>
                    </div>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <div className="detalle-grid">
                        <Campo label="Recibimos de (Cliente)" valor={`${recibo.cliente.nombre} ${recibo.cliente.apellido} (DNI: ${recibo.cliente.dni})`} full />
                        
                        <div className="detalle-campo detalle-full" style={{ background: '#f8fafc', borderColor: '#cbd5e1', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: '15px' }}>
                            <span className="detalle-label" style={{ margin: 0, fontSize: '1rem', color: 'var(--text)' }}>La suma de pesos</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{formatMoneda(recibo.total)}</span>
                        </div>

                        <Campo label="En concepto de" valor={`Cobro #${recibo.cobro.idCobro} - ${recibo.cobro.concepto}`} full />
                        
                        <Campo label="Método de Pago" valor={recibo.pago.metodoPago} />
                        <Campo label="N° Transacción" valor={recibo.pago.nroTransaccion} />
                        
                        <Campo label="Fecha de Emisión" valor={formatearFecha(recibo.fecha)} />
                        <Campo label="Detalles / Observaciones" valor={recibo.detalles} />
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                    <button className="btn-primary-action" onClick={() => onImprimir(recibo)} disabled={recibo.estado === 'anulado'}>
                        <i data-lucide="printer" /> Imprimir / Guardar PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
