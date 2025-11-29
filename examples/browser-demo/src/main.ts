import { Permissio } from "permissio";

// Global SDK instance
let permissio: Permissio | null = null;

// Console logging helper
function log(
  message: string,
  type: "log" | "info" | "success" | "error" | "warn" = "log"
) {
  const consoleEl = document.getElementById("console")!;
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = `console-entry ${type}`;
  entry.innerHTML = `<span class="time">[${time}]</span>${escapeHtml(message)}`;
  consoleEl.appendChild(entry);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Tab switching
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = (tab as HTMLElement).dataset.tab;

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update active content
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(`tab-${tabName}`)?.classList.add("active");
    });
  });
}

// Show/hide forms
function setupFormToggles() {
  // Users
  document.getElementById("showCreateUser")?.addEventListener("click", () => {
    document.getElementById("createUserForm")?.classList.remove("hidden");
  });
  document.getElementById("cancelCreateUser")?.addEventListener("click", () => {
    document.getElementById("createUserForm")?.classList.add("hidden");
  });

  // Roles
  document.getElementById("showCreateRole")?.addEventListener("click", () => {
    document.getElementById("createRoleForm")?.classList.remove("hidden");
  });
  document.getElementById("cancelCreateRole")?.addEventListener("click", () => {
    document.getElementById("createRoleForm")?.classList.add("hidden");
  });

  // Tenants
  document.getElementById("showCreateTenant")?.addEventListener("click", () => {
    document.getElementById("createTenantForm")?.classList.remove("hidden");
  });
  document
    .getElementById("cancelCreateTenant")
    ?.addEventListener("click", () => {
      document.getElementById("createTenantForm")?.classList.add("hidden");
    });

  // Resources
  document
    .getElementById("showCreateResource")
    ?.addEventListener("click", () => {
      document.getElementById("createResourceForm")?.classList.remove("hidden");
    });
  document
    .getElementById("cancelCreateResource")
    ?.addEventListener("click", () => {
      document.getElementById("createResourceForm")?.classList.add("hidden");
    });

  // Role Assignments
  document.getElementById("showAssignRole")?.addEventListener("click", () => {
    document.getElementById("assignRoleForm")?.classList.remove("hidden");
  });
  document.getElementById("cancelAssignRole")?.addEventListener("click", () => {
    document.getElementById("assignRoleForm")?.classList.add("hidden");
  });
}

// SDK Status helper
function setStatus(message: string, type: "success" | "error" | "info") {
  const statusEl = document.getElementById("sdkStatus")!;
  statusEl.className = `status ${type}`;
  statusEl.textContent = message;
}

