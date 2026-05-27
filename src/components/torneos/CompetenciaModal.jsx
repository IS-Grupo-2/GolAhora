// src/components/torneos/CompetenciaModal.jsx
import { useState, useEffect } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function CompetenciaModal({ isOpen, onClose, onSave, competenciaEditar }) {
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'liga',
        estado: 'inscripcion' // Cambiado por defecto a 'inscripcion'
    });

    useEffect(() => {
        if (competenciaEditar) {
            setFormData(competenciaEditar);
        } else {
            setFormData({
                nombre: '',
                tipo: 'liga',
                estado: 'inscripcion'
            });
        }
    }, [competenciaEditar, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); 
        onClose();
    };

    return (
        <div className={`dash-modal-overlay ${isOpen ? 'activo' : ''}`} onClick={onClose}>
            <div className="dash-modal" onClick={e => e.stopPropagation()}>
                
                <div className="dash-modal-header">
                    <h3>{competenciaEditar ? 'Editar Competencia' : 'Nueva Competencia'}</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <Icon name="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <form onSubmit={handleSubmit} id="competencia-form">
                        <div className="form-group">
                            <label>Nombre de la Competencia</label>
                            <input 
                                type="text" 
                                required
                                value={formData.nombre}
                                onChange={e => setFormData({...formData, nombre: e.target.value})}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tipo de Formato</label>
                                <select 
                                    value={formData.tipo}
                                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                                >
                                    <option value="liga">Liga (Round Robin)</option>
                                    <option value="torneo">Torneo (Eliminación)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Estado</label>
                                <select 
                                    value={formData.estado}
                                    onChange={e => setFormData({...formData, estado: e.target.value})}
                                >
                                    <option value="inscripcion">Inscripción Abierta</option>
                                    <option value="en_curso">En Curso</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="dash-modal-footer">
                    <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="competencia-form" className="btn-modal-save">
                        <Icon name="save" /> Guardar
                    </button>
                </div>

            </div>
        </div>
    );
}