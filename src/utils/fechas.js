export function formatearFecha(fecha) {
    if (!fecha) return '-';

    const texto = String(fecha);
    const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        const [, anio, mes, dia] = match;
        return `${dia}/${mes}/${anio}`;
    }

    return texto;
}
