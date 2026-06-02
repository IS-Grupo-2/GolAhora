import { useEffect } from 'react';

export default function AsistenciaDetalleModal({ open, clase, registros, onCerrar }) {
    
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    if (!open || !clase || !registros) return null;

    const presentes = registros.filter(r => r.presente).length;
    const ausentes = registros.length - presentes;

    return (
        <div className="dash-modal-overlay activo" role="dialog" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>Reporte de Asistencia: {clase.nombre}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{presentes}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>Presentes</span>
                        </div>
                        <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{ausentes}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase' }}>Ausentes</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {registros.map(reg => (
                            <div key={reg.cliente.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{reg.cliente.nombre} {reg.cliente.apellido}</strong>
                                    <span className={`badge ${reg.presente ? 'success' : 'danger'}`}>
                                        {reg.presente ? 'Presente' : 'Ausente'}
                                    </span>
                                </div>
                                {reg.observaciones && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                                        <i data-lucide="message-square" style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }}/> 
                                        {reg.observaciones}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}