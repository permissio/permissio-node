import { BaseApiClient } from "./base";
import {
  IResourceCreate,
  IResourceUpdate,
  IResourceRead,
  IResourceList,
  IResourceInstanceCreate,
  IResourceInstanceRead,
  IListParams,
} from "../types";

/**
 * Resources API client for managing resource types and instances
 */
export class ResourcesApi extends BaseApiClient {
  /**
   * List all resource types
   * @param params - Pagination and filtering parameters
   */
  async list(params?: IListParams): Promise<IResourceList> {
    return this.httpGet<IResourceList>(
      "/schema/resources",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a resource type by key
   * @param resourceKey - The unique resource type key
   */
  async get(resourceKey: string): Promise<IResourceRead> {
    return this.httpGet<IResourceRead>(
      `/schema/resources/${encodeURIComponent(resourceKey)}`
    );
  }

  /**
   * Create a new resource type
   * @param resourceData - Resource type creation data
   */
  async create(resourceData: IResourceCreate): Promise<IResourceRead> {
    return this.httpPost<IResourceRead>("/schema/resources", resourceData);
  }

  /**
   * Update an existing resource type
   * @param resourceKey - The unique resource type key
   * @param resourceData - Resource type update data
   */
  async update(
    resourceKey: string,
    resourceData: IResourceUpdate
  ): Promise<IResourceRead> {
    return this.httpPatch<IResourceRead>(
      `/schema/resources/${encodeURIComponent(resourceKey)}`,
      resourceData
    );
  }

  /**
   * Delete a resource type
   * @param resourceKey - The unique resource type key
   */
  async delete(resourceKey: string): Promise<void> {
    return this.httpDelete(
      `/schema/resources/${encodeURIComponent(resourceKey)}`
    );
  }

  /**
   * Sync a resource type (create or update)
   * @param resourceData - Resource type data to sync
   */
  async sync(resourceData: IResourceCreate): Promise<IResourceRead> {
    return this.httpPut<IResourceRead>(
      `/schema/resources/${encodeURIComponent(resourceData.key)}`,
      resourceData
    );
  }

  /**
   * Get actions for a resource type
   * @param resourceKey - The unique resource type key
   */
  async getActions(resourceKey: string): Promise<string[]> {
    const response = await this.httpGet<{ actions: string[] }>(
      `/schema/resources/${encodeURIComponent(resourceKey)}/actions`
    );
    return response.actions;
  }

  /**
   * Add an action to a resource type
   * @param resourceKey - The unique resource type key
   * @param action - The action to add
   */
  async addAction(resourceKey: string, action: string): Promise<void> {
    return this.httpPost(
      `/schema/resources/${encodeURIComponent(resourceKey)}/actions`,
      { action }
    );
  }

  /**
   * Remove an action from a resource type
   * @param resourceKey - The unique resource type key
   * @param action - The action to remove
   */
  async removeAction(resourceKey: string, action: string): Promise<void> {
    return this.httpDelete(
      `/schema/resources/${encodeURIComponent(
        resourceKey
      )}/actions/${encodeURIComponent(action)}`
    );
  }

  // ==================== Resource Instances ====================

  /**
   * List resource instances
   * @param resourceType - The resource type key
   * @param params - Pagination and filtering parameters
   */
  async listInstances(
    resourceType: string,
    params?: IListParams
  ): Promise<{ data: IResourceInstanceRead[]; total: number }> {
    return this.httpGet(
      `/resource_instances/${encodeURIComponent(resourceType)}`,
      params as Record<string, unknown>
    );
  }

  /**
   * Get a resource instance
   * @param resourceType - The resource type key
   * @param instanceKey - The instance key
   */
  async getInstance(
    resourceType: string,
    instanceKey: string
  ): Promise<IResourceInstanceRead> {
    return this.httpGet(
      `/resource_instances/${encodeURIComponent(
        resourceType
      )}/${encodeURIComponent(instanceKey)}`
    );
  }

  /**
   * Create a resource instance
   * @param instanceData - Resource instance creation data
   */
  async createInstance(
    instanceData: IResourceInstanceCreate
  ): Promise<IResourceInstanceRead> {
    return this.httpPost("/resource_instances", instanceData);
  }

  /**
   * Delete a resource instance
   * @param resourceType - The resource type key
   * @param instanceKey - The instance key
   */
  async deleteInstance(
    resourceType: string,
    instanceKey: string
  ): Promise<void> {
    return this.httpDelete(
      `/resource_instances/${encodeURIComponent(
        resourceType
      )}/${encodeURIComponent(instanceKey)}`
    );
  }

  /**
   * Sync a resource instance (create or update)
   * @param instanceData - Resource instance data to sync
   */
  async syncInstance(
    instanceData: IResourceInstanceCreate
  ): Promise<IResourceInstanceRead> {
    return this.httpPut(
      `/resource_instances/${encodeURIComponent(
        instanceData.resourceType
      )}/${encodeURIComponent(instanceData.key)}`,
      instanceData
    );
  }
}
