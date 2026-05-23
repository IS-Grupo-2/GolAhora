import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import HomePage from '../pages/public/HomePage';
import RegistroPage from '../pages/auth/RegistroPage';
import LoginPage from '../pages/auth/LoginPage';
import Dashboard from '../pages/dashboard/Dashboard';
import ComingSoon from '../components/ComingSoon';
import UsuariosPage from '../pages/dashboard/UsuariosPage';
import ProfesoresPage from '../pages/dashboard/ProfesoresPage';
import EmpleadosPage from '../pages/dashboard/EmpleadosPage';
import CanchasPage from '../pages/dashboard/CanchasPage';
import TorneosPage from '../pages/dashboard/TorneosPage';
import ReservasPage from '../pages/dashboard/ReservasPage';
import ClasesPage from '../pages/dashboard/ClasesPage';
import CobrosPage from '../pages/dashboard/CobrosPage';
import RecibosPage from '../pages/dashboard/RecibosPage';
import ReportesPage from '../pages/dashboard/ReportesPage';
import AsistenciasPage from '../pages/dashboard/AsistenciasPage';

function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (!roles.includes(user.rol)) return <Navigate to="/dashboard" replace />;
    return children;
}

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Dashboard — rutas anidadas bajo DashboardLayout */}
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <DashboardLayout />
                    </PrivateRoute>
                }>
                    {/* index = /dashboard (Todos) */}
                    <Route index element={<Dashboard />} />
    
                    {/* Operaciones (Todos) */}
                    <Route path="reservas"  element={<ReservasPage />} />
                    <Route path="canchas"   element={<CanchasPage />} />
                    <Route path="torneos"   element={<TorneosPage />} />
                    <Route path="clases"    element={<ClasesPage />} />
    
                    {/* Personas — Protegidas por rol */}
                    <Route path="clientes" element={
                        <RoleRoute roles={['admin', 'empleado']}>
                            <UsuariosPage />
                        </RoleRoute>
                    } />

                    <Route path="profesores" element={
                        <RoleRoute roles={['admin', 'empleado']}>
                            <ProfesoresPage />
                        </RoleRoute>
                    } />

                    <Route path="empleados" element={
                        <RoleRoute roles={['admin']}>
                            <EmpleadosPage />
                        </RoleRoute>
                    } />
                    
                    <Route path="asistencias" element={
                        <RoleRoute roles={['admin', 'empleado', 'profesor']}>
                            <AsistenciasPage />
                        </RoleRoute>
                    } />
    
                    {/* Finanzas — Protegidas por rol */}
                    <Route path="cobros" element={
                        <RoleRoute roles={['admin', 'empleado']}>
                            <CobrosPage />
                        </RoleRoute>
                    } />
                    
                    <Route path="recibos" element={
                        <RoleRoute roles={['admin', 'empleado']}>
                            <RecibosPage />
                        </RoleRoute>
                    } />
                    
                    <Route path="reportes" element={
                        <RoleRoute roles={['admin', 'empleado']}>
                            <ReportesPage />
                        </RoleRoute>
                    } />
    
                    {/* Sistema (Todos) */}
                    <Route path="configuracion" element={<ComingSoon title="Configuración" />} />
                </Route>
    
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;