import { horaAMinutos } from './reservasDisponibilidad';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function normalizarTexto(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function idCanchaReserva(reserva) {
    return Number(reserva?.cancha?.idCancha ?? reserva?.cancha?.id ?? reserva?.idCancha ?? reserva?.canchaId);
}

function diaSemanaReserva(fechaUso) {
    const fecha = new Date(`${fechaUso}T00:00:00`);
    return DIAS[fecha.getDay()];
}

function seSolapan(inicioA, finA, inicioB, finB) {
    return inicioA < finB && finA > inicioB;
}

export function reservasActivasDeCancha(reservas = [], canchaId) {
    return reservas.filter(r =>
        r.estado !== 'cancelada' &&
        idCanchaReserva(r) === Number(canchaId)
    );
}

export function reservasEnFranja(reservas = [], franja) {
    const idCancha = Number(franja?.idCancha ?? franja?.canchaId);
    const diaFranja = normalizarTexto(franja?.diaSemana);
    const inicioFranja = Number(franja?.horaInicio) * 60;
    const finFranja = Number(franja?.horaFin) * 60;

    return reservasActivasDeCancha(reservas, idCancha).filter(r =>
        normalizarTexto(diaSemanaReserva(r.fechaUso)) === diaFranja &&
        seSolapan(
            horaAMinutos(r.horaInicio),
            horaAMinutos(r.horaFin),
            inicioFranja,
            finFranja
        )
    );
}

export function resumenReservasBloqueantes(reservas = []) {
    return reservas.map(r => {
        const cliente = `${r.cliente?.nombre || r.reservador?.nombre || 'Cliente'} ${r.cliente?.apellido || ''}`.trim();
        const pago = r.cobro?.estado === 'pagado' ? 'pagada' : 'pendiente';
        return `${r.fechaUso} ${r.horaInicio}-${r.horaFin} · ${cliente} · ${pago}`;
    });
}
