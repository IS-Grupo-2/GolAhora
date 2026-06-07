export function normalizarCertificaciones(certificaciones) {
    if (!certificaciones) return [];

    if (Array.isArray(certificaciones)) {
        return certificaciones.map(certificacion => ({
            nombre: certificacion.nombre || certificacion.archivo?.nombre || 'Certificado',
            entidadEmisora: certificacion.entidadEmisora || '',
            fechaEmision: certificacion.fechaEmision || '',
            fechaVencimiento: certificacion.fechaVencimiento || '',
            archivo: certificacion.archivo || null,
            verificada: certificacion.verificada === true,
            estado: certificacion.verificada ? 'verificada' : (certificacion.estado || 'pendiente'),
        }));
    }

    return String(certificaciones)
        .split(',')
        .map(nombre => nombre.trim())
        .filter(Boolean)
        .map(nombre => ({
            nombre,
            entidadEmisora: '',
            fechaEmision: '',
            fechaVencimiento: '',
            archivo: null,
            verificada: false,
            estado: 'pendiente',
        }));
}

export function tieneCertificadoCargado(profesor) {
    return normalizarCertificaciones(profesor?.certificaciones).length > 0;
}

export function tieneCertificacionPendiente(profesor) {
    return tieneCertificadoCargado(profesor) && !tieneCertificacionVerificada(profesor);
}

export function tieneCertificacionVerificada(profesor) {
    return (
        Boolean(profesor?.verificacionCertificacion) ||
        normalizarCertificaciones(profesor?.certificaciones).some(certificacion => certificacion.verificada === true)
    );
}

export function estadoCertificacionProfesor(profesor) {
    if (tieneCertificacionVerificada(profesor)) return 'verificada';
    if (tieneCertificacionPendiente(profesor)) return 'pendiente';
    return 'sin_certificado';
}

export function verificarCertificacionesProfesor(profesor) {
    const certificaciones = normalizarCertificaciones(profesor.certificaciones);
    const certificacionesActualizadas = certificaciones.map(certificacion => ({
        ...certificacion,
        verificada: true,
        estado: 'verificada',
    }));

    return {
        ...profesor,
        certificaciones: certificacionesActualizadas,
        verificacionCertificacion: certificacionesActualizadas.length > 0,
    };
}
