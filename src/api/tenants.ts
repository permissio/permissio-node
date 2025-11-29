import { BaseApiClient } from "./base";
import {
  ITenantCreate,
  ITenantUpdate,
  ITenantRead,
  ITenantList,
  IListParams,
} from "../types";

/**
 * Tenants API client for managing tenants (multi-tenancy support)
 */
export class TenantsApi extends BaseApiClient {
  /**
   * List all tenants
   * @param params - Pagination and filtering parameters
   */
  async list(params?: IListParams): Promise<ITenantList> {
    return this.httpGet<ITenantList>(
      "/tenants",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a tenant by key
   * @param tenantKey - The unique tenant key
   */
  async get(tenantKey: string): Promise<ITenantRead> {
    return this.httpGet<ITenantRead>(
      `/tenants/${encodeURIComponent(tenantKey)}`
    );
  }

  /**
   * Create a new tenant
   * @param tenantData - Tenant creation data
   */
  async create(tenantData: ITenantCreate): Promise<ITenantRead> {
    return this.httpPost<ITenantRead>("/tenants", tenantData);
  }

  /**
   * Update an existing tenant
   * @param tenantKey - The unique tenant key
   * @param tenantData - Tenant update data
   */
  async update(
    tenantKey: string,
    tenantData: ITenantUpdate
  ): Promise<ITenantRead> {
    return this.httpPatch<ITenantRead>(
      `/tenants/${encodeURIComponent(tenantKey)}`,
      tenantData
    );
  }

  /**
   * Delete a tenant
   * @param tenantKey - The unique tenant key
   */
  async delete(tenantKey: string): Promise<void> {
    return this.httpDelete(`/tenants/${encodeURIComponent(tenantKey)}`);
  }

  /**
   * Sync a tenant (create or update)
   * @param tenantData - Tenant data to sync
   */
  async sync(tenantData: ITenantCreate): Promise<ITenantRead> {
    return this.httpPut<ITenantRead>(
      `/tenants/${encodeURIComponent(tenantData.key)}`,
      tenantData
    );
  }

  /**
   * Get all users in a tenant
   * @param tenantKey - The unique tenant key
   */
  async getUsers(tenantKey: string): Promise<string[]> {
    const response = await this.httpGet<{ users: string[] }>(
      `/tenants/${encodeURIComponent(tenantKey)}/users`
    );
    return response.users;
  }

  /**
   * Add a user to a tenant
   * @param tenantKey - The unique tenant key
   * @param userKey - The user key to add
   */
  async addUser(tenantKey: string, userKey: string): Promise<void> {
    return this.httpPost(`/tenants/${encodeURIComponent(tenantKey)}/users`, {
      user: userKey,
    });
  }

  /**
   * Remove a user from a tenant
   * @param tenantKey - The unique tenant key
   * @param userKey - The user key to remove
   */
  async removeUser(tenantKey: string, userKey: string): Promise<void> {
    return this.httpDelete(
      `/tenants/${encodeURIComponent(tenantKey)}/users/${encodeURIComponent(
        userKey
      )}`
    );
  }
}
