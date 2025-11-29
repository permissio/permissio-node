import { BaseApiClient } from "./base";
import {
  IRoleCreate,
  IRoleUpdate,
  IRoleRead,
  IRoleList,
  IListParams,
} from "../types";

/**
 * Roles API client for managing roles in the authorization system
 */
export class RolesApi extends BaseApiClient {
  /**
   * List all roles
   * @param params - Pagination and filtering parameters
   */
  async list(params?: IListParams): Promise<IRoleList> {
    return this.httpGet<IRoleList>(
      "/schema/roles",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a role by key
   * @param roleKey - The unique role key
   */
  async get(roleKey: string): Promise<IRoleRead> {
    return this.httpGet<IRoleRead>(
      `/schema/roles/${encodeURIComponent(roleKey)}`
    );
  }

  /**
   * Create a new role
   * @param roleData - Role creation data
   */
  async create(roleData: IRoleCreate): Promise<IRoleRead> {
    return this.httpPost<IRoleRead>("/schema/roles", roleData);
  }

  /**
   * Update an existing role
   * @param roleKey - The unique role key
   * @param roleData - Role update data
   */
  async update(roleKey: string, roleData: IRoleUpdate): Promise<IRoleRead> {
    return this.httpPatch<IRoleRead>(
      `/schema/roles/${encodeURIComponent(roleKey)}`,
      roleData
    );
  }

  /**
   * Delete a role
   * @param roleKey - The unique role key
   */
  async delete(roleKey: string): Promise<void> {
    return this.httpDelete(`/schema/roles/${encodeURIComponent(roleKey)}`);
  }

  /**
   * Sync a role (create or update)
   * @param roleData - Role data to sync
   */
  async sync(roleData: IRoleCreate): Promise<IRoleRead> {
    return this.httpPut<IRoleRead>(
      `/schema/roles/${encodeURIComponent(roleData.key)}`,
      roleData
    );
  }

  /**
   * Get permissions for a role
   * @param roleKey - The unique role key
   */
  async getPermissions(roleKey: string): Promise<string[]> {
    const response = await this.httpGet<{ permissions: string[] }>(
      `/schema/roles/${encodeURIComponent(roleKey)}/permissions`
    );
    return response.permissions;
  }

  /**
   * Add a permission to a role
   * @param roleKey - The unique role key
   * @param permission - The permission to add (format: "resource:action")
   */
  async addPermission(roleKey: string, permission: string): Promise<void> {
    return this.httpPost(
      `/schema/roles/${encodeURIComponent(roleKey)}/permissions`,
      { permission }
    );
  }

  /**
   * Remove a permission from a role
   * @param roleKey - The unique role key
   * @param permission - The permission to remove
   */
  async removePermission(roleKey: string, permission: string): Promise<void> {
    return this.httpDelete(
      `/schema/roles/${encodeURIComponent(
        roleKey
      )}/permissions/${encodeURIComponent(permission)}`
    );
  }

  /**
   * Get roles that this role extends
   * @param roleKey - The unique role key
   */
  async getExtends(roleKey: string): Promise<string[]> {
    const response = await this.httpGet<{ extends: string[] }>(
      `/schema/roles/${encodeURIComponent(roleKey)}/extends`
    );
    return response.extends;
  }

  /**
   * Add a parent role (role inheritance)
   * @param roleKey - The unique role key
   * @param parentRoleKey - The parent role key to extend
   */
  async addExtends(roleKey: string, parentRoleKey: string): Promise<void> {
    return this.httpPost(
      `/schema/roles/${encodeURIComponent(roleKey)}/extends`,
      {
        role: parentRoleKey,
      }
    );
  }

  /**
   * Remove a parent role
   * @param roleKey - The unique role key
   * @param parentRoleKey - The parent role key to remove
   */
  async removeExtends(roleKey: string, parentRoleKey: string): Promise<void> {
    return this.httpDelete(
      `/schema/roles/${encodeURIComponent(
        roleKey
      )}/extends/${encodeURIComponent(parentRoleKey)}`
    );
  }
}