// Result display helper
function showResult(
  elementId: string,
  data: unknown,
  additionalClass?: string
) {
  const resultEl = document.getElementById(elementId)!;
  resultEl.className = `result ${additionalClass || ""}`;
  resultEl.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

// Check if SDK is initialized
function requireSdk(): boolean {
  if (!permissio) {
    log("SDK not initialized. Please configure and initialize first.", "error");
    return false;
  }
  return true;
}

// Initialize SDK
async function initializeSdk() {
  const apiUrl = (document.getElementById("apiUrl") as HTMLInputElement).value;
  const token = (document.getElementById("apiKey") as HTMLInputElement).value;
  const projectId = (document.getElementById("projectId") as HTMLInputElement)
    .value;
  const environmentId = (
    document.getElementById("environmentId") as HTMLInputElement
  ).value;

  if (!token) {
    setStatus("API Key is required", "error");
    log("Initialization failed: API Key is required", "error");
    return;
  }

  try {
    permissio = new Permissio({
      token,
      apiUrl,
      // Only pass projectId/environmentId if provided
      ...(projectId && { projectId }),
      ...(environmentId && { environmentId }),
      debug: true,
    });

    // If projectId or environmentId not provided, fetch from API key scope
    if (!projectId || !environmentId) {
      setStatus("⏳ Fetching scope from API key...", "info");
      log(
        "Project/Environment IDs not provided, fetching from API key scope...",
        "info"
      );

      try {
        const scope = await permissio.getScope();
        log(
          `Scope fetched - Project: ${scope.projectId}, Environment: ${scope.environmentId}`,
          "success"
        );

        // Update the UI fields with fetched values
        if (scope.projectId) {
          (document.getElementById("projectId") as HTMLInputElement).value =
            scope.projectId;
        }
        if (scope.environmentId) {
          (document.getElementById("environmentId") as HTMLInputElement).value =
            scope.environmentId;
        }
      } catch (scopeError) {
        setStatus(`Failed to fetch scope: ${scopeError}`, "error");
        log(`Scope fetch error: ${scopeError}`, "error");
        return;
      }
    }

    setStatus("✅ SDK initialized successfully!", "success");
    log(`SDK initialized with API URL: ${apiUrl}`, "success");

    const config = permissio.getConfig();
    log(
      `Project: ${config.projectId}, Environment: ${config.environmentId}`,
      "info"
    );
  } catch (error) {
    setStatus(`Failed to initialize SDK: ${error}`, "error");
    log(`Initialization error: ${error}`, "error");
  }
}

// Permission Check
async function checkPermission() {
  if (!requireSdk()) return;

  const user = (document.getElementById("checkUser") as HTMLInputElement).value;
  const action = (document.getElementById("checkAction") as HTMLInputElement)
    .value;
  const resource = (
    document.getElementById("checkResource") as HTMLInputElement
  ).value;
  const tenant = (document.getElementById("checkTenant") as HTMLInputElement)
    .value;

  if (!user || !action || !resource) {
    log(
      "User, Action, and Resource are required for permission check",
      "error"
    );
    return;
  }

  log(
    `Checking permission: ${user} -> ${action} -> ${resource}${
      tenant ? ` (tenant: ${tenant})` : ""
    }`,
    "info"
  );

  try {
    const result = await permissio!.checkWithDetails({
      user,
      action,
      resource,
      tenant: tenant || undefined,
    });

    const allowed = result.allowed;
    showResult("checkResult", result, allowed ? "allowed" : "denied");

    const badge = allowed
      ? '<span class="permission-badge allowed">✓ ALLOWED</span>'
      : '<span class="permission-badge denied">✗ DENIED</span>';

    document.getElementById(
      "checkResult"
    )!.innerHTML = `${badge}<pre>${JSON.stringify(result, null, 2)}</pre>`;

    log(
      `Permission check result: ${allowed ? "ALLOWED" : "DENIED"}`,
      allowed ? "success" : "warn"
    );
  } catch (error) {
    showResult("checkResult", { error: String(error) });
    log(`Permission check failed: ${error}`, "error");
  }
}

// Users
async function listUsers() {
  if (!requireSdk()) return;

  log("Fetching users list...", "info");

  try {
    const result = await permissio!.api.users.list();
    showResult("usersResult", result);
    log(`Loaded ${result.data?.length || 0} users`, "success");
  } catch (error) {
    showResult("usersResult", { error: String(error) });
    log(`Failed to list users: ${error}`, "error");
  }
}

async function createUser() {
  if (!requireSdk()) return;

  const key = (document.getElementById("newUserKey") as HTMLInputElement).value;
  const email = (document.getElementById("newUserEmail") as HTMLInputElement)
    .value;
  const firstName = (
    document.getElementById("newUserFirstName") as HTMLInputElement
  ).value;
  const lastName = (
    document.getElementById("newUserLastName") as HTMLInputElement
  ).value;

  if (!key) {
    log("User key is required", "error");
    return;
  }

  log(`Creating user: ${key}`, "info");

  try {
    const result = await permissio!.api.users.create({
      key,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });
    showResult("usersResult", result);
    log(`User created successfully: ${key}`, "success");
    document.getElementById("createUserForm")?.classList.add("hidden");
  } catch (error) {
    showResult("usersResult", { error: String(error) });
    log(`Failed to create user: ${error}`, "error");
  }
}

// Roles
async function listRoles() {
  if (!requireSdk()) return;

  log("Fetching roles list...", "info");

  try {
    const result = await permissio!.api.roles.list();
    showResult("rolesResult", result);
    log(`Loaded ${result.data?.length || 0} roles`, "success");
  } catch (error) {
    showResult("rolesResult", { error: String(error) });
    log(`Failed to list roles: ${error}`, "error");
  }
}

async function createRole() {
  if (!requireSdk()) return;

  const key = (document.getElementById("newRoleKey") as HTMLInputElement).value;
  const name = (document.getElementById("newRoleName") as HTMLInputElement)
    .value;
  const description = (
    document.getElementById("newRoleDescription") as HTMLInputElement
  ).value;
  const permissionsStr = (
    document.getElementById("newRolePermissions") as HTMLInputElement
  ).value;

  if (!key) {
    log("Role key is required", "error");
    return;
  }

  const permissions = permissionsStr
    ? permissionsStr
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : undefined;

  log(`Creating role: ${key}`, "info");

  try {
    const result = await permissio!.api.roles.create({
      key,
      name: name || undefined,
      description: description || undefined,
      permissions,
    });
    showResult("rolesResult", result);
    log(`Role created successfully: ${key}`, "success");
    document.getElementById("createRoleForm")?.classList.add("hidden");
  } catch (error) {
    showResult("rolesResult", { error: String(error) });
    log(`Failed to create role: ${error}`, "error");
  }
}

// Tenants
async function listTenants() {
  if (!requireSdk()) return;

  log("Fetching tenants list...", "info");

  try {
    const result = await permissio!.api.tenants.list();
    showResult("tenantsResult", result);
    log(`Loaded ${result.data?.length || 0} tenants`, "success");
  } catch (error) {
    showResult("tenantsResult", { error: String(error) });
    log(`Failed to list tenants: ${error}`, "error");
  }
}

async function createTenant() {
  if (!requireSdk()) return;

  const key = (document.getElementById("newTenantKey") as HTMLInputElement)
    .value;
  const name = (document.getElementById("newTenantName") as HTMLInputElement)
    .value;
  const description = (
    document.getElementById("newTenantDescription") as HTMLInputElement
  ).value;

  if (!key) {
    log("Tenant key is required", "error");
    return;
  }

  log(`Creating tenant: ${key}`, "info");

  try {
    const result = await permissio!.api.tenants.create({
      key,
      name: name || undefined,
      description: description || undefined,
    });
    showResult("tenantsResult", result);
    log(`Tenant created successfully: ${key}`, "success");
    document.getElementById("createTenantForm")?.classList.add("hidden");
  } catch (error) {
    showResult("tenantsResult", { error: String(error) });
    log(`Failed to create tenant: ${error}`, "error");
  }
}

// Resources
async function listResources() {
  if (!requireSdk()) return;

  log("Fetching resources list...", "info");

  try {
    const result = await permissio!.api.resources.list();
    showResult("resourcesResult", result);
    log(`Loaded ${result.data?.length || 0} resources`, "success");
  } catch (error) {
    showResult("resourcesResult", { error: String(error) });
    log(`Failed to list resources: ${error}`, "error");
  }
}

async function createResource() {
  if (!requireSdk()) return;

  const key = (document.getElementById("newResourceKey") as HTMLInputElement)
    .value;
  const name = (document.getElementById("newResourceName") as HTMLInputElement)
    .value;
  const description = (
    document.getElementById("newResourceDescription") as HTMLInputElement
  ).value;
  const actionsStr = (
    document.getElementById("newResourceActions") as HTMLInputElement
  ).value;

  if (!key) {
    log("Resource key is required", "error");
    return;
  }

  const actions = actionsStr
    ? actionsStr
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : undefined;

  log(`Creating resource: ${key}`, "info");

  try {
    const result = await permissio!.api.resources.create({
      key,
      name: name || undefined,
      description: description || undefined,
      actions,
    });
    showResult("resourcesResult", result);
    log(`Resource created successfully: ${key}`, "success");
    document.getElementById("createResourceForm")?.classList.add("hidden");
  } catch (error) {
    showResult("resourcesResult", { error: String(error) });
    log(`Failed to create resource: ${error}`, "error");
  }
}

// Role Assignments
async function listAssignments() {
  if (!requireSdk()) return;

  log("Fetching role assignments list...", "info");

  try {
    const result = await permissio!.api.roleAssignments.list();
    showResult("assignmentsResult", result);
    log(`Loaded ${result.data?.length || 0} role assignments`, "success");
  } catch (error) {
    showResult("assignmentsResult", { error: String(error) });
    log(`Failed to list role assignments: ${error}`, "error");
  }
}

async function assignRole() {
  if (!requireSdk()) return;

  const user = (document.getElementById("assignUser") as HTMLInputElement)
    .value;
  const role = (document.getElementById("assignRole") as HTMLInputElement)
    .value;
  const tenant = (document.getElementById("assignTenant") as HTMLInputElement)
    .value;

  if (!user || !role) {
    log("User and Role are required", "error");
    return;
  }

  log(
    `Assigning role ${role} to user ${user}${
      tenant ? ` in tenant ${tenant}` : ""
    }`,
    "info"
  );

  try {
    const result = await permissio!.api.roleAssignments.assign({
      user,
      role,
      tenant: tenant || undefined,
    });
    showResult("assignmentsResult", result);
    log(`Role assigned successfully`, "success");
    document.getElementById("assignRoleForm")?.classList.add("hidden");
  } catch (error) {
    showResult("assignmentsResult", { error: String(error) });
    log(`Failed to assign role: ${error}`, "error");
  }
}

// Clear console
function clearConsole() {
  document.getElementById("console")!.innerHTML = "";
  log("Console cleared", "info");
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupFormToggles();

  // Event listeners
  document.getElementById("initSdk")?.addEventListener("click", initializeSdk);
  document
    .getElementById("checkPermission")
    ?.addEventListener("click", checkPermission);
  document
    .getElementById("clearConsole")
    ?.addEventListener("click", clearConsole);

  // Users
  document.getElementById("listUsers")?.addEventListener("click", listUsers);
  document.getElementById("createUser")?.addEventListener("click", createUser);

  // Roles
  document.getElementById("listRoles")?.addEventListener("click", listRoles);
  document.getElementById("createRole")?.addEventListener("click", createRole);

  // Tenants
  document
    .getElementById("listTenants")
    ?.addEventListener("click", listTenants);
  document
    .getElementById("createTenant")
    ?.addEventListener("click", createTenant);

  // Resources
  document
    .getElementById("listResources")
    ?.addEventListener("click", listResources);
  document
    .getElementById("createResource")
    ?.addEventListener("click", createResource);

  // Role Assignments
  document
    .getElementById("listAssignments")
    ?.addEventListener("click", listAssignments);
  document
    .getElementById("assignRoleBtn")
    ?.addEventListener("click", assignRole);

  log(
    "Permissio.io SDK Demo loaded. Configure your API settings to get started.",
    "info"
  );
});
