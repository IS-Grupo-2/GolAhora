import AppRouter from './router/AppRouter';
import AppProviders from './context/AppProviders';

function App() {
  return (
    <AppProviders>
        <AppRouter />
    </AppProviders>
  )
}
export default App