const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function horaAMinutos(hora) {
    const [hh = 0, mm = 0] = String(hora || '00:00').split(':').map(Number);
    return (hh * 60) + mm;
}

export function minutosAHora(minutos) {
    const hh = Math.floor(minutos / 60);
    const mm = minutos % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function diaSemanaDeFecha(fechaUso) {
    const fecha = new Date(`${fechaUso}T00:00:00`);
    return DIAS[fecha.getDay()];
}

function idCanchaReserva(reserva) {
    return Number(reserva?.cancha?.idCancha ?? reserva?.cancha?.id ?? reserva?.idCancha ?? reserva?.canchaId);
}

function seSolapan(inicioA, finA, inicioB, finB) {
    return inicioA < finB && finA > inicioB;
}

export function validarReservaCancha({
    reservaId,
    canchaId,
    fechaUso,
    horaInicio,
    horaFin,
    canchas = [],
    tiposCanchas = [],
    disponibilidades = [],
    reservas = []
}) {
    const idCancha = Number(canchaId);
    const cancha = canchas.find(c => Number(c.id) === idCancha);
    const tipo = tiposCanchas.find(t => Number(t.id) === Number(cancha?.idTipo ?? cancha?.tipoCanchaId));
    const inicio = horaAMinutos(horaInicio);
    const fin = horaAMinutos(horaFin);
    const duracionMin = fin - inicio;

    if (!cancha) return { ok: false, mensaje: 'Seleccioná una cancha válida.' };
    if (!fechaUso) return { ok: false, mensaje: 'Seleccioná la fecha de uso.' };
    if (cancha.estado === 'inactiva') return { ok: false, mensaje: 'La cancha seleccionada no está activa.' };
    if (duracionMin <= 0) return { ok: false, mensaje: 'La hora de fin debe ser posterior a la hora de inicio.' };
    if (duracionMin < 30) return { ok: false, mensaje: 'La reserva debe tener una duración mínima de 30 minutos.' };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(`${fechaUso}T00:00:00`);
    const fechaMaxima = new Date(hoy);
    fechaMaxima.setDate(fechaMaxima.getDate() + 30);

    if (fechaReserva < hoy) return { ok: false, mensaje: 'La fecha de la reserva no puede ser anterior a hoy.' };
    if (fechaReserva > fechaMaxima) {
        return { ok: false, mensaje: 'Solo se pueden crear reservas con hasta 30 días de anticipación.' };
    }

    const maximo = Number(tipo?.duracionMaxReservaMin || 0);
    if (maximo > 0 && duracionMin > maximo) {
        return {
            ok: false,
            mensaje: `El tipo de cancha ${tipo?.nombre || ''} permite reservas de hasta ${maximo} minutos.`
        };
    }

    const diaSemana = diaSemanaDeFecha(fechaUso);
    const franjasCanchaDia = disponibilidades.filter(d =>
        Number(d.idCancha ?? d.canchaId) === idCancha &&
        d.diaSemana === diaSemana
    );

    const franjaHabilitada = franjasCanchaDia.some(d =>
        d.disponible === true &&
        inicio >= Number(d.horaInicio) * 60 &&
        fin <= Number(d.horaFin) * 60
    );

    if (!franjaHabilitada) {
        return { ok: false, mensaje: `La cancha no tiene disponibilidad habilitada para ${diaSemana} en ese horario.` };
    }

    const franjaBloqueada = franjasCanchaDia.some(d =>
        d.disponible === false &&
        seSolapan(inicio, fin, Number(d.horaInicio) * 60, Number(d.horaFin) * 60)
    );

    if (franjaBloqueada) {
        return { ok: false, mensaje: 'La cancha está en mantenimiento o bloqueada en ese horario.' };
    }

    const reservaSolapada = reservas.some(r => {
        if (r.estado === 'cancelada') return false;
        if (reservaId && Number(r.idReserva) === Number(reservaId)) return false;
        if (idCanchaReserva(r) !== idCancha) return false;
        if (r.fechaUso !== fechaUso) return false;
        return seSolapan(inicio, fin, horaAMinutos(r.horaInicio), horaAMinutos(r.horaFin));
    });

    if (reservaSolapada) {
        return { ok: false, mensaje: 'Ya existe una reserva para esa cancha en la franja horaria elegida.' };
    }

    return {
        ok: true,
        cancha,
        tipo,
        duracionMin,
        horas: duracionMin / 60,
        precioTotal: (tipo?.precioHora || 0) * (duracionMin / 60),
        diaSemana,
        horaInicio: minutosAHora(inicio),
        horaFin: minutosAHora(fin)
    };
}
