import { BaseApiClient } from "./base";
import {
  IRoleAssignmentCreate,
  IRoleAssignmentRead,
  IRoleAssignmentRemove,
  IRoleAssignmentList,
  IBulkRoleAssignmentResponse,
  IListParams,
} from "../types";

/**
 * Role Assignments API client for managing user role assignments
 */
export class RoleAssignmentsApi extends BaseApiClient {
  /**
   * Normalize the response to always have a data property
   * Backend may return array directly or { data: [...] }
   */
  private normalizeListResponse(
    response: IRoleAssignmentRead[] | IRoleAssignmentList
  ): IRoleAssignmentList {
    // If it's already the expected format with data property
    if (response && typeof response === "object" && "data" in response) {
      return response as IRoleAssignmentList;
    }
    // If it's a direct array, wrap it
    if (Array.isArray(response)) {
      return {
        data: response,
        page: 1,
        perPage: response.length,
        total: response.length,
        totalPages: 1,
      };
    }
    // Fallback
    return { data: [], page: 1, perPage: 0, total: 0, totalPages: 0 };
  }

  /**
   * List all role assignments
   * @param params - Pagination and filtering parameters
   */
  async list(
    params?: IListParams & {
      user?: string;
      role?: string;
      tenant?: string;
      resource?: string;
    }
  ): Promise<IRoleAssignmentList> {
    const response = await this.httpGet<
      IRoleAssignmentRead[] | IRoleAssignmentList
    >("/role_assignments", params as Record<string, unknown>);
    return this.normalizeListResponse(response);
  }

  /**
   * Get role assignments for a specific user
   * @param userKey - The user key
   * @param params - Additional filtering parameters
   */
  async listByUser(
    userKey: string,
    params?: { tenant?: string; resource?: string }
  ): Promise<IRoleAssignmentList> {
    const response = await this.httpGet<
      IRoleAssignmentRead[] | IRoleAssignmentList
    >("/role_assignments", {
      user: userKey,
      ...params,
    });
    return this.normalizeListResponse(response);
  }

  /**
   * Get role assignments for a specific tenant
   * @param tenantKey - The tenant key
   * @param params - Additional filtering parameters
   */
  async listByTenant(
    tenantKey: string,
    params?: { role?: string }
  ): Promise<IRoleAssignmentList> {
    const response = await this.httpGet<
      IRoleAssignmentRead[] | IRoleAssignmentList
    >("/role_assignments", {
      tenant: tenantKey,
      ...params,
    });
    return this.normalizeListResponse(response);
  }

  /**
   * Get role assignments for a specific resource
   * @param resourceType - The resource type key
   * @param resourceInstance - Optional resource instance key
   */
  async listByResource(
    resourceType: string,
    resourceInstance?: string
  ): Promise<IRoleAssignmentList> {
    const response = await this.httpGet<
      IRoleAssignmentRead[] | IRoleAssignmentList
    >("/role_assignments", {
      resource: resourceType,
      resourceInstance,
    });
    return this.normalizeListResponse(response);
  }

  /**
   * Create a role assignment
   * @param assignment - Role assignment data
   */
  async assign(
    assignment: IRoleAssignmentCreate
  ): Promise<IRoleAssignmentRead> {
    return this.httpPost<IRoleAssignmentRead>("/role_assignments", assignment);
  }

  /**
   * Remove a role assignment
   * @param assignment - Role assignment to remove
   */
  async unassign(assignment: IRoleAssignmentRemove): Promise<void> {
    const params = new URLSearchParams();
    params.append("user", assignment.user);
    params.append("role", assignment.role);
    if (assignment.tenant) params.append("tenant", assignment.tenant);
    if (assignment.resource) params.append("resource", assignment.resource);
    if (assignment.resourceInstance)
      params.append("resourceInstance", assignment.resourceInstance);

    return this.httpDelete(`/role_assignments?${params.toString()}`);
  }

  /**
   * Bulk create role assignments
   * @param assignments - Array of role assignments to create
   */
  async bulkAssign(
    assignments: IRoleAssignmentCreate[]
  ): Promise<IBulkRoleAssignmentResponse> {
    return this.httpPost<IBulkRoleAssignmentResponse>(
      "/role_assignments/bulk",
      {
        assignments,
      }
    );
  }

  /**
   * Bulk remove role assignments
   * @param assignments - Array of role assignments to remove
   */
  async bulkUnassign(
    assignments: IRoleAssignmentRemove[]
  ): Promise<IBulkRoleAssignmentResponse> {
    return this.httpPost<IBulkRoleAssignmentResponse>(
      "/role_assignments/bulk/delete",
      {
        assignments,
      }
    );
  }

  /**
   * Check if a user has a specific role
   * @param userKey - The user key
   * @param roleKey - The role key
   * @param options - Optional tenant/resource context
   */
  async hasRole(
    userKey: string,
    roleKey: string,
    options?: { tenant?: string; resource?: string; resourceInstance?: string }
  ): Promise<boolean> {
    const params: Record<string, string> = {
      user: userKey,
      role: roleKey,
    };
    if (options?.tenant) params.tenant = options.tenant;
    if (options?.resource) params.resource = options.resource;
    if (options?.resourceInstance)
      params.resourceInstance = options.resourceInstance;

    try {
      const response = await this.httpGet<{ hasRole: boolean }>(
        "/role_assignments/check",
        params
      );
      return response.hasRole;
    } catch {
      return false;
    }
  }

  /**
   * Get all roles assigned to a user
   * @param userKey - The user key
   * @param options - Optional tenant/resource context
   */
  async getUserRoles(
    userKey: string,
    options?: { tenant?: string; resource?: string }
  ): Promise<string[]> {
    const params: Record<string, string> = { user: userKey };
    if (options?.tenant) params.tenant = options.tenant;
    if (options?.resource) params.resource = options.resource;

    const response = await this.httpGet<{ roles: string[] }>(
      "/role_assignments/roles",
      params
    );
    return response.roles;
  }

  /**
   * Get all users with a specific role
   * @param roleKey - The role key
   * @param options - Optional tenant context
   */
  async getRoleUsers(
    roleKey: string,
    options?: { tenant?: string }
  ): Promise<string[]> {
    const params: Record<string, string> = { role: roleKey };
    if (options?.tenant) params.tenant = options.tenant;

    const response = await this.httpGet<{ users: string[] }>(
      "/role_assignments/users",
      params
    );
    return response.users;
  }
}
