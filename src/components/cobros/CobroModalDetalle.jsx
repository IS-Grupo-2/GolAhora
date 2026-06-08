// src/components/pagos/CobroModalDetalle.jsx
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

export default function CobroModalDetalle({ open, cobro, onCerrar, onImprimir }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, cobro]);

    if (!open || !cobro) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <div>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Detalle de Cobro #{String(cobro.idCobro).padStart(5, '0')}
                        </h3>
                        <span className={`badge ${cobro.estado === 'pagado' ? 'success' : 'danger'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                            {cobro.estado === 'pagado' ? 'Acreditado' : 'Anulado / Pendiente'}
                        </span>
                    </div>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <div className="detalle-grid">
                        <Campo label="Cliente" valor={`${cobro.cliente.nombre} ${cobro.cliente.apellido} (DNI: ${cobro.cliente.dni})`} full />
                        <Campo label="Concepto" valor={cobro.concepto} />
                        <Campo label="Tipo de Operación" valor={cobro.tipoCobro} />
                        <Campo label="Fecha" valor={formatearFecha(cobro.fecha)} />
                        <Campo label="Monto Base" valor={formatMoneda(cobro.monto)} />
                        
                        <Campo 
                            label="Descuento Aplicado" 
                            valor={cobro.descuento ? `${cobro.descuento.nombre} (-${cobro.descuento.porcentaje}%)` : 'Sin descuento'} 
                        />
                        <div className="detalle-campo detalle-full" style={{ background: '#f8fafc', borderColor: '#cbd5e1', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <span className="detalle-label" style={{ margin: 0, fontSize: '0.9rem' }}>Monto Final Cobrado</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--purple)' }}>{formatMoneda(cobro.montoFinal)}</span>
                        </div>
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                    <button className="btn-primary-action" onClick={() => onImprimir(cobro)} disabled={cobro.estado === 'anulado'}>
                        <i data-lucide="printer" /> Imprimir Comprobante
                    </button>
                </div>
            </div>
        </div>
    );
}
