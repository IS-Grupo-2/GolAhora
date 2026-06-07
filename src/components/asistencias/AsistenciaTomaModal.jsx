import { useState, useEffect } from 'react';

function nombreAlumno(alumno) {
    return [alumno.nombre, alumno.apellido].filter(Boolean).join(' ') || alumno.email || `Alumno #${alumno.id}`;
}

export default function AsistenciaTomaModal({ open, clase, registrosPrevios, onGuardar, onCerrar }) {
    // Estado que mapea ID del cliente -> { presente: boolean, observaciones: string }
    const [asistencias, setAsistencias] = useState({});

    useEffect(() => {
        if (!open || !clase) return;
        
        const inicial = {};
        (clase.alumnos || []).forEach(al => {
            // Buscamos si ya hay un registro previo en la BD para este alumno (Modificación RF41)
            const previo = (registrosPrevios || []).find(r => r.cliente.id === al.id);
            inicial[al.id] = {
                presente: previo ? previo.presente : false,
                observaciones: previo ? previo.observaciones : ''
            };
        });
        setAsistencias(inicial);
    }, [open, clase, registrosPrevios]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    function togglePresente(id) {
        setAsistencias(prev => ({
            ...prev,
            [id]: { ...prev[id], presente: !prev[id].presente }
        }));
    }

    function changeObservacion(id, text) {
        setAsistencias(prev => ({
            ...prev,
            [id]: { ...prev[id], observaciones: text }
        }));
    }

    function handleGuardar() {
        // Formateamos los datos para respetar el UML: ASISTENCIA
        const datosUML = clase.alumnos.map(al => ({
            idAsistencia: Date.now() + al.id, // ID ficticio
            clase: clase,
            cliente: {
                ...al,
                nombre: nombreAlumno(al),
            },
            fecha: new Date().toISOString().split('T')[0],
            presente: asistencias[al.id].presente,
            observaciones: asistencias[al.id].observaciones
        }));
        onGuardar(clase.idClase, datosUML);
    }

    if (!open || !clase) return null;

    return (
        <div className="dash-modal-overlay activo" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal" style={{ maxWidth: '600px' }}>
                <div className="dash-modal-header">
                    <h3>Pasar Lista - {clase.nombre}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body" style={{ padding: '0' }}>
                    <div style={{ padding: '1rem 1.4rem', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Fecha: <strong>{clase.fecha}</strong> | Horario: <strong>{clase.horario} hs</strong>
                        </span>
                    </div>

                    <div style={{ padding: '1rem 1.4rem', maxHeight: '50vh', overflowY: 'auto' }}>
                        {(!clase.alumnos || clase.alumnos.length === 0) ? (
                            <div className="tabla-empty">
                                <i data-lucide="users" />
                                <p>No hay alumnos inscriptos en esta clase.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {clase.alumnos.map(al => {
                                    const record = asistencias[al.id] || { presente: false, observaciones: '' };
                                    return (
                                        <div key={al.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong style={{ color: 'var(--text)', fontSize: '0.95rem' }}>{nombreAlumno(al)}</strong>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: record.presente ? '#f0fdf4' : '#fef2f2', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${record.presente ? '#bbf7d0' : '#fecaca'}` }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: record.presente ? '#16a34a' : '#ef4444' }}>
                                                        {record.presente ? 'Presente' : 'Ausente'}
                                                    </span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={record.presente}
                                                        onChange={() => togglePresente(al.id)}
                                                        style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
                                                    />
                                                </label>
                                            </div>

                                            <input 
                                                type="text" 
                                                placeholder="Observaciones (ej. Lesión leve, llega tarde...)"
                                                value={record.observaciones}
                                                onChange={(e) => changeObservacion(al.id, e.target.value)}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', background: '#f8fafc', color: 'var(--text)', outline: 'none' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}>
                        <i data-lucide="save" /> Guardar Registro
                    </button>
                </div>
            </div>
        </div>
    );
}
