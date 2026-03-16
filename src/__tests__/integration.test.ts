/**
 * Integration tests for the Permissio.io Node.js SDK.
 *
 * Prerequisites:
 *   - Backend running at http://localhost:3001
 *   - PERMIS_API_KEY environment variable set (tests are skipped if absent)
 *
 * Run with: PERMIS_API_KEY=<key> npm test
 */

import { Permissio } from "../permissio";

const API_KEY = process.env.PERMIS_API_KEY;
const API_URL = process.env.PERMIS_API_URL ?? "http://localhost:3001";

// Unique suffix per test run to avoid collisions
const TS = Date.now();
const TEST_USER_KEY = `test-user-${TS}@integration.test`;
const TEST_TENANT_KEY = `test-tenant-${TS}`;
const TEST_ROLE_KEY = `test-role-${TS}`;
const TEST_RESOURCE_KEY = `test-resource-${TS}`;

// Skip all integration tests when no real backend is available (e.g. CI without a server).
// Set PERMIS_API_KEY to opt-in and run against a live backend.
const itIntegration = API_KEY ? it : it.skip;

describe("Permissio Node.js SDK — Integration", () => {
  let client: Permissio;

  beforeAll(async () => {
    if (!API_KEY) return;
    client = new Permissio({ token: API_KEY, apiUrl: API_URL });
    // Pre-fetch scope so all API clients have project/env IDs ready
    await client.getScope();
  });

  afterAll(async () => {
    if (!client) return;
    try {
      await client.api.roleAssignments.unassign({
        user: TEST_USER_KEY,
        role: TEST_ROLE_KEY,
        tenant: TEST_TENANT_KEY,
      });
    } catch (_) {}
    try { await client.api.users.delete(TEST_USER_KEY); } catch (_) {}
    try { await client.api.tenants.delete(TEST_TENANT_KEY); } catch (_) {}
    try { await client.api.roles.delete(TEST_ROLE_KEY); } catch (_) {}
    try { await client.api.resources.delete(TEST_RESOURCE_KEY); } catch (_) {}
  });

  // ─── 1. API Key Scope ───────────────────────────────────────────────────────

  describe("1. API Key Scope", () => {
    itIntegration("auto-fetches project and environment IDs from the API key", async () => {
      const scope = await client.getScope();
      console.log("[SDK] Scope:", scope);
      expect(scope.projectId).toBeTruthy();
      expect(scope.environmentId).toBeTruthy();
    });
  });

  // ─── 2. Users CRUD ──────────────────────────────────────────────────────────

  describe("2. Users CRUD", () => {
    itIntegration("creates a user", async () => {
      const user = await client.api.users.create({
        key: TEST_USER_KEY,
        email: TEST_USER_KEY,
        firstName: "Integration",
        lastName: "Test",
      });
      console.log("[SDK] Created user:", user.key);
      expect(user.key).toBe(TEST_USER_KEY);
    });

    itIntegration("lists users and finds the created one", async () => {
      const result = await client.api.users.list();
      const found = result.data.some((u) => u.key === TEST_USER_KEY);
      expect(found).toBe(true);
    });

    itIntegration("gets a user by key", async () => {
      const user = await client.api.users.get(TEST_USER_KEY);
      expect(user.key).toBe(TEST_USER_KEY);
    });

    itIntegration("syncs (upserts) a user", async () => {
      const user = await client.api.users.sync({
        key: TEST_USER_KEY,
        email: TEST_USER_KEY,
        firstName: "Integration-Updated",
        lastName: "Test",
      });
      expect(user.key).toBe(TEST_USER_KEY);
    });
  });

  // ─── 3. Tenants CRUD ────────────────────────────────────────────────────────

  describe("3. Tenants CRUD", () => {
    itIntegration("creates a tenant", async () => {
      const tenant = await client.api.tenants.create({
        key: TEST_TENANT_KEY,
        name: `Integration Test Tenant ${TS}`,
      });
      console.log("[SDK] Created tenant:", tenant.key);
      expect(tenant.key).toBe(TEST_TENANT_KEY);
    });

    itIntegration("lists tenants and finds the created one", async () => {
      const result = await client.api.tenants.list();
      const found = result.data.some((t) => t.key === TEST_TENANT_KEY);
      expect(found).toBe(true);
    });

    itIntegration("gets a tenant by key", async () => {
      const tenant = await client.api.tenants.get(TEST_TENANT_KEY);
      expect(tenant.key).toBe(TEST_TENANT_KEY);
    });
  });

  // ─── 4. Resources CRUD ──────────────────────────────────────────────────────

  describe("4. Resources CRUD", () => {
    itIntegration("creates a resource type", async () => {
      const resource = await client.api.resources.create({
        key: TEST_RESOURCE_KEY,
        name: `Integration Test Resource ${TS}`,
        actions: ["read", "write"],
      });
      console.log("[SDK] Created resource:", resource.key);
      expect(resource.key).toBe(TEST_RESOURCE_KEY);
    });

    itIntegration("lists resources and finds the created one", async () => {
      const result = await client.api.resources.list();
      const found = result.data.some((r) => r.key === TEST_RESOURCE_KEY);
      expect(found).toBe(true);
    });
  });

  // ─── 5. Roles CRUD ──────────────────────────────────────────────────────────

  describe("5. Roles CRUD", () => {
    itIntegration("creates a role with permissions", async () => {
      const role = await client.api.roles.create({
        key: TEST_ROLE_KEY,
        name: `Integration Test Role ${TS}`,
        permissions: [`${TEST_RESOURCE_KEY}:read`, `${TEST_RESOURCE_KEY}:write`],
      });
      console.log("[SDK] Created role:", role.key);
      expect(role.key).toBe(TEST_ROLE_KEY);
      expect(role.permissions).toContain(`${TEST_RESOURCE_KEY}:read`);
    });

    itIntegration("lists roles and finds the created one", async () => {
      const result = await client.api.roles.list();
      const found = result.data.some((r) => r.key === TEST_ROLE_KEY);
      expect(found).toBe(true);
    });

    itIntegration("gets a role by key", async () => {
      const role = await client.api.roles.get(TEST_ROLE_KEY);
      expect(role.key).toBe(TEST_ROLE_KEY);
      expect(Array.isArray(role.permissions)).toBe(true);
    });
  });

  // ─── 6. Role Assignments ────────────────────────────────────────────────────

  describe("6. Role Assignments", () => {
    itIntegration("assigns a role to a user in a tenant", async () => {
      const assignment = await client.api.roleAssignments.assign({
        user: TEST_USER_KEY,
        role: TEST_ROLE_KEY,
        tenant: TEST_TENANT_KEY,
      });
      console.log("[SDK] Assigned role:", assignment.user, "->", assignment.role);
      expect(assignment.user).toBe(TEST_USER_KEY);
      expect(assignment.role).toBe(TEST_ROLE_KEY);
    });

    itIntegration("lists role assignments for the user", async () => {
      const result = await client.api.roleAssignments.list({ user: TEST_USER_KEY });
      expect(result.data.length).toBeGreaterThan(0);
      const found = result.data.some(
        (a) => a.user === TEST_USER_KEY && a.role === TEST_ROLE_KEY
      );
      expect(found).toBe(true);
    });
  });

  // ─── 7. check() — allowed ───────────────────────────────────────────────────

  describe("7. Permission Check — allowed", () => {
    itIntegration("returns true when user has the required permission via role", async () => {
      const allowed = await client.check({
        user: TEST_USER_KEY,
        action: "read",
        resource: TEST_RESOURCE_KEY,
        tenant: TEST_TENANT_KEY,
      });
      console.log(`[SDK] check() read allowed: ${allowed}`);
      expect(allowed).toBe(true);
    });
  });

  // ─── 8. check() — denied ────────────────────────────────────────────────────

  describe("8. Permission Check — denied", () => {
    itIntegration("returns false for a user with no role assignment", async () => {
      const allowed = await client.check({
        user: `no-role-${TS}@integration.test`,
        action: "read",
        resource: TEST_RESOURCE_KEY,
        tenant: TEST_TENANT_KEY,
      });
      expect(allowed).toBe(false);
    });

    itIntegration("returns false for an action not in the role permissions", async () => {
      const allowed = await client.check({
        user: TEST_USER_KEY,
        action: "delete",
        resource: TEST_RESOURCE_KEY,
        tenant: TEST_TENANT_KEY,
      });
      // Role only has read + write
      expect(allowed).toBe(false);
    });
  });

  // ─── 9. bulkCheck() ─────────────────────────────────────────────────────────

  describe("9. Bulk Permission Check", () => {
    itIntegration("evaluates multiple checks at once", async () => {
      const response = await client.bulkCheck({
        checks: [
          { user: TEST_USER_KEY, action: "read",   resource: TEST_RESOURCE_KEY, tenant: TEST_TENANT_KEY },
          { user: TEST_USER_KEY, action: "write",  resource: TEST_RESOURCE_KEY, tenant: TEST_TENANT_KEY },
          { user: TEST_USER_KEY, action: "delete", resource: TEST_RESOURCE_KEY, tenant: TEST_TENANT_KEY },
        ],
      });
      console.log(
        "[SDK] bulkCheck:",
        response.results.map((r) => `${r.request.action}=${r.response.allowed}`)
      );
      expect(response.results).toHaveLength(3);
      expect(response.results[0].response.allowed).toBe(true);  // read
      expect(response.results[1].response.allowed).toBe(true);  // write
      expect(response.results[2].response.allowed).toBe(false); // delete — not in role
    });
  });

  // ─── 10. getPermissions() ───────────────────────────────────────────────────

  describe("10. getPermissions()", () => {
    itIntegration("returns all roles and permissions for a user", async () => {
      const result = await client.getPermissions({
        user: TEST_USER_KEY,
        tenant: TEST_TENANT_KEY,
      });
      console.log("[SDK] getPermissions:", result);
      expect(Array.isArray(result.roles)).toBe(true);
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(result.roles).toContain(TEST_ROLE_KEY);
      expect(result.permissions).toContain(`${TEST_RESOURCE_KEY}:read`);
    });
  });

  // ─── 11. syncUser() ─────────────────────────────────────────────────────────

  describe("11. syncUser()", () => {
    itIntegration("syncs a user via the convenience method", async () => {
      const user = await client.syncUser({
        key: TEST_USER_KEY,
        email: TEST_USER_KEY,
        firstName: "Synced",
        lastName: "User",
      });
      console.log("[SDK] syncUser:", user?.key ?? user);
      expect(user).toBeTruthy();
    });
  });

  // ─── 12. Unassign role ──────────────────────────────────────────────────────

  describe("12. Role Assignment — unassign", () => {
    itIntegration("unassigns a role and verifies it is removed", async () => {
      await client.api.roleAssignments.unassign({
        user: TEST_USER_KEY,
        role: TEST_ROLE_KEY,
        tenant: TEST_TENANT_KEY,
      });
      const result = await client.api.roleAssignments.list({
        user: TEST_USER_KEY,
        tenant: TEST_TENANT_KEY,
      });
      const stillAssigned = result.data.some(
        (a) => a.user === TEST_USER_KEY && a.role === TEST_ROLE_KEY
      );
      expect(stillAssigned).toBe(false);
    });
  });
});
