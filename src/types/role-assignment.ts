/**
 * Role assignment model representing a user's role on a resource/tenant
 */
export interface IRoleAssignment {
  user: string;
  role: string;
  tenant?: string;
  resource?: string;
  resourceInstance?: string;
}

/**
 * Role assignment creation payload
 */
export interface IRoleAssignmentCreate {
  user: string;
  role: string;
  tenant?: string;
  resource?: string;
  resourceInstance?: string;
}

/**
 * Role assignment read response from API
 */
export interface IRoleAssignmentRead {
  id: string;
  user: string;
  role: string;
  tenant?: string;
  resource?: string;
  resourceInstance?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Role assignment remove payload
 */
export interface IRoleAssignmentRemove {
  user: string;
  role: string;
  tenant?: string;
  resource?: string;
  resourceInstance?: string;
}

/**
 * Paginated role assignment list response
 */
export interface IRoleAssignmentList {
  data: IRoleAssignmentRead[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/**
 * Bulk role assignment payload
 */
export interface IBulkRoleAssignment {
  assignments: IRoleAssignmentCreate[];
}

/**
 * Bulk role assignment response
 */
export interface IBulkRoleAssignmentResponse {
  created: number;
  failed: number;
  errors?: Array<{
    assignment: IRoleAssignmentCreate;
    error: string;
  }>;
}
