import { useEffect } from 'react';

export default function UsuarioModalBaja({ open, usuario, onConfirmar, onCerrar }) {
    const deBaja = usuario?.estado === 'activo';

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
    }, [open, deBaja]);

    if (!open || !usuario) return null;

    return (
        <div
            className="dash-modal-overlay activo"
            role="dialog"
            aria-modal="true"
            onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}
        >
            <div className="dash-modal dash-modal--sm">
                {/* HEADER */}
                <div className="dash-modal-header">
                    <h3>{deBaja ? 'Dar de baja' : 'Reactivar cliente'}</h3>
                    <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                        <i data-lucide="x" />
                    </button>
                </div>

                {/* BODY */}
                <div className="dash-modal-body">
                    <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                        {deBaja ? (
                            <>
                                ¿Estás seguro que querés dar de baja a{' '}
                                <strong>{usuario.nombre} {usuario.apellido}</strong>?
                                <br />
                                El cliente no podrá acceder al sistema.
                            </>
                        ) : (
                            <>
                                ¿Querés reactivar a{' '}
                                <strong>{usuario.nombre} {usuario.apellido}</strong>?
                            </>
                        )}
                    </p>
                </div>

                {/* FOOTER */}
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-danger" onClick={() => onConfirmar(usuario)}>
                        <i data-lucide={deBaja ? 'user-x' : 'user-check'} />
                        {deBaja ? 'Dar de baja' : 'Reactivar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
