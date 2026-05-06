/**
 * Middleware: Permissões e Roles
 * ============================================
 * Verifica permissões do usuário baseado na role
 * 
 * Roles:
 * - super_admin: Acesso total (dono da plataforma)
 * - church_admin: Acesso apenas à sua igreja (pastor/responsável)
 * - pastor: Acesso limitado (apenas visualização)
 * - secretary: Acesso administrativo (secretaria)
 * - member: Acesso básico (membro da igreja)
 */

/**
 * Verifica se usuário é Super Admin
 */
export function isAdmin(req, res, next) {
  try {
    // Pegar role do usuário (vem do login ou token)
    const userRole = req.userRole || req.headers['x-user-role'];
    
    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: 'User role not found',
      });
    }
    
    if (userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Super admin required.',
        required: 'super_admin',
        got: userRole,
      });
    }
    
    // É super admin, pode continuar
    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Verifica se usuário é admin da igreja específica
 */
export function isChurchAdmin(req, res, next) {
  try {
    const userRole = req.userRole || req.headers['x-user-role'];
    const userChurchId = req.userChurchId || req.headers['x-church-id'];
    const requestedChurchId = req.params.churchId || req.params.id;
    
    // Super admin pode acessar tudo
    if (userRole === 'super_admin') {
      return next();
    }
    
    // Church admin só pode acessar sua própria igreja
    if (userRole === 'church_admin' && userChurchId && userChurchId == requestedChurchId) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: 'Access denied. Church admin required.',
    });
  } catch (error) {
    console.error('Error in isChurchAdmin middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Verifica se usuário tem role específica
 */
export function hasRole(allowedRoles) {
  return (req, res, next) => {
    try {
      const userRole = req.userRole || req.headers['x-user-role'];
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: 'User role not found',
        });
      }
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Insufficient permissions.',
          required: allowedRoles,
          got: userRole,
        });
      }
      
      next();
    } catch (error) {
      console.error('Error in hasRole middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}
