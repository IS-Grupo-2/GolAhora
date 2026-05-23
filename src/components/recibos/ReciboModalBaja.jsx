// src/components/recibos/ReciboModalBaja.jsx
import { useEffect } from 'react';

export default function ReciboModalBaja({ open, recibo, onConfirmar, onCerrar }) {
    const esEmitido = recibo?.estado === 'emitido';

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, esEmitido]);

    if (!open || !recibo) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>{esEmitido ? 'Anular Recibo' : 'Reactivar Recibo'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                        {esEmitido ? (
                            <>
                                ¿Estás seguro que deseás <strong>anular</strong> el recibo 
                                <strong> {recibo.nroRecibo}</strong> de {recibo.cliente.nombre} {recibo.cliente.apellido}?
                                <br/><br/>
                                <span style={{fontSize: '0.85rem', color: '#dc2626'}}>Nota: Esto no elimina el cobro original, solo anula este comprobante de pago específico.</span>
                            </>
                        ) : (
                            <>¿Querés reactivar y dar por válido el recibo <strong>{recibo.nroRecibo}</strong>?</>
                        )}
                    </p>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className={esEmitido ? 'btn-modal-danger' : 'btn-modal-save'} onClick={() => onConfirmar(recibo)}>
                        <i data-lucide={esEmitido ? 'ban' : 'check-circle'} />
                        {esEmitido ? 'Confirmar Anulación' : 'Reactivar'}
                    </button>
                </div>
            </div>
        </div>
    );
}