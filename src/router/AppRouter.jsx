import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
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

function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }) {
    const { user } = useAuth();
    if (!user)               return <Navigate to="/login"     replace />;
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
                {/* index = /dashboard */}
                <Route index element={<Dashboard />} />
    
                {/* Operaciones */}
                <Route path="reservas"  element={<ComingSoon title="Reservas"  />} />
                <Route path="canchas"   element={<CanchasPage />} />
                <Route path="torneos"   element={<TorneosPage />} />
                <Route path="clases"    element={<ComingSoon title="Clases"    />} />
    
                {/* Personas — algunas protegidas por rol */}
                <Route path="clientes" element={
                    <RoleRoute roles={['admin', 'empleado']}>
                        <UsuariosPage />
                    </RoleRoute>
                    }/>

                <Route path="profesores" element={
                    <RoleRoute roles={['admin']}>
                        <ProfesoresPage />
                    </RoleRoute>
                     }/>

                <Route path="empleados" element={
                    <RoleRoute roles={['admin']}>
                        <EmpleadosPage />
                    </RoleRoute>
                    }/>
                    <Route path="asistencias" element={<ComingSoon title="Asistencias" />} />
    
                    {/* Finanzas */}
                    <Route path="cobros"   element={<ComingSoon title="Cobros"   />} />
                    <Route path="recibos"  element={<ComingSoon title="Recibos"  />} />
                    <Route path="reportes" element={
                        <RoleRoute roles={['admin']}>
                            <ComingSoon title="Reportes" />
                        </RoleRoute>
                        }/>
    
                    {/* Sistema */}
                    <Route path="configuracion" element={
                        <RoleRoute roles={['admin']}>
                            <ComingSoon title="Configuración" />
                        </RoleRoute>
                        }/>
                    </Route>
    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter

