// User types
export type {
  IUser,
  IUserCreate,
  IUserUpdate,
  IUserRead,
  IUserList,
} from "./user";

// Tenant types
export type {
  ITenant,
  ITenantCreate,
  ITenantUpdate,
  ITenantRead,
  ITenantList,
} from "./tenant";

// Role types
export type {
  IRole,
  IRoleCreate,
  IRoleUpdate,
  IRoleRead,
  IRoleList,
} from "./role";

// Resource types
export type {
  IResource,
  IResourceCreate,
  IResourceUpdate,
  IResourceRead,
  IResourceList,
  IResourceInstance,
  IResourceInstanceCreate,
  IResourceInstanceRead,
} from "./resource";

// Role assignment types
export type {
  IRoleAssignment,
  IRoleAssignmentCreate,
  IRoleAssignmentRead,
  IRoleAssignmentRemove,
  IRoleAssignmentList,
  IBulkRoleAssignment,
  IBulkRoleAssignmentResponse,
} from "./role-assignment";

// Check types
export type {
  ICheckRequest,
  ICheckUser,
  ICheckResource,
  ICheckResponse,
  IBulkCheckRequest,
  IBulkCheckResponse,
  IGetPermissionsRequest,
  IGetPermissionsResponse,
} from "./check";

// Common types
export interface IPaginationParams {
  page?: number;
  perPage?: number;
}

export interface IListParams extends IPaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface IApiResponse<T> {
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

/**
 * API Key scope response - returned by /v1/api-key/scope endpoint
 */
export interface IApiKeyScope {
  organization_id: string;
  project_id?: string;
  environment_id?: string;
}
