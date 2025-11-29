/**
 * Resource type definition representing a type of resource in the system
 */
export interface IResource {
  key: string;
  name?: string;
  description?: string;
  actions?: string[];
  attributes?: Record<string, unknown>;
}

/**
 * Resource type creation payload
 */
export interface IResourceCreate {
  key: string;
  name?: string;
  description?: string;
  actions?: string[];
  attributes?: Record<string, unknown>;
}

/**
 * Resource type update payload
 */
export interface IResourceUpdate {
  name?: string;
  description?: string;
  actions?: string[];
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
  actions?: string[];
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated resource type list response
 */
export interface IResourceList {
  data: IResourceRead[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
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
