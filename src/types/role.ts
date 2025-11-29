/**
 * Role model representing a role that can be assigned to users
 */
export interface IRole {
  key: string;
  name?: string;
  description?: string;
  permissions?: string[];
  extends?: string[];
  attributes?: Record<string, unknown>;
}

/**
 * Role creation payload
 */
export interface IRoleCreate {
  key: string;
  name?: string;
  description?: string;
  permissions?: string[];
  extends?: string[];
  attributes?: Record<string, unknown>;
}

/**
 * Role update payload
 */
export interface IRoleUpdate {
  name?: string;
  description?: string;
  permissions?: string[];
  extends?: string[];
  attributes?: Record<string, unknown>;
}

/**
 * Role read response from API
 */
export interface IRoleRead {
  id: string;
  key: string;
  name?: string;
  description?: string;
  permissions?: string[];
  extends?: string[];
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated role list response
 */
export interface IRoleList {
  data: IRoleRead[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
