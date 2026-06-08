// src/components/profesores/ProfesoresTable.jsx
import Can from '../Can';
import { useAuth } from '../../context/AuthContext';
import {
    estadoCertificacionProfesor,
    tieneCertificadoCargado,
    tieneCertificacionVerificada,
} from '../../utils/profesoresCertificacion';

function iniciales(p) {
    if (!p.nombre || !p.apellido) return '??';
    return (p.nombre[0] + p.apellido[0]).toUpperCase();
}

function BadgeEstado({ activo }) {
    return (
        <span className={`badge ${activo ? 'success' : 'danger'}`}>
            {activo ? 'Activo' : 'Inactivo'}
        </span>
    );
}

export default function ProfesoresTable({
    profesores,
    filtro,
    onLimpiarFiltro,
    onVer,
    onEditar,
    onBaja,
    onVerificarCertificacion,
}) {
    const { user } = useAuth();

    if (!profesores || profesores.length === 0) {
        return (
            <div className="tabla-empty">
                <i data-lucide="search-x" />
                <p>No se encontraron profesores{filtro ? ' con ese criterio' : ''}.</p>
                {filtro && (
                    <button className="link-btn" onClick={onLimpiarFiltro}>
                        Limpiar búsqueda
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Profesor</th>
                        <th>Especialidad</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {profesores.map(p => {
                        const isActivo = p.activo ?? (p.estado === 'activo');
                        const certificacionVerificada = tieneCertificacionVerificada(p);
                        const tieneCertificado = tieneCertificadoCargado(p);
                        const esPropioProfesor = user?.role === 'Professor' && (
                            user?.idUsuario === p.idUsuario ||
                            user?.id === p.idUsuario ||
                            user?.email === p.email ||
                            user?.username === p.username
                        );
                        const puedeEditar = user?.role === 'Admin' || esPropioProfesor;
                        const estadoCertificacion = estadoCertificacionProfesor(p);
                        const badgeCertificacion = {
                            verificada: { clase: 'success', texto: 'Cert. verificada' },
                            pendiente: { clase: 'warning', texto: 'Cert. pendiente' },
                            sin_certificado: { clase: 'neutral', texto: 'Sin certificado' },
                        }[estadoCertificacion];

                        return (
                            <tr key={p.idUsuario}>
                                <td>
                                    <div className="user-cell">
                                        <div className={`user-avatar-sm${!isActivo ? ' inactive' : ''}`}>
                                            {iniciales(p)}
                                        </div>
                                        <div className="user-cell-info">
                                            <strong>{p.nombre} {p.apellido}</strong>
                                            <span>@{p.username}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{p.especialidad || '—'}</td>
                                <td>{p.telefono || '—'}</td>
                                <td>
                                    <BadgeEstado activo={isActivo} />
                                    <span
                                        className={`badge ${badgeCertificacion.clase}`}
                                        style={{ marginLeft: '0.4rem' }}
                                    >
                                        {badgeCertificacion.texto}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        {/* Ver Detalle: visible para admin y empleado */}
                                        <Can roles={['Admin', 'Employee']}>
                                            <button
                                                className="action-btn view"
                                                title="Ver detalle"
                                                onClick={() => onVer(p)}
                                            >
                                                <i data-lucide="eye" />
                                            </button>
                                        </Can>

                                        {/* Editar: admin o profesor sobre su propio registro */}
                                        {puedeEditar && (
                                            <button
                                                className="action-btn edit"
                                                title="Editar"
                                                onClick={() => onEditar(p)}
                                            >
                                                <i data-lucide="pencil" />
                                            </button>
                                        )}

                                        {/* Dar de baja / Reactivar: Solo admin */}
                                        <Can roles={['Admin']}>
                                            <button
                                                className="action-btn toggle"
                                                title={isActivo ? 'Deshabilitar' : 'Reactivar'}
                                                onClick={() => onBaja(p)}
                                            >
                                                <i data-lucide={isActivo ? 'user-x' : 'user-check'} />
                                            </button>
                                        </Can>

                                        {/* Verificar certificacion: Solo admin */}
                                        <Can roles={['Admin']}>
                                            {!certificacionVerificada && tieneCertificado && (
                                                <button
                                                    className="action-btn edit"
                                                    title="Verificar certificación"
                                                    onClick={() => onVerificarCertificacion(p)}
                                                >
                                                    <i data-lucide="badge-check" />
                                                </button>
                                            )}
                                        </Can>

                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
