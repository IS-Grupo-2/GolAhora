import { useEffect } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function ModalEliminar({ open, titulo, mensaje, nombreElemento, onConfirmar, onCerrar }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    if (!open) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>{titulo || 'Confirmar eliminación'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><Icon name="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Icon name="alert-triangle" style={{ color: '#ef4444', marginTop: '4px', minWidth: '24px' }} />
                        <div>
                            <p style={{ color: 'var(--text)', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                                {mensaje}
                            </p>
                            {nombreElemento && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                    <strong>{nombreElemento}</strong>
                                </p>
                            )}
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px', marginBottom: 0 }}>
                                Esta acción no puede deshacerse.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-danger" onClick={() => { onConfirmar(); onCerrar(); }}>
                        <Icon name="trash-2" />
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
