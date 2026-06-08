import { formatearFecha } from './fechas';

export function calcularPoliticaReembolso(reserva, ahora = new Date()) {
    const inicioReserva = new Date(`${reserva.fechaUso}T${reserva.horaInicio || '00:00'}:00`);
    const horasAntelacion = (inicioReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    const porcentaje = horasAntelacion > 6 ? 100 : 50;

    return {
        porcentaje,
        horasAntelacion,
        descripcion: porcentaje === 100
            ? 'Reembolso del 100% por cancelación con más de 6 horas de antelación.'
            : 'Reembolso del 50% por cancelación dentro de las 6 horas previas al inicio de la reserva.'
    };
}

export function reservaEstaPagada(reserva, cobroAsociado) {
    return reserva?.cobro?.estado === 'pagado' || cobroAsociado?.estado === 'pagado';
}

export function crearReciboReembolsoReserva({ reserva, cobroAsociado, politica }) {
    const basePago = Number(cobroAsociado?.montoFinal ?? reserva?.montoTotal ?? 0);
    const total = Math.round((basePago * politica.porcentaje) / 100);
    const idBase = reserva.idReserva || Date.now();

    return {
        idRecibo: Number(`8${String(idBase).slice(-10)}${politica.porcentaje}`),
        nroRecibo: `REEM-${String(idBase).padStart(8, '0')}-${politica.porcentaje}`,
        cobro: {
            idCobro: cobroAsociado?.idCobro || `RES-${idBase}`,
            concepto: `Reembolso reserva ${reserva.cancha?.nombre || 'cancha'} - ${formatearFecha(reserva.fechaUso)}`,
            montoFinal: total,
        },
        cliente: reserva.cliente || cobroAsociado?.cliente,
        pago: {
            metodoPago: 'Reembolso',
            nroTransaccion: `REF-${idBase}-${politica.porcentaje}`,
            fechaPago: new Date().toISOString().split('T')[0],
            estado: 'Completado',
        },
        fecha: new Date().toISOString().split('T')[0],
        total,
        detalles: `${politica.descripcion} Reserva #${idBase}.`,
        estado: 'emitido',
        tipo: 'reembolso',
        idReserva: reserva.idReserva,
    };
}
