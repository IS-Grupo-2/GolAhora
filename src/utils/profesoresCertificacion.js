export function normalizarCertificaciones(certificaciones) {
    if (!certificaciones) return [];
    if (Array.isArray(certificaciones)) return certificaciones;

    return String(certificaciones)
        .split(',')
        .map(nombre => nombre.trim())
        .filter(Boolean)
        .map(nombre => ({
            nombre,
            entidadEmisora: '',
            fechaEmision: '',
            fechaVencimiento: '',
            verificada: false,
        }));
}

export function certificacionEstaVencida(certificacion, hoy = new Date()) {
    if (!certificacion?.fechaVencimiento) return false;
    const vencimiento = new Date(`${certificacion.fechaVencimiento}T23:59:59`);
    return Number.isNaN(vencimiento.getTime()) ? false : vencimiento < hoy;
}

export function tieneCertificacionVencida(profesor, hoy = new Date()) {
    return normalizarCertificaciones(profesor?.certificaciones).some(certificacion =>
        certificacionEstaVencida(certificacion, hoy)
    );
}

export function tieneCertificacionVigente(profesor, hoy = new Date()) {
    return normalizarCertificaciones(profesor?.certificaciones).some(certificacion =>
        !certificacionEstaVencida(certificacion, hoy)
    );
}

export function tieneCertificacionVerificada(profesor) {
    return (
        (Boolean(profesor?.verificacionCertificacion) && !tieneCertificacionVencida(profesor))
        || normalizarCertificaciones(profesor?.certificaciones).some(certificacion =>
            certificacion.verificada && !certificacionEstaVencida(certificacion)
        )
    );
}

export function verificarCertificacionesProfesor(profesor) {
    const certificaciones = normalizarCertificaciones(profesor.certificaciones);
    const vencida = certificaciones.some(certificacion => certificacionEstaVencida(certificacion));
    const certificacionesActualizadas = certificaciones.map(certificacion => ({
        ...certificacion,
        verificada: !vencida && !certificacionEstaVencida(certificacion),
    }));

    return {
        ...profesor,
        certificaciones: certificacionesActualizadas,
        verificacionCertificacion: !vencida && certificacionesActualizadas.some(certificacion => certificacion.verificada),
        activo: vencida ? false : (profesor.activo ?? profesor.estado !== 'inactivo'),
        estado: vencida ? 'inactivo' : 'activo',
    };
}
