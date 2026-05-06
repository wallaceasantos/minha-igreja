import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();
  
  // Verifica se o usuário está autenticado (simulação)
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  
  console.log('ProtectedRoute:', {
    path: location.pathname,
    isAuthenticated,
    redirectAfterLogin: localStorage.getItem('redirectAfterLogin')
  });

  if (!isAuthenticated) {
    // Salva a página que estava tentando acessar
    localStorage.setItem('redirectAfterLogin', location.pathname);
    console.log('Não autenticado. Redirecionando para login...');
    
    // Se não estiver autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  console.log('Autenticado. Renderizando rota...');
  
  // Se estiver autenticado, renderiza a rota filha
  return <Outlet />;
};

export default ProtectedRoute;
