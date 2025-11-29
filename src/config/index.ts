/**
 * Permissio.io SDK Configuration
 */
export interface IPermissioConfig {
  /**
   * API key for authentication (required)
   * Format: permis_key_<64-char-hex>
   */
  token: string;

  /**
   * Base URL for the Permissio.io API
   * @default "https://api.permissio.io"
   */
  apiUrl?: string;

  /**
   * Project ID (optional - will be auto-fetched from API key scope if not provided)
   */
  projectId?: string;

  /**
   * Environment ID (optional - will be auto-fetched from API key scope if not provided)
   */
  environmentId?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Custom headers to include in all requests
   */
  customHeaders?: Record<string, string>;

  /**
   * Number of retry attempts for failed requests
   * @default 3
   */
  retryAttempts?: number;

  /**
   * Enable throwing exceptions on errors
   * @default true
   */
  throwOnError?: boolean;
}

/**
 * Internal resolved configuration with all defaults applied
 */
export interface IResolvedConfig {
  token: string;
  apiUrl: string;
  projectId?: string;
  environmentId?: string;
  debug: boolean;
  timeout: number;
  customHeaders: Record<string, string>;
  retryAttempts: number;
  throwOnError: boolean;
}

/**
 * Mutable configuration that can be updated after scope fetch
 */
export class MutableConfig implements IResolvedConfig {
  token: string;
  apiUrl: string;
  projectId?: string;
  environmentId?: string;
  debug: boolean;
  timeout: number;
  customHeaders: Record<string, string>;
  retryAttempts: number;
  throwOnError: boolean;

  constructor(config: IResolvedConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
    this.projectId = config.projectId;
    this.environmentId = config.environmentId;
    this.debug = config.debug;
    this.timeout = config.timeout;
    this.customHeaders = config.customHeaders;
    this.retryAttempts = config.retryAttempts;
    this.throwOnError = config.throwOnError;
  }

  /**
   * Update project and environment IDs from API key scope
   */
  updateScope(projectId?: string, environmentId?: string): void {
    if (projectId && !this.projectId) {
      this.projectId = projectId;
    }
    if (environmentId && !this.environmentId) {
      this.environmentId = environmentId;
    }
  }

  /**
   * Check if scope (project and environment) is configured
   */
  hasScope(): boolean {
    return !!(this.projectId && this.environmentId);
  }
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Omit<IResolvedConfig, "token"> = {
  apiUrl: "https://api.permissio.io",
  debug: false,
  timeout: 30000,
  customHeaders: {},
  retryAttempts: 3,
  throwOnError: true,
};

/**
 * Resolve configuration by applying defaults
 */
export function resolveConfig(config: IPermissioConfig): MutableConfig {
  if (!config.token) {
    throw new Error("Permissio.io SDK: API token is required");
  }

  if (!config.token.startsWith("permis_key_")) {
    throw new Error(
      "Permissio.io SDK: Invalid API key format. Expected format: permis_key_<key>"
    );
  }

  return new MutableConfig({
    token: config.token,
    apiUrl: config.apiUrl ?? DEFAULT_CONFIG.apiUrl,
    projectId: config.projectId,
    environmentId: config.environmentId,
    debug: config.debug ?? DEFAULT_CONFIG.debug,
    timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
    customHeaders: { ...DEFAULT_CONFIG.customHeaders, ...config.customHeaders },
    retryAttempts: config.retryAttempts ?? DEFAULT_CONFIG.retryAttempts,
    throwOnError: config.throwOnError ?? DEFAULT_CONFIG.throwOnError,
  });
}
