import { IPermissioConfig, MutableConfig, resolveConfig } from "./config";
import {
  UsersApi,
  TenantsApi,
  RolesApi,
  ResourcesApi,
  RoleAssignmentsApi,
  PermissioApiError,
} from "./api";
import {
  ICheckRequest,
  ICheckResponse,
  ICheckUser,
  ICheckResource,
  IBulkCheckRequest,
  IBulkCheckResponse,
  IGetPermissionsRequest,
  IGetPermissionsResponse,
  IRoleRead,
  IApiKeyScope,
} from "./types";
import axios from "axios";

/**
 * API object containing all API clients
 */
export interface IPermissioApi {
  users: UsersApi;
  tenants: TenantsApi;
  roles: RolesApi;
  resources: ResourcesApi;
  roleAssignments: RoleAssignmentsApi;
}

/**
 * Main Permissio.io SDK client
 *
 * @example
 * ```typescript
 * import { Permissio } from 'permissio';
 *
 * const permissio = new Permissiosio({
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
 * // Manage users
 * await permis.api.users.create({
 *   key: 'user@example.com',
 *   email: 'user@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 * });
 *
 * // Assign roles
 * await permis.api.roleAssignments.assign({
 *   user: 'user@example.com',
 *   role: 'admin',
 *   tenant: 'acme-corp',
 * });
 * ```
 */
export class Permissio {
  /**
   * Mutable configuration that can be updated with scope
   */
  private readonly config: MutableConfig;

  /**
   * API clients for managing resources
   */
  public readonly api: IPermissioApi;

  /**
   * Flag to track if scope has been initialized
   */
  private scopeInitialized: boolean = false;

  /**
   * Promise for scope initialization (for deduplication)
   */
  private scopeInitPromise: Promise<void> | null = null;

  /**
   * Create a new Permis SDK instance.
   * If projectId and environmentId are not provided, they will be
   * auto-fetched from the API key scope on first API call.
   *
   * @param config - SDK configuration
   */
  constructor(config: IPermissioConfig) {
    this.config = resolveConfig(config);

    // Initialize API clients
    const users = new UsersApi(this.config);
    const tenants = new TenantsApi(this.config);
    const roles = new RolesApi(this.config);
    const resources = new ResourcesApi(this.config);
    const roleAssignments = new RoleAssignmentsApi(this.config);

    this.api = {
      users,
      tenants,
      roles,
      resources,
      roleAssignments,
    };
  }

  /**
   * Check if a user has permission to perform an action on a resource
   *
   * @example
   * ```typescript
   * // Simple check
   * const allowed = await permis.check({
   *   user: 'user@example.com',
   *   action: 'read',
   *   resource: 'document',
   * });
   *
   * // Check with resource instance
   * const allowed = await permis.check({
   *   user: 'user@example.com',
   *   action: 'edit',
   *   resource: { type: 'document', key: 'doc-123' },
   * });
   *
   * // Check with tenant context
   * const allowed = await permis.check({
   *   user: 'user@example.com',
   *   action: 'delete',
   *   resource: 'document',
   *   tenant: 'acme-corp',
   * });
   * ```
   */
  async check(request: ICheckRequest): Promise<boolean> {
    const response = await this.checkWithDetails(request);
    return response.allowed;
  }

