// src/components/pagos/CobroModalBaja.jsx
import { useEffect } from 'react';

export default function CobroModalBaja({ open, cobro, onConfirmar, onCerrar }) {
    const esPagado = cobro?.estado === 'pagado';

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open, esPagado]);

    if (!open || !cobro) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>{esPagado ? 'Anular Cobro' : 'Reactivar Cobro'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                        {esPagado ? (
                            <>
                                ¿Estás seguro que deseás <strong>anular</strong> el cobro 
                                #{String(cobro.idCobro).padStart(5, '0')} por <strong>${cobro.montoFinal}</strong>? 
                                <br/><br/>
                                Esto invalidará el comprobante de {cobro.cliente.nombre} {cobro.cliente.apellido}.
                            </>
                        ) : (
                            <>¿Querés reactivar y dar por pagado el cobro #{String(cobro.idCobro).padStart(5, '0')}?</>
                        )}
                    </p>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className={esPagado ? 'btn-modal-danger' : 'btn-modal-save'} onClick={() => onConfirmar(cobro)}>
                        <i data-lucide={esPagado ? 'ban' : 'check-circle'} />
                        {esPagado ? 'Confirmar Anulación' : 'Confirmar Reactivación'}
                    </button>
                </div>
            </div>
        </div>
    );
}