// src/context/AppProviders.jsx
import { AuthProvider } from './AuthContext';
import { ClientesProvider } from './ClientesContext';
import { ProfesoresProvider } from './ProfesoresContext';
import { EmpleadosProvider } from './EmpleadosContext';
import { CanchasProvider } from './CanchasContext';
import { TorneosProvider } from './TorneosContext';
import { ClasesProvider } from './ClasesContext';
import { AsistenciasProvider } from './AsistenciasContext';
import { CobrosProvider } from './CobrosContext';
import { RecibosProvider } from './RecibosContext';
import { ReservasProvider } from './ReservasContext';
import { ReportesProvider } from './ReportesContext';
import { DescuentosProvider } from './DescuentosContext';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ClientesProvider>
        <ProfesoresProvider>
          <EmpleadosProvider>
            <CanchasProvider>
              <ClasesProvider>
                <AsistenciasProvider>
                  <TorneosProvider>
                    <ReservasProvider>                     
                      <CobrosProvider>
                        <DescuentosProvider>
                          <RecibosProvider>
                            <ReportesProvider>
                              
                              {children}
                              
                            </ReportesProvider>
                          </RecibosProvider>
                        </DescuentosProvider>
                      </CobrosProvider>             
                    </ReservasProvider>
                  </TorneosProvider>
                </AsistenciasProvider>
              </ClasesProvider>         
            </CanchasProvider>          
          </EmpleadosProvider>
        </ProfesoresProvider>
      </ClientesProvider>
    </AuthProvider>
  );
}