  /**
   * Check permission with full response details.
   * This performs client-side permission checking by:
   * 1. Fetching user's role assignments
   * 2. Fetching role definitions with permissions
   * 3. Checking if any role grants the required permission
   */
  async checkWithDetails(request: ICheckRequest): Promise<ICheckResponse> {
    // Ensure scope is initialized before making API calls
    await this.ensureScope();

    try {
      const userKey = this.getUserKey(request.user);
      const resourceType = this.extractResourceType(request.resource);
      const resourceInstanceKey = this.extractResourceInstanceKey(
        request.resource
      );
      const requiredPermission = `${resourceType}:${request.action}`;

      if (this.config.debug) {
        console.log(
          `[Permissio Debug] Check: user=${userKey}, action=${request.action}, resource=${request.resource}`
        );
        console.log(
          `[Permissio Debug] Required permission: ${requiredPermission}`
        );
      }

      // 1. Get user's role assignments (filtered by tenant if provided)
      const assignmentsResponse = await this.api.roleAssignments.list({
        user: userKey,
        tenant: request.tenant,
      });

      if (this.config.debug) {
        console.log(
          `[Permissio Debug] Role assignments:`,
          JSON.stringify(assignmentsResponse.data, null, 2)
        );
      }

      if (!assignmentsResponse.data || assignmentsResponse.data.length === 0) {
        return {
          allowed: false,
          reason: `User ${userKey} has no role assignments`,
        };
      }

      // 2. Get unique role keys from assignments
      const roleKeys = [
        ...new Set(assignmentsResponse.data.map((a) => a.role)),
      ];

      if (this.config.debug) {
        console.log(`[Permissio Debug] User's role keys:`, roleKeys);
      }

      // 3. Fetch all roles and build permission map (with role inheritance)
      const rolesResponse = await this.api.roles.list({ perPage: 100 });
      const rolesMap = new Map<string, IRoleRead>();
      for (const role of rolesResponse.data || []) {
        rolesMap.set(role.key, role);
      }

      if (this.config.debug) {
        console.log(
          `[Permissio Debug] Available roles:`,
          Array.from(rolesMap.keys())
        );
        for (const [key, role] of rolesMap) {
          console.log(
            `[Permissio Debug] Role "${key}" permissions:`,
            role.permissions
          );
        }
      }

      // 4. Check if any assigned role grants the required permission
      const matchedRoles: string[] = [];
      const matchedPermissions: string[] = [];

      for (const roleKey of roleKeys) {
        const permissions = this.getRolePermissions(
          roleKey,
          rolesMap,
          new Set()
        );
        if (this.config.debug) {
          console.log(
            `[Permissio Debug] Role "${roleKey}" has permissions:`,
            permissions
          );
        }
        if (
          permissions.includes(requiredPermission) ||
          permissions.includes(`${resourceType}:*`) ||
          permissions.includes("*:*")
        ) {
          matchedRoles.push(roleKey);
          matchedPermissions.push(requiredPermission);
        }
      }

      const allowed = matchedRoles.length > 0;

      if (this.config.debug) {
        console.log(
          `[Permissio Debug] Result: allowed=${allowed}, matchedRoles=`,
          matchedRoles
        );
      }

      return {
        allowed,
        reason: allowed
          ? `Granted by role(s): ${matchedRoles.join(", ")}`
          : `No role grants permission ${requiredPermission}`,
        debug: {
          matchedRoles,
          matchedPermissions,
          evaluationTime: 0,
        },
      };
    } catch (error) {
      if (this.config.throwOnError) {
        throw error;
      }
      return {
        allowed: false,
        reason: `Error during permission check: ${error}`,
      };
    }
  }

  /**
   * Get all permissions for a role, including inherited permissions
   */
  private getRolePermissions(
    roleKey: string,
    rolesMap: Map<string, IRoleRead>,
    visited: Set<string>
  ): string[] {
    // Prevent circular inheritance
    if (visited.has(roleKey)) {
      return [];
    }
    visited.add(roleKey);

    const role = rolesMap.get(roleKey);
    if (!role) {
      return [];
    }

    const permissions: string[] = [...(role.permissions || [])];

    // Add inherited permissions from parent roles
    if (role.extends && role.extends.length > 0) {
      for (const parentRoleKey of role.extends) {
        const parentPermissions = this.getRolePermissions(
          parentRoleKey,
          rolesMap,
          visited
        );
        permissions.push(...parentPermissions);
      }
    }

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Perform bulk permission checks
   *
   * @example
   * ```typescript
   * const results = await permis.bulkCheck({
   *   checks: [
   *     { user: 'user1@example.com', action: 'read', resource: 'document' },
   *     { user: 'user1@example.com', action: 'write', resource: 'document' },
   *     { user: 'user2@example.com', action: 'read', resource: 'document' },
   *   ],
   * });
   * ```
   */
  async bulkCheck(request: IBulkCheckRequest): Promise<IBulkCheckResponse> {
    try {
      const results = await Promise.all(
        request.checks.map(async (check) => ({
          request: check,
          response: await this.checkWithDetails(check),
        }))
      );
      return { results };
    } catch (error) {
      if (this.config.throwOnError) {
        throw error;
      }
      return {
        results: request.checks.map((check) => ({
          request: check,
          response: { allowed: false, reason: "Error during permission check" },
        })),
      };
    }
  }

  /**
   * Get all permissions for a user
   *
   * @example
   * ```typescript
   * const permissions = await permis.getPermissions({
   *   user: 'user@example.com',
   *   tenant: 'acme-corp',
   * });
   *
   * console.log(permissions.roles); // ['admin', 'editor']
   * console.log(permissions.permissions); // ['document:read', 'document:write']
   * ```
   */
  async getPermissions(
    request: IGetPermissionsRequest
  ): Promise<IGetPermissionsResponse> {
    // Ensure scope is initialized before making API calls
    await this.ensureScope();

    try {
      // 1. Get user's role assignments
      const assignmentsResponse = await this.api.roleAssignments.list({
        user: request.user,
        tenant: request.tenant,
        resource: request.resource,
      });

      if (!assignmentsResponse.data || assignmentsResponse.data.length === 0) {
        return { roles: [], permissions: [] };
      }

      // 2. Get unique role keys
      const roleKeys = [
        ...new Set(assignmentsResponse.data.map((a) => a.role)),
      ];

      // 3. Fetch all roles
      const rolesResponse = await this.api.roles.list({ perPage: 100 });
      const rolesMap = new Map<string, IRoleRead>();
      for (const role of rolesResponse.data || []) {
        rolesMap.set(role.key, role);
      }

      // 4. Collect all permissions from assigned roles
      const allPermissions: string[] = [];
      for (const roleKey of roleKeys) {
        const permissions = this.getRolePermissions(
          roleKey,
          rolesMap,
          new Set()
        );
        allPermissions.push(...permissions);
      }

      return {
        roles: roleKeys,
        permissions: [...new Set(allPermissions)],
      };
    } catch (error) {
      if (this.config.throwOnError) {
        throw error;
      }
      return { permissions: [], roles: [] };
    }
  }

  /**
   * Sync user and optionally assign roles in one call
   *
   * @example
   * ```typescript
   * await permis.syncUser({
   *   key: 'user@example.com',
   *   email: 'user@example.com',
   *   firstName: 'John',
   *   lastName: 'Doe',
   * });
   * ```
   */
  async syncUser(userData: {
    key: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    attributes?: Record<string, unknown>;
    roles?: Array<{ role: string; tenant?: string }>;
  }) {
    const { roles, ...userFields } = userData;

    // Sync user
    const user = await this.api.users.sync(userFields);

    // Assign roles if provided
    if (roles && roles.length > 0) {
      await Promise.all(
        roles.map((r) =>
          this.api.roleAssignments.assign({
            user: userData.key,
            role: r.role,
            tenant: r.tenant,
          })
        )
      );
    }

    return user;
  }

  /**
   * Convenience method: Check and throw if not allowed
   *
   * @throws {PermissioApiError} If the user is not allowed
   */
  async checkAndThrow(request: ICheckRequest): Promise<void> {
    const response = await this.checkWithDetails(request);

    if (!response.allowed) {
      throw new PermissioApiError({
        message: `Access denied: User ${this.getUserKey(
          request.user
        )} is not allowed to perform ${request.action} on ${this.getResourceKey(
          request.resource
        )}`,
        code: "ACCESS_DENIED",
        statusCode: 403,
        details: { request, response },
      });
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): {
    token: string;
    apiUrl: string;
    projectId?: string;
    environmentId?: string;
    debug: boolean;
    timeout: number;
  } {
    return {
      token: this.config.token,
      apiUrl: this.config.apiUrl,
      projectId: this.config.projectId,
      environmentId: this.config.environmentId,
      debug: this.config.debug,
      timeout: this.config.timeout,
    };
  }

  /**
   * Get the project and environment IDs (fetches from API key scope if needed)
   */
  async getScope(): Promise<{ projectId?: string; environmentId?: string }> {
    await this.ensureScope();
    return {
      projectId: this.config.projectId,
      environmentId: this.config.environmentId,
    };
  }

  /**
   * Ensure scope (projectId and environmentId) is available.
   * Fetches from API key scope endpoint if not already configured.
   */
  private async ensureScope(): Promise<void> {
    // Already initialized or already has scope from config
    if (this.scopeInitialized || this.config.hasScope()) {
      return;
    }

    // Deduplicate concurrent initialization calls
    if (this.scopeInitPromise) {
      return this.scopeInitPromise;
    }

    this.scopeInitPromise = this.fetchAndSetScope();
    try {
      await this.scopeInitPromise;
    } finally {
      this.scopeInitPromise = null;
    }
  }

  /**
   * Fetch scope from API key scope endpoint and update config
   */
  private async fetchAndSetScope(): Promise<void> {
    try {
      const response = await axios.get<IApiKeyScope>(
        `${this.config.apiUrl}/v1/api-key/scope`,
        {
          headers: {
            Authorization: `Bearer ${this.config.token}`,
            "Content-Type": "application/json",
          },
          timeout: this.config.timeout,
        }
      );

      const scope = response.data;
      this.config.updateScope(scope.project_id, scope.environment_id);
      this.scopeInitialized = true;

      if (this.config.debug) {
        console.debug("[Permissio.io SDK] Auto-fetched scope:", {
          projectId: scope.project_id,
          environmentId: scope.environment_id,
        });
      }
    } catch (error) {
      // If scope fetch fails and we don't have scope, throw an error
      if (!this.config.hasScope()) {
        throw new Error(
          "Permissio.io SDK: Failed to fetch API key scope. " +
            "Either provide projectId and environmentId in config, " +
            "or ensure the API key has valid scope. " +
            `Error: ${error}`
        );
      }
      // If we already have scope from config, just mark as initialized
      this.scopeInitialized = true;
    }
  }

  // ==================== Private Helpers ====================

  private buildBaseUrl(): string {
    const { projectId, environmentId } = this.config;

    if (projectId && environmentId) {
      return `${this.config.apiUrl}/v1/facts/${projectId}/${environmentId}`;
    }

    return `${this.config.apiUrl}/v1`;
  }

  private buildCheckUrl(): string {
    return `${this.buildBaseUrl()}/check`;
  }

  private normalizeCheckRequest(
    request: ICheckRequest
  ): Record<string, unknown> {
    const user = this.normalizeUser(request.user);
    const resource = this.normalizeResource(request.resource);

    return {
      user,
      action: request.action,
      resource,
      tenant: request.tenant,
      context: request.context,
    };
  }

  private normalizeUser(user: string | ICheckUser): Record<string, unknown> {
    if (typeof user === "string") {
      return { key: user };
    }
    return user as unknown as Record<string, unknown>;
  }

  private normalizeResource(
    resource: string | ICheckResource
  ): Record<string, unknown> {
    if (typeof resource === "string") {
      return { type: resource };
    }
    return resource as unknown as Record<string, unknown>;
  }

  private getUserKey(user: string | ICheckUser): string {
    return typeof user === "string" ? user : user.key;
  }

  private getResourceKey(resource: string | ICheckResource): string {
    if (typeof resource === "string") {
      return resource;
    }
    return resource.key ? `${resource.type}:${resource.key}` : resource.type;
  }

  private extractResourceType(resource: string | ICheckResource): string {
    if (typeof resource === "string") {
      // If string contains ':', the type is before the colon
      // Otherwise, the string is the type
      return resource.includes(":") ? resource.split(":")[0] : resource;
    }
    return resource.type;
  }

  private extractResourceInstanceKey(
    resource: string | ICheckResource
  ): string | undefined {
    if (typeof resource === "string") {
      // If string contains ':', the key is after the colon
      const parts = resource.split(":");
      return parts.length > 1 ? parts[1] : undefined;
    }
    return resource.key;
  }
}

// Export a factory function for convenience
export function createPermissio(config: IPermissioConfig): Permissio {
  return new Permissio(config);
}
