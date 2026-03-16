# Changelog

All notable changes to the Permissio.io Node.js SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

No unreleased changes at this time.

---

## [1.0.0-alpha.1] - 2025-03-15

### Added
- **`Permissio` client class**: Main entry point with `token`-based configuration and auto-scope detection
- **`IPermissioConfig` interface**: Full configuration support — `token`, `apiUrl`, `projectId`, `environmentId`, `debug`, `timeout`, `retryAttempts`, `throwOnError`, `customHeaders`
- **Permission checking**:
  - `check()` — simple boolean permission check
  - `checkWithDetails()` — full `ICheckResponse` with reason and debug info
  - `bulkCheck()` — batch permission checks in a single request
  - `checkAndThrow()` — throws `PermissioApiError` on denial
  - `getPermissions()` — retrieve all permissions for a user
- **Auto-scope detection**: Automatically fetches `projectId` and `environmentId` from the `/v1/api-key/scope` endpoint when not provided explicitly
- **Users API** (`api.users`): `list()`, `get()`, `create()`, `update()`, `delete()`, `sync()`, `getRoles()`, `assignRole()`, `unassignRole()`, `getTenants()`
- **Tenants API** (`api.tenants`): `list()`, `get()`, `create()`, `update()`, `delete()`, `sync()`, `getUsers()`, `addUser()`, `removeUser()`
- **Roles API** (`api.roles`): `list()`, `get()`, `create()`, `update()`, `delete()`, `sync()`, `getPermissions()`, `addPermission()`, `removePermission()`, `getExtends()`, `addExtends()`, `removeExtends()`
- **Resources API** (`api.resources`): `list()`, `get()`, `create()`, `update()`, `delete()`, `sync()`, `getActions()`, `addAction()`, `removeAction()`, `listInstances()`, `getInstance()`, `createInstance()`, `deleteInstance()`, `syncInstance()`
- **Role Assignments API** (`api.roleAssignments`): `list()`, `listByUser()`, `listByTenant()`, `listByResource()`, `assign()`, `unassign()`, `bulkAssign()`, `bulkUnassign()`, `hasRole()`, `getUserRoles()`, `getRoleUsers()`
- **`syncUser()` convenience method**: Create or update a user with roles in a single call
- **`PermissioApiError`**: Typed error class with `statusCode`, `code`, `details`, and `originalError`
- **Full TypeScript support**: Complete type definitions for all request/response shapes exported from the package
- **Dual CJS/ESM output**: Bundled via `tsup` for compatibility with both CommonJS and ES Module environments
- **Retry logic**: Automatic exponential-backoff retries on transient errors (408, 429, 5xx)
- **Request routing**: Schema-based routes (`/v1/schema/...`) and facts-based routes (`/v1/facts/...`) handled transparently
- **Examples**: Common use-case examples for permission checking, user management, and role assignment
