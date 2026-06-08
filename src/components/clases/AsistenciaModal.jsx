// src/components/clases/AsistenciaModal.jsx
import { useState, useEffect } from 'react';
import { formatearFecha } from '../../utils/fechas';

export default function AsistenciaModal({ open, clase, onGuardar, onCerrar }) {
    const [asistencias, setAsistencias] = useState({});

    useEffect(() => {
        if (!open || !clase) return;
        // Inicializar el estado local de asistencias basado en los alumnos de la clase
        const asisInicial = {};
        (clase.alumnos || []).forEach(al => {
            asisInicial[al.id] = al.presente || false;
        });
        setAsistencias(asisInicial);
    }, [open, clase]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    function toggleAsistencia(id) {
        setAsistencias(prev => ({ ...prev, [id]: !prev[id] }));
    }

    function handleGuardar() {
        onGuardar(clase.idClase, asistencias);
    }

    if (!open || !clase) return null;

    return (
        <div className="dash-modal-overlay activo" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal dash-modal--sm">
                <div className="dash-modal-header">
                    <h3>Registro de Asistencia</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Clase: <strong>{clase.nombre}</strong> ({formatearFecha(clase.fecha)})
                    </p>
                    
                    {(!clase.alumnos || clase.alumnos.length === 0) ? (
                        <div className="tabla-empty" style={{ padding: '2rem 0' }}>
                            <i data-lucide="users" style={{ width: 30, height: 30, opacity: 0.3 }} />
                            <p>No hay alumnos inscriptos.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {clase.alumnos.map(al => (
                                <label key={al.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{al.nombre}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={asistencias[al.id] || false}
                                        onChange={() => toggleAsistencia(al.id)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}>
                        <i data-lucide="check" /> Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
