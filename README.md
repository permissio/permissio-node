# Permissio.io Node.js SDK

Official Node.js SDK for [Permissio.io](https://permissio.io) - Authorization as a Service.

## Installation

```bash
npm install permissio
# or
yarn add permissio
# or
pnpm add permissio
```

## Quick Start

```typescript
import { Permissio } from 'permissio';

// Initialize the SDK
const permissio = new Permissio({
  token: 'permis_key_your_api_key_here',
  projectId: 'your-project-id',
  environmentId: 'your-environment-id',
});

// Check permissions
const allowed = await permissio.check({
  user: 'user@example.com',
  action: 'read',
  resource: 'document',
});

if (allowed) {
  console.log('Access granted!');
} else {
  console.log('Access denied!');
}
```

## Configuration

```typescript
import { Permissio } from 'permissio';

const permissio = new Permissio({
  // Required: Your API key
  token: 'permis_key_your_api_key_here',

  // Optional: API base URL (defaults to https://api.permissio.io)
  apiUrl: 'https://api.permissio.io',

  // Optional: Project and Environment IDs
  projectId: 'your-project-id',
  environmentId: 'your-environment-id',

  // Optional: Enable debug logging
  debug: false,

  // Optional: Request timeout in ms (default: 30000)
  timeout: 30000,

  // Optional: Number of retry attempts (default: 3)
  retryAttempts: 3,

  // Optional: Throw errors or return false (default: true)
  throwOnError: true,

  // Optional: Custom headers
  customHeaders: {
    'X-Custom-Header': 'value',
  },
});
```

## Permission Checks

### Basic Check

```typescript
const allowed = await permissio.check({
  user: 'user@example.com',
  action: 'read',
  resource: 'document',
});
```

### Check with Resource Instance

```typescript
const allowed = await permissio.check({
  user: 'user@example.com',
  action: 'edit',
  resource: {
    type: 'document',
    key: 'doc-123',
  },
});
```

### Check with Tenant Context

```typescript
const allowed = await permissio.check({
  user: 'user@example.com',
  action: 'delete',
  resource: 'document',
  tenant: 'acme-corp',
});
```

### Check with User Attributes

```typescript
const allowed = await permissio.check({
  user: {
    key: 'user@example.com',
    attributes: {
      department: 'engineering',
      level: 'senior',
    },
  },
  action: 'approve',
  resource: 'expense_report',
});
```

### Get Full Check Response

```typescript
const response = await permissio.checkWithDetails({
  user: 'user@example.com',
  action: 'read',
  resource: 'document',
});

console.log(response.allowed); // boolean
console.log(response.reason); // string (optional)
console.log(response.debug); // debug info (when debug enabled)
```

### Bulk Permission Checks

```typescript
const results = await permissio.bulkCheck({
  checks: [
    { user: 'user1@example.com', action: 'read', resource: 'document' },
    { user: 'user1@example.com', action: 'write', resource: 'document' },
    { user: 'user2@example.com', action: 'read', resource: 'document' },
  ],
});

results.results.forEach(({ request, response }) => {
  console.log(`${request.user} ${request.action} ${request.resource}: ${response.allowed}`);
});
```

### Check and Throw

```typescript
try {
  await permissio.checkAndThrow({
    user: 'user@example.com',
    action: 'delete',
    resource: 'document',
  });
  // Access granted, continue with operation
} catch (error) {
  // Access denied
  console.error(error.message);
}
```

## User Management

### Create a User

```typescript
const user = await permissio.api.users.create({
  key: 'user@example.com',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  attributes: {
    department: 'engineering',
  },
});
```

### Sync User (Create or Update)

```typescript
const user = await permissio.api.users.sync({
  key: 'user@example.com',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
});
```

### Sync User with Roles

```typescript
await permissio.syncUser({
  key: 'user@example.com',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: [
    { role: 'admin', tenant: 'acme-corp' },
    { role: 'viewer' },
  ],
});
```

### List Users

```typescript
const users = await permissio.api.users.list({
  page: 1,
  perPage: 10,
  search: 'john',
});
```

### Get User Roles

```typescript
const roles = await permissio.api.users.getRoles('user@example.com');
```

### Assign Role to User

```typescript
await permissio.api.users.assignRole('user@example.com', 'admin', 'acme-corp');
```

## Tenant Management

### Create a Tenant

```typescript
const tenant = await permissio.api.tenants.create({
  key: 'acme-corp',
  name: 'Acme Corporation',
  description: 'Main organization',
  attributes: {
    plan: 'enterprise',
  },
});
```

### Get Tenant Users

```typescript
const users = await permissio.api.tenants.getUsers('acme-corp');
```

### Add User to Tenant

```typescript
await permissio.api.tenants.addUser('acme-corp', 'user@example.com');
```

## Role Management

### Create a Role

```typescript
const role = await permissio.api.roles.create({
  key: 'editor',
  name: 'Editor',
  description: 'Can edit documents',
  permissions: ['document:read', 'document:write'],
});
```

### Add Permission to Role

```typescript
await permissio.api.roles.addPermission('editor', 'document:delete');
```

### Role Inheritance

```typescript
// Create a role that extends another
await permissio.api.roles.create({
  key: 'admin',
  name: 'Admin',
  extends: ['editor'],
  permissions: ['document:delete', 'user:manage'],
});
```

## Resource Management

### Create a Resource Type

```typescript
const resource = await permissio.api.resources.create({
  key: 'document',
  name: 'Document',
  actions: ['read', 'write', 'delete', 'share'],
});
```

### Create a Resource Instance

```typescript
const instance = await permissio.api.resources.createInstance({
  key: 'doc-123',
  resourceType: 'document',
  tenant: 'acme-corp',
  attributes: {
    title: 'My Document',
    owner: 'user@example.com',
  },
});
```

## Role Assignments

### Assign a Role

```typescript
await permissio.api.roleAssignments.assign({
  user: 'user@example.com',
  role: 'admin',
  tenant: 'acme-corp',
});
```

### Assign Role on Resource

```typescript
await permissio.api.roleAssignments.assign({
  user: 'user@example.com',
  role: 'editor',
  resource: 'document',
  resourceInstance: 'doc-123',
});
```

### Bulk Role Assignment

```typescript
const result = await permissio.api.roleAssignments.bulkAssign([
  { user: 'user1@example.com', role: 'viewer', tenant: 'acme-corp' },
  { user: 'user2@example.com', role: 'editor', tenant: 'acme-corp' },
  { user: 'user3@example.com', role: 'admin', tenant: 'acme-corp' },
]);

console.log(`Created: ${result.created}, Failed: ${result.failed}`);
```

### Check if User Has Role

```typescript
const hasRole = await permissio.api.roleAssignments.hasRole(
  'user@example.com',
  'admin',
  { tenant: 'acme-corp' }
);
```

## Get User Permissions

```typescript
const permissions = await permissio.getPermissions({
  user: 'user@example.com',
  tenant: 'acme-corp',
});

console.log(permissions.roles); // ['admin', 'editor']
console.log(permissions.permissions); // ['document:read', 'document:write', ...]
```

## Error Handling

```typescript
import { Permissio, PermissioApiError } from 'permissio';

const permissio = new Permissio({
  token: 'permis_key_...',
  throwOnError: true, // default
});

try {
  await permissio.api.users.get('nonexistent-user');
} catch (error) {
  if (error instanceof PermissioApiError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.code);
    console.error('Details:', error.details);
  }
}
```

### Disable Throwing Errors

```typescript
const permissio = new Permissio({
  token: 'permis_key_...',
  throwOnError: false,
});

// Will return false instead of throwing
const allowed = await permissio.check({
  user: 'user@example.com',
  action: 'read',
  resource: 'document',
});
```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions.

```typescript
import {
  Permis,
  IPermisConfig,
  ICheckRequest,
  ICheckResponse,
  IUserCreate,
  IUserRead,
  IRoleAssignmentCreate,
} from 'permissio';

const config: IPermisConfig = {
  token: 'permis_key_...',
  projectId: 'my-project',
  environmentId: 'production',
};

const permissio = new Permissio(config);

const request: ICheckRequest = {
  user: 'user@example.com',
  action: 'read',
  resource: 'document',
};

const response: ICheckResponse = await permissio.checkWithDetails(request);
```

## Framework Integration Examples

### Express.js Middleware

```typescript
import { Permissio } from 'permissio';
import express from 'express';

const permissio = new Permissio({
  token: process.env.PERMIS_API_KEY!,
  projectId: process.env.PERMIS_PROJECT_ID!,
  environmentId: process.env.PERMIS_ENVIRONMENT_ID!,
});

// Middleware factory
function requirePermission(action: string, getResource: (req: express.Request) => string) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = req.user?.id; // Assuming user is attached to request

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowed = await permissio.check({
      user: userId,
      action,
      resource: getResource(req),
    });

    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Usage
app.get(
  '/documents/:id',
  requirePermission('read', (req) => ({ type: 'document', key: req.params.id })),
  async (req, res) => {
    // Handle request
  }
);
```

### NestJS Guard

```typescript
import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permissio } from 'permissio';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (action: string, resource: string) =>
  SetMetadata(PERMISSION_KEY, { action, resource });

@Injectable()
export class PermisGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permis: Permis
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get(PERMISSION_KEY, context.getHandler());
    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) return false;

    return this.permissio.check({
      user: userId,
      action: permission.action,
      resource: permission.resource,
    });
  }
}
```

## License

MIT

## Support

- Documentation: [https://docs.permissio.io](https://docs.permissio.io)
- Issues: [GitHub Issues](https://github.com/permissio/permissio-node/issues)
- Email: support@permissio.io
