/**
 * User model representing an end-user in the authorization system
 */
export interface IUser {
  key: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, unknown>;
}

/**
 * User creation payload
 */
export interface IUserCreate {
  key: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, unknown>;
}

/**
 * User update payload
 */
export interface IUserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, unknown>;
}

/**
 * User read response from API
 */
export interface IUserRead {
  id: string;
  key: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated user list response
 */
export interface IUserList {
  data: IUserRead[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
