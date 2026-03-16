/**
 * Resource action definition (as returned by the backend)
 */
export interface IResourceAction {
  id?: string;
  key?: string;
  name?: string;
  description?: string;
}

/**
 * Resource type creation payload.
 * Actions can be provided as an array of string keys (SDK convenience)
 * or as a map { [actionKey]: { name: ... } } (raw backend format).
 */
export interface IResourceCreate {
  key: string;
  name?: string;
  description?: string;
  /** Action keys (e.g. ["read", "write"]) — will be converted to map format */
  actions?: string[] | Record<string, IResourceAction>;
  attributes?: Record<string, unknown>;
}

/**
 * Resource type update payload
 */
export interface IResourceUpdate {
  name?: string;
  description?: string;
  actions?: string[] | Record<string, IResourceAction>;
  attributes?: Record<string, unknown>;
}

/**
 * Resource type read response from API
 */
export interface IResourceRead {
  id: string;
  key: string;
  name?: string;
  description?: string;
  /** Actions map as returned by the backend */
  actions?: Record<string, IResourceAction>;
  attributes?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  // Convenience aliases
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Paginated resource type list response
 */
export interface IResourceList {
  data: IResourceRead[];
  total_count?: number;
  page_count?: number;
  // Legacy aliases
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Resource instance representing a specific resource
 */
export interface IResourceInstance {
  key: string;
  resourceType: string;
  tenant?: string;
  attributes?: Record<string, unknown>;
}

/**
 * Resource instance creation payload
 */
export interface IResourceInstanceCreate {
  key: string;
  resourceType: string;
  tenant?: string;
  attributes?: Record<string, unknown>;
}

/**
 * Resource instance read response from API
 */
export interface IResourceInstanceRead {
  id: string;
  key: string;
  resourceType: string;
  tenant?: string;
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
