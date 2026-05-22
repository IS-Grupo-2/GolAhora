export default function ComingSoon({ title }) {
    return (
        <div className="coming-soon-view">
            <div className="coming-soon-icon">
                <i data-lucide="construction" />
            </div>
            <h3>{title}</h3>
            <p>Esta sección está siendo desarrollada.<br />Próximamente disponible.</p>
        </div>
    );
}