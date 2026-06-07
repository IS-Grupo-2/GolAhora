// src/components/profesores/ProfesorModalDetalle.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCertificadoLocal } from '../../utils/certificadosStorage';
import { estadoCertificacionProfesor } from '../../utils/profesoresCertificacion';

// ── Helpers ───────────────────────────────────────────────────────────────────
function iniciales(p) {
    return (p.nombre[0] + p.apellido[0]).toUpperCase();
}

function formatFecha(fecha) {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
}

// ✅ FIX: convierte el array de objetos {nombre, ...} a string legible
function formatCerts(certs) {
    if (!certs) return '—';
    if (Array.isArray(certs)) return certs.map(c => c.nombre).join(', ') || '—';
    return certs;
}

function formatArchivoCertificado(certs) {
    if (!Array.isArray(certs)) return 'â€”';
    return certs.find(c => c.archivo)?.archivo?.nombre || 'â€”';
}

function obtenerArchivoCertificado(certs) {
    if (!Array.isArray(certs)) return null;
    return certs.find(c => c.archivo)?.archivo || null;
}

function Campo({ label, valor, full }) {
    return (
        <div className={`detalle-campo${full ? ' detalle-full' : ''}`}>
            <span className="detalle-label">{label}</span>
            <span className="detalle-valor">{valor || '—'}</span>
        </div>
    );
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ProfesorModalDetalle({ open, profesor, onCerrar }) {
    const { user } = useAuth();
    const [contenidoCertificado, setContenidoCertificado] = useState(null);
    const [cargandoCertificado, setCargandoCertificado] = useState(false);

    // Escape para cerrar
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Lucide icons
    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    const archivoCertificado = profesor ? obtenerArchivoCertificado(profesor.certificaciones) : null;

    useEffect(() => {
        let cancelado = false;

        async function cargarContenido() {
            setContenidoCertificado(null);
            setCargandoCertificado(false);

            if (!open || user?.role !== 'Admin' || !archivoCertificado) return;

            if (archivoCertificado.contenido) {
                setContenidoCertificado(archivoCertificado.contenido);
                return;
            }

            if (!archivoCertificado.storageKey) return;

            setCargandoCertificado(true);
            try {
                const contenido = await obtenerCertificadoLocal(archivoCertificado.storageKey);
                if (!cancelado) setContenidoCertificado(contenido);
            } catch {
                if (!cancelado) setContenidoCertificado(null);
            } finally {
                if (!cancelado) setCargandoCertificado(false);
            }
        }

        cargarContenido();

        return () => { cancelado = true; };
    }, [open, user?.role, archivoCertificado?.storageKey, archivoCertificado?.contenido]);

    if (!open || !profesor) return null;
    const estaActivo = profesor.activo ?? profesor.estado === 'activo';
    const estadoCertificacion = {
        verificada: 'Verificada',
        pendiente: 'Pendiente',
        sin_certificado: 'Sin certificado',
    }[estadoCertificacionProfesor(profesor)];
    const puedeAbrirCertificado = user?.role === 'Admin' && Boolean(contenidoCertificado || archivoCertificado?.contenido);

    function descargarCertificado() {
        const contenido = contenidoCertificado || archivoCertificado?.contenido;
        if (!contenido) return;

        const link = document.createElement('a');
        link.href = contenido;
        link.download = archivoCertificado?.nombre || `certificado-${profesor.apellido}-${profesor.nombre}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div
            className="dash-modal-overlay activo"
            role="dialog"
            aria-modal="true"
            onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}
        >
            <div className="dash-modal">
                {/* HEADER */}
                <div className="dash-modal-header">
                    <h3>Detalle del profesor</h3>
                    <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                        <i data-lucide="x" />
                    </button>
                </div>

                {/* BODY */}
                <div className="dash-modal-body">
                    {/* Avatar */}
                    <div className={`detalle-avatar${estaActivo ? ' active' : ' inactive'}`}>
                        {iniciales(profesor)}
                    </div>
                    <div className="detalle-nombre">
                        {profesor.nombre} {profesor.apellido}
                    </div>
                    <div className="detalle-username">
                        @{profesor.username}
                        &nbsp;·&nbsp;
                        <span className={`badge ${estaActivo ? 'success' : 'danger'}`}>
                            {estaActivo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    {/* Grid de datos */}
                    <div className="detalle-grid">
                        <Campo label="Legajo"       valor={profesor.legajo} />
                        <Campo label="Especialidad" valor={profesor.especialidad} />
                        <Campo label="Turno"        valor={profesor.turno} />
                        <Campo label="DNI"          valor={profesor.dni} />
                        <Campo label="Teléfono"     valor={profesor.telefono} />
                        <Campo label="Nacimiento"  valor={formatFecha(profesor.fechaNacimiento)} />
                        <Campo label="Ingreso"      valor={formatFecha(profesor.fechaRegistro)} />
                        <Campo label="Email"        valor={profesor.email}                        full />
                        <Campo label="Certificaciones" valor={formatCerts(profesor.certificaciones)} full />
                        <Campo label="Archivo certificado" valor={formatArchivoCertificado(profesor.certificaciones)} full />
                        <Campo
                            label="Certificacion"
                            valor={profesor.verificacionCertificacion ? '✓ Verificada' : '✗ Sin verificar'}
                        />
                        <Campo label="ID" valor={`#${String(profesor.idUsuario).padStart(4, '0')}`} />
                    </div>

                    {user?.role === 'Admin' && archivoCertificado?.nombre && (
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn-primary-action"
                                onClick={descargarCertificado}
                                disabled={!puedeAbrirCertificado}
                                title={puedeAbrirCertificado ? 'Guardar certificado cargado' : 'El certificado todavia no esta disponible para guardar'}
                            >
                                <i data-lucide="download" />
                                {cargandoCertificado ? 'Cargando certificado...' : 'Guardar certificado'}
                            </button>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}
