import { ROLES } from '../constants/roles';
import type { Role } from '../constants/roles';
import type { RouteLocationNormalized } from 'vue-router';

export const hasRole = (userRole: string, requiredRole: Role): boolean => {
  if (userRole === ROLES.ADMIN) return true;
  return userRole === requiredRole;
};

export const hasAnyRole = (userRole: string, requiredRoles: Role[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (userRole === ROLES.ADMIN) return true;
  return requiredRoles.includes(userRole as Role);
};

export const canAccessRoute = (userRole: string, route: RouteLocationNormalized): boolean => {
  const routeRoles = route.meta?.roles as Role[] | undefined;
  if (!routeRoles || routeRoles.length === 0) return true;
  return hasAnyRole(userRole, routeRoles);
};

export const canAccessMenu = (userRole: string, menuRoles?: Role[]): boolean => {
  if (!menuRoles || menuRoles.length === 0) return true;
  return hasAnyRole(userRole, menuRoles);
};
