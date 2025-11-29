/**
 * Permission check request
 */
export interface ICheckRequest {
  /**
   * The user key to check permissions for
   */
  user: string | ICheckUser;

  /**
   * The action to check (e.g., "read", "write", "delete")
   */
  action: string;

  /**
   * The resource to check access to
   */
  resource: string | ICheckResource;

  /**
   * Optional tenant context
   */
  tenant?: string;

  /**
   * Additional context for the check
   */
  context?: Record<string, unknown>;
}

/**
 * User object for permission checks
 */
export interface ICheckUser {
  key: string;
  attributes?: Record<string, unknown>;
}

/**
 * Resource object for permission checks
 */
export interface ICheckResource {
  type: string;
  key?: string;
  tenant?: string;
  attributes?: Record<string, unknown>;
}

/**
 * Permission check response
 */
export interface ICheckResponse {
  /**
   * Whether the action is allowed
   */
  allowed: boolean;

  /**
   * Reason for the decision (optional)
   */
  reason?: string;

  /**
   * Debug information (when debug mode is enabled)
   */
  debug?: {
    matchedRoles?: string[];
    matchedPermissions?: string[];
    evaluationTime?: number;
  };
}

/**
 * Bulk permission check request
 */
export interface IBulkCheckRequest {
  checks: ICheckRequest[];
}

/**
 * Bulk permission check response
 */
export interface IBulkCheckResponse {
  results: Array<{
    request: ICheckRequest;
    response: ICheckResponse;
  }>;
}

/**
 * Get all permissions for a user
 */
export interface IGetPermissionsRequest {
  user: string;
  tenant?: string;
  resource?: string;
}

/**
 * User permissions response
 */
export interface IGetPermissionsResponse {
  permissions: string[];
  roles: string[];
  resources?: Array<{
    type: string;
    key?: string;
    permissions: string[];
  }>;
}
