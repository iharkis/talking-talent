import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Router } from './components/Router';

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Layout>
          <Router />
        </Layout>
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;