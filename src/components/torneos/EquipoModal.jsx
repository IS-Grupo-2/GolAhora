import { useState, useEffect } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

function nombreUsuario(usuario) {
    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || usuario.username || usuario.email;
}

const MAX_INTEGRANTES = 16;

export default function EquipoModal({ isOpen, onClose, onSave, equipoEditar, usuarios = [], usuarioActual = null, modoCliente = false }) {
    const [nombre, setNombre] = useState('');
    const [capitan, setCapitan] = useState('');
    const [nuevoIntegrante, setNuevoIntegrante] = useState('');
    const [integrantes, setIntegrantes] = useState([]);
    const [errorIntegrantes, setErrorIntegrantes] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        if (equipoEditar) {
            setNombre(equipoEditar.nombre || '');
            setCapitan(equipoEditar.capitan || '');
            setIntegrantes(equipoEditar.integrantes || []);
        } else {
            setNombre('');
            const nombreActual = usuarioActual ? nombreUsuario(usuarioActual) : '';
            setCapitan(modoCliente ? nombreActual : '');
            setIntegrantes(modoCliente && nombreActual ? [nombreActual] : []);
        }
        setNuevoIntegrante('');
        setErrorIntegrantes('');
    }, [equipoEditar, isOpen, modoCliente, usuarioActual]);

    useEffect(() => {
        if (isOpen && window.lucide) window.lucide.createIcons();
    }, [isOpen, integrantes]);

    if (!isOpen) return null;

    const usuariosDisponibles = usuarios.filter(u => u.activo !== false && u.estado !== 'inactivo');

    const handleAddIntegrante = () => {
        const nombre = nuevoIntegrante.trim();
        setErrorIntegrantes('');
        if (!nombre) return;
        if (integrantes.some(integrante => integrante.toLowerCase() === nombre.toLowerCase())) return;
        if (integrantes.length >= MAX_INTEGRANTES) {
            setErrorIntegrantes(`Cada equipo puede tener como máximo ${MAX_INTEGRANTES} integrantes.`);
            return;
        }
        setIntegrantes([...integrantes, nombre]);
        setNuevoIntegrante('');
    };

    const handleRemoveIntegrante = (index) => {
        setErrorIntegrantes('');
        setIntegrantes(integrantes.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const integrantesFinales = integrantes.includes(capitan) ? integrantes : [capitan, ...integrantes];
        if (integrantesFinales.length > MAX_INTEGRANTES) {
            setErrorIntegrantes(`Cada equipo puede tener como máximo ${MAX_INTEGRANTES} integrantes incluyendo al capitán.`);
            return;
        }
        onSave({
            ...(equipoEditar && { idEquipo: equipoEditar.idEquipo, fechaCreacion: equipoEditar.fechaCreacion }),
            nombre,
            capitan,
            integrantes: integrantesFinales,
            creadoPor: usuarioActual ? {
                idUsuario: usuarioActual.idUsuario || usuarioActual.id,
                id: usuarioActual.id || usuarioActual.idUsuario,
                email: usuarioActual.email,
                username: usuarioActual.username || usuarioActual.userName,
                nombre: usuarioActual.nombre,
                apellido: usuarioActual.apellido,
            } : equipoEditar?.creadoPor,
        });
        onClose();
    };

    return (
        <div className="dash-modal-overlay activo" onClick={onClose}>
            <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="dash-modal-header">
                    <h3>{equipoEditar ? 'Editar equipo' : 'Nuevo equipo'}</h3>
                    <button className="dash-modal-close" onClick={onClose}>
                        <Icon name="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nombre del equipo <span className="req">*</span></label>
                            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Los Galacticos FC" required />
                        </div>

                        <div className="form-group">
                            <label>Capitan del equipo <span className="req">*</span></label>
                            {modoCliente ? (
                                <input value={capitan} readOnly />
                            ) : (
                                <select value={capitan} onChange={e => setCapitan(e.target.value)} required>
                                    <option value="">Seleccionar usuario</option>
                                    {usuariosDisponibles.map(usuario => {
                                        const nombre = nombreUsuario(usuario);
                                        return <option key={`${usuario.rol}-${usuario.idUsuario || usuario.id}`} value={nombre}>{nombre}</option>;
                                    })}
                                </select>
                            )}
                        </div>

                        <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                            <label>Integrantes ({integrantes.length}/{MAX_INTEGRANTES})</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={nuevoIntegrante}
                                    onChange={e => setNuevoIntegrante(e.target.value)}
                                    placeholder="Nombre y apellido"
                                    disabled={integrantes.length >= MAX_INTEGRANTES}
                                />
                                <button type="button" className="btn-primary-action" style={{ padding: '0 12px' }} onClick={handleAddIntegrante} disabled={integrantes.length >= MAX_INTEGRANTES}>
                                    <Icon name="plus" />
                                </button>
                            </div>
                            {errorIntegrantes && (
                                <p style={{ margin: '8px 0 0', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {errorIntegrantes}
                                </p>
                            )}

                            <ul style={{ marginTop: '12px', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {integrantes.map((player, index) => (
                                    <li key={index} style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                                        <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>{player}</span>
                                        <button type="button" style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleRemoveIntegrante(index)}>
                                            <Icon name="trash" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="dash-modal-footer" style={{ padding: '15px 0 0 0' }}>
                            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn-modal-save">
                                <Icon name="save" /> Guardar equipo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
