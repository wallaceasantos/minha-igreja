import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Verifica se o usuário está autenticado (simulação)
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza a rota filha (AdminPedidos)
  return <Outlet />;
};

export default ProtectedRoute;
