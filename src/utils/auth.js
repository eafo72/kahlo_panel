// Roles and their permissions
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  INVESTOR: 'investor',
  GUIDE: 'guide',
  SPECIALIST: 'specialist',
  PARTNER: 'partner'
};

// Route permissions - which roles can access which routes
const routePermissions = {
  '/administradores':        [ROLES.SUPER_ADMIN],
  '/calendario':             [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/camara':                 [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/colaboradores':          [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.GUIDE, ROLES.SPECIALIST],
  '/categorias':             [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/comentarios':            [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/dashboard':              [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.INVESTOR],
  '/empresas':               [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/fotografias/alta':       [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/guias':                  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/historial':              [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.INVESTOR, ROLES.GUIDE, ROLES.PARTNER],
  '/reservaciones/cancelar': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/reservaciones/imprimir': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.GUIDE],
  '/reservaciones/modificar':[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.GUIDE],
  '/tours':                  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/usuarios':               [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/checkin':                [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/ventas':                 [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.GUIDE, ROLES.PARTNER],
};

// Function to get user role based on user object
const getUserRole = (user) => {
  //console.log(user);
  if (!user) return null;
  
  if (user.isSuperAdmin === 1) return ROLES.SUPER_ADMIN;
  if (user.isAdmin === 1) return ROLES.ADMIN;
  if (user.isInvestor === 1) return ROLES.INVESTOR;
  if (user.isGuia === 1) return ROLES.GUIDE;
  if (user.isSpecialist === 1) return ROLES.SPECIALIST;
  if (user.isPartner === 1) return ROLES.PARTNER;
  
  return null;
};

// Check if user has access to a specific route
const hasAccess = (pathname, user) => {
  // Allow access to public routes
  if (pathname === '/') return true;
  
  // If no user is logged in, only allow access to login page
  if (!user) return false;
  
  const userRole = getUserRole(user);
  
  // If user has no role, deny access
  if (!userRole) return false;
  
  // Find the most specific route that matches
  let route = Object.keys(routePermissions)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];
  
  // If no specific route found, check if the exact path exists
  if (!route) {
    route = pathname;
  }
  
  // If the route is not in our permissions list, deny access by default
  if (!routePermissions[route]) return false;
  
  // Check if user's role has access to this route
  return routePermissions[route].includes(userRole);
};

export { ROLES, getUserRole, hasAccess };
