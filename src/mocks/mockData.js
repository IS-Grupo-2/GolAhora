// src/mocks/mockData.js

export const MOCK_TIPOS_CANCHA = [
    {
        idTipoCancha: 1,
        nombre: 'Fútbol 5',
        superficie: 'Césped sintético',
        capacidadJugadores: 10,
        duracionMaxReservaMin: 90,
        precioHora: 4200,
        descripcion: 'Cancha para Fútbol reducido con superficie sintética y buena iluminación.',
    },
    {
        idTipoCancha: 2,
        nombre: 'Fútbol 7',
        superficie: 'Parquet',
        capacidadJugadores: 14,
        duracionMaxReservaMin: 120,
        precioHora: 5600,
        descripcion: 'Cancha intermedia ideal para torneos y entrenamientos con piso de Parquet.',
    },
    {
        idTipoCancha: 3,
        nombre: 'Fútbol 11',
        superficie: 'Cemento',
        capacidadJugadores: 22,
        duracionMaxReservaMin: 150,
        precioHora: 8400,
        descripcion: 'Cancha de gran tamaño para partidos completos sobre superficie de Cemento.',
    },
];

export const MOCK_CANCHAS = [
    {
        idCancha: 101,
        numero: 1,
        nombre: 'Cancha Norte',
        tipoCancha: MOCK_TIPOS_CANCHA[0],
        estado: 'Disponible',
        descripcion: 'Cancha cercana a la entrada principal, ideal para grupos pequeños.',
    },
    {
        idCancha: 102,
        numero: 2,
        nombre: 'Cancha Sur',
        tipoCancha: MOCK_TIPOS_CANCHA[1],
        estado: 'Ocupada',
        descripcion: 'Cancha amplia con buena amortiguación y iluminación LED.',
    },
    {
        idCancha: 103,
        numero: 3,
        nombre: 'Cancha Central',
        tipoCancha: MOCK_TIPOS_CANCHA[2],
        estado: 'Mantenimiento',
        descripcion: 'Cancha principal de Fútbol 11 en Mantenimiento para mejoras.',
    },
    {
        idCancha: 104,
        numero: 4,
        nombre: 'Cancha Este',
        tipoCancha: MOCK_TIPOS_CANCHA[1],
        estado: 'Disponible',
        descripcion: 'Cancha polivalente para entrenamientos y partidos rápidos.',
    },
    {
        idCancha: 105,
        numero: 5,
        nombre: 'Cancha Oeste',
        tipoCancha: MOCK_TIPOS_CANCHA[0],
        estado: 'Disponible',
        descripcion: 'Cancha cómoda para reservas familiares y recreativas.',
    },
];
