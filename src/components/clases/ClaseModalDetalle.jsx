// src/components/clases/ClaseModalDetalle.jsx
import { useEffect } from 'react';
import { formatearFecha } from '../../utils/fechas';

function formatFecha(fecha) {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
}

function Campo({ label, valor, full }) {
    return (
        <div className={`detalle-campo${full ? ' detalle-full' : ''}`}>
            <span className="detalle-label">{label}</span>
            <span className="detalle-valor">{valor || '—'}</span>
        </div>
    );
}

export default function ClaseModalDetalle({ open, clase, onCerrar }) {

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
    }, [open, clase]);

    if (!open || !clase) return null;

    const totalAlumnos = clase.alumnos?.length || 0;

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <div>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {clase.nombre}
                        </h3>
                        <span className={`badge ${clase.estado === 'cancelada' ? 'danger' : clase.estado === 'finalizada' ? 'success' : 'info'}`} style={{ marginTop: '4px', display: 'inline-block', textTransform: 'capitalize' }}>
                            {clase.estado.replace('_', ' ')}
                        </span>
                    </div>
                    <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                        <i data-lucide="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <div className="detalle-grid">
                        <Campo label="Tipo de Clase" valor={clase.tipoClase} />
                        <Campo label="Cancha / Espacio" valor={clase.cancha} />
                        <Campo label="Fecha" valor={formatearFecha(clase.fecha)} />
                        <Campo label="Horario" valor={`${clase.horario} hs`} />
                        <Campo label="Duración" valor={`${clase.duracionMin} minutos`} />
                        <Campo label="Precio / Costo" valor={`$${clase.precio}`} />
                        <Campo label="Capacidad Ocupada" valor={`${totalAlumnos} / ${clase.maxAlumnos} Alumnos`} />
                        <Campo label="ID de Clase" valor={`#${String(clase.idClase).padStart(4, '0')}`} />
                        
                        <Campo 
                            label="Profesor Asignado" 
                            valor={clase.profesor ? `${clase.profesor.nombre} ${clase.profesor.apellido} ${clase.profesor.verificacionCertificacion ? '✓ (Certificado)' : ''}` : 'Sin asignar'} 
                            full 
                        />
                        
                        <Campo label="Descripción / Planificación" valor={clase.descripcion} full />
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                        <span className="detalle-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Alumnos Inscriptos ({totalAlumnos})
                        </span>
                        {totalAlumnos === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', italic: 'true', margin: 0 }}>
                                No hay alumnos registrados en esta clase todavía.
                            </p>
                        ) : (
                            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {clase.alumnos.map(al => (
                                    <li key={al.id} style={{ listStyleType: 'square' }}>
                                        {al.nombre} {al.presente && <span style={{ color: '#16a34a', fontSize: '0.8rem', marginLeft: '6px' }}>(Asistió)</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}
