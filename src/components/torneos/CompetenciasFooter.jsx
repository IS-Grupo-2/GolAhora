export default function CompetenciasFooter() {
    return (
        <footer
            style={{
                marginTop: '28px',
                padding: '14px 16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--bg-card)',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
            }}
        >
            Nuestras competencias siguen las reglas de la Asociacion del Futbol Argentino. Para mas informacion ver:{' '}
            <a
                href="https://theifab.com/laws-of-the-game-documents/?language=es&year=2026%2F27"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--purple)', fontWeight: 700 }}
            >
                https://theifab.com/laws-of-the-game-documents/?language=es&year=2026%2F27
            </a>
        </footer>
    );
}
