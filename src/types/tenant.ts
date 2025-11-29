/**
 * Tenant model representing a customer/organization in multi-tenant systems
 */
export interface ITenant {
  key: string;
  name?: string;
  description?: string;
  attributes?: Record<string, unknown>;
}

/**
 * Tenant creation payload
 */
export interface ITenantCreate {
  key: string;
  name?: string;
  description?: string;
  attributes?: Record<string, unknown>;
}

/**
 * Tenant update payload
 */
export interface ITenantUpdate {
  name?: string;
  description?: string;
  attributes?: Record<string, unknown>;
}

/**
 * Tenant read response from API
 */
export interface ITenantRead {
  id: string;
  key: string;
  name?: string;
  description?: string;
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated tenant list response
 */
export interface ITenantList {
  data: ITenantRead[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
