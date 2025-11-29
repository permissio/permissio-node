/**
 * Permissio.io Node.js SDK
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { Permissio } from 'permissio';
 *
 * // Simplest usage - project and environment are auto-detected from API key
 * const permissio = new Permissio({
 *   token: 'permis_key_your_api_key_here',
 * });
 *
 * // Or with explicit project and environment IDs
 * const permissio2 = new Permissio({
 *   token: 'permis_key_your_api_key_here',
 *   projectId: 'your-project-id',
 *   environmentId: 'your-environment-id',
 * });
 *
 * // Check permissions
 * const allowed = await permis.check({
 *   user: 'user@example.com',
 *   action: 'read',
 *   resource: 'document',
 * });
 *
 * if (allowed) {
 *   console.log('Access granted!');
 * } else {
 *   console.log('Access denied!');
 * }
 * ```
 */

// Main SDK class
export { Permissio, createPermissio } from "./permissio";
export type { IPermissioApi } from "./permissio";

// Configuration
export { resolveConfig, DEFAULT_CONFIG, MutableConfig } from "./config";
export type { IPermissioConfig, IResolvedConfig } from "./config";

// API clients
export {
  BaseApiClient,
  PermissioApiError,
  UsersApi,
  TenantsApi,
  RolesApi,
  ResourcesApi,
  RoleAssignmentsApi,
} from "./api";
export type { ILogger } from "./api";

// Types
export type {
  // User types
  IUser,
  IUserCreate,
  IUserUpdate,
  IUserRead,
  IUserList,
  // Tenant types
  ITenant,
  ITenantCreate,
  ITenantUpdate,
  ITenantRead,
  ITenantList,
  // Role types
  IRole,
  IRoleCreate,
  IRoleUpdate,
  IRoleRead,
  IRoleList,
  // Resource types
  IResource,
  IResourceCreate,
  IResourceUpdate,
  IResourceRead,
  IResourceList,
  IResourceInstance,
  IResourceInstanceCreate,
  IResourceInstanceRead,
  // Role assignment types
  IRoleAssignment,
  IRoleAssignmentCreate,
  IRoleAssignmentRead,
  IRoleAssignmentRemove,
  IRoleAssignmentList,
  IBulkRoleAssignment,
  IBulkRoleAssignmentResponse,
  // Check types
  ICheckRequest,
  ICheckUser,
  ICheckResource,
  ICheckResponse,
  IBulkCheckRequest,
  IBulkCheckResponse,
  IGetPermissionsRequest,
  IGetPermissionsResponse,
  // Common types
  IPaginationParams,
  IListParams,
  IApiError,
  IApiResponse,
  IApiKeyScope,
} from "./types";

// Default export
export { Permissio as default } from "./permissio";
