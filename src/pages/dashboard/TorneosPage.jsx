import { useAuth } from '../../context/AuthContext';
import TorneosPageContent from '../../components/torneos/TorneosPageContent';
import ClienteTorneosView from '../../components/torneos/ClienteTorneosView';

export default function TorneosPage() {
    const { user } = useAuth(); 

    // Por seguridad, si no hay usuario cargado aún, no renderizamos nada o mostramos un loader
    if (!user) return null; 


    if (user.rol === 'Admin' || user.rol === 'Employee') {
        return <TorneosPageContent />;
    }

    if (user.rol === 'Client' || user.rol === 'Professor') {
        return <ClienteTorneosView />;
    }

    // Fallback por si hay algún otro rol raro (opcional)
    return (
        <div className="dashboard-page-container">
            <h2>No tenés permisos para ver esta sección.</h2>
        </div>
    );
}