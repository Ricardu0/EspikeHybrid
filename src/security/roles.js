// src/security/roles.js

/**
 * POLÍTICA DE MENOR PRIVILÉGIO
 * Define roles e permissões específicas para cada tipo de usuário
 */

export const ROLES = {
  USER: 'user',           // Usuário comum
  MODERATOR: 'moderator', // Moderador
  ADMIN: 'admin'          // Administrador
};

export const PERMISSIONS = {
  // Ocorrências
  VIEW_OCCURRENCES: 'view_occurrences',
  CREATE_OCCURRENCE: 'create_occurrence',
  EDIT_OCCURRENCE: 'edit_occurrence',
  DELETE_OCCURRENCE: 'delete_occurrence',
  MODERATE_OCCURRENCE: 'moderate_occurrence',
  
  // Áreas
  VIEW_AREAS: 'view_areas',
  RATE_AREA: 'rate_area',
  CREATE_AREA: 'create_area',
  EDIT_AREA: 'edit_area',
  DELETE_AREA: 'delete_area',
  
  // Usuários
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Chat
  USE_CHATBOT: 'use_chatbot',
  
  // Exportação
  EXPORT_DATA: 'export_data'
};

// Mapeamento de permissões por role (Menor Privilégio)
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    PERMISSIONS.VIEW_OCCURRENCES,
    PERMISSIONS.CREATE_OCCURRENCE,
    PERMISSIONS.VIEW_AREAS,
    PERMISSIONS.RATE_AREA,
    PERMISSIONS.USE_CHATBOT
  ],
  
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_OCCURRENCES,
    PERMISSIONS.CREATE_OCCURRENCE,
    PERMISSIONS.EDIT_OCCURRENCE,
    PERMISSIONS.MODERATE_OCCURRENCE,
    PERMISSIONS.VIEW_AREAS,
    PERMISSIONS.RATE_AREA,
    PERMISSIONS.CREATE_AREA,
    PERMISSIONS.EDIT_AREA,
    PERMISSIONS.USE_CHATBOT,
    PERMISSIONS.VIEW_USERS
  ],
  
  [ROLES.ADMIN]: Object.values(PERMISSIONS) // Todas as permissões
};

// Verifica se usuário tem permissão específica
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// Verifica múltiplas permissões (OR)
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(perm => hasPermission(userRole, perm));
};

// Verifica múltiplas permissões (AND)
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(perm => hasPermission(userRole, perm));
};

// Hook React para verificação de permissões
export const usePermission = (userRole) => {
  return {
    can: (permission) => hasPermission(userRole, permission),
    canAny: (permissions) => hasAnyPermission(userRole, permissions),
    canAll: (permissions) => hasAllPermissions(userRole, permissions)
  };
};

// Middleware de proteção de rotas
export const requirePermission = (permission) => {
  return (userRole) => {
    if (!hasPermission(userRole, permission)) {
      throw new Error(`Acesso negado. Permissão necessária: ${permission}`);
    }
    return true;
  };
};

// Exemplo de uso em componentes
export const ProtectedAction = ({ userRole, permission, children, fallback = null }) => {
  if (!hasPermission(userRole, permission)) {
    return fallback;
  }
  return children;
};