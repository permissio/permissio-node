import { BaseApiClient } from "./base";
import {
  IUserCreate,
  IUserUpdate,
  IUserRead,
  IUserList,
  IListParams,
} from "../types";

/**
 * Users API client for managing users in the authorization system
 */
export class UsersApi extends BaseApiClient {
  /**
   * List all users
   * @param params - Pagination and filtering parameters
   */
  async list(params?: IListParams): Promise<IUserList> {
    return this.httpGet<IUserList>("/users", params as Record<string, unknown>);
  }

  /**
   * Get a user by key
   * @param userKey - The unique user key
   */
  async get(userKey: string): Promise<IUserRead> {
    return this.httpGet<IUserRead>(`/users/${encodeURIComponent(userKey)}`);
  }

  /**
   * Create a new user
   * @param userData - User creation data
   */
  async create(userData: IUserCreate): Promise<IUserRead> {
    return this.httpPost<IUserRead>("/users", userData);
  }

  /**
   * Update an existing user
   * @param userKey - The unique user key
   * @param userData - User update data
   */
  async update(userKey: string, userData: IUserUpdate): Promise<IUserRead> {
    return this.httpPatch<IUserRead>(
      `/users/${encodeURIComponent(userKey)}`,
      userData
    );
  }

  /**
   * Delete a user
   * @param userKey - The unique user key
   */
  async delete(userKey: string): Promise<void> {
    return this.httpDelete(`/users/${encodeURIComponent(userKey)}`);
  }

  /**
   * Sync a user (create or update)
   * @param userData - User data to sync
   */
  async sync(userData: IUserCreate): Promise<IUserRead> {
    return this.httpPut<IUserRead>(
      `/users/${encodeURIComponent(userData.key)}`,
      userData
    );
  }

  /**
   * Get user's assigned roles
   * @param userKey - The unique user key
   */
  async getRoles(userKey: string): Promise<string[]> {
    const response = await this.httpGet<{ roles: string[] }>(
      `/users/${encodeURIComponent(userKey)}/roles`
    );
    return response.roles;
  }

  /**
   * Assign a role to a user
   * @param userKey - The unique user key
   * @param roleKey - The role key to assign
   * @param tenant - Optional tenant key
   */
  async assignRole(
    userKey: string,
    roleKey: string,
    tenant?: string
  ): Promise<void> {
    return this.httpPost(`/users/${encodeURIComponent(userKey)}/roles`, {
      role: roleKey,
      tenant,
    });
  }

  /**
   * Unassign a role from a user
   * @param userKey - The unique user key
   * @param roleKey - The role key to unassign
   * @param tenant - Optional tenant key
   */
  async unassignRole(
    userKey: string,
    roleKey: string,
    tenant?: string
  ): Promise<void> {
    const params = tenant ? `?tenant=${encodeURIComponent(tenant)}` : "";
    return this.httpDelete(
      `/users/${encodeURIComponent(userKey)}/roles/${encodeURIComponent(
        roleKey
      )}${params}`
    );
  }

  /**
   * Get user's tenants
   * @param userKey - The unique user key
   */
  async getTenants(userKey: string): Promise<string[]> {
    const response = await this.httpGet<{ tenants: string[] }>(
      `/users/${encodeURIComponent(userKey)}/tenants`
    );
    return response.tenants;
  }
}
