import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { IResolvedConfig } from "../config";
import { IApiError } from "../types";

/**
 * Custom error class for Permissio.io API errors
 */
export class PermissioApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly originalError?: AxiosError;

  constructor(error: IApiError, originalError?: AxiosError) {
    super(error.message);
    this.name = "PermissioApiError";
    this.statusCode = error.statusCode;
    this.code = error.code;
    this.details = error.details;
    this.originalError = originalError;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PermissioApiError);
    }
  }
}

/**
 * Logger interface for SDK logging
 */
export interface ILogger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

/**
 * Default console logger
 */
const defaultLogger: ILogger = {
  debug: (message: string, data?: unknown) => {
    console.debug(`[Permissio.io SDK] ${message}`, data ?? "");
  },
  info: (message: string, data?: unknown) => {
    console.info(`[Permissio.io SDK] ${message}`, data ?? "");
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[Permissio.io SDK] ${message}`, data ?? "");
  },
  error: (message: string, data?: unknown) => {
    console.error(`[Permissio.io SDK] ${message}`, data ?? "");
  },
};

/**
 * Base API client with HTTP request handling
 */
export class BaseApiClient {
  protected readonly client: AxiosInstance;
  protected readonly config: IResolvedConfig;
  protected readonly logger: ILogger;

  constructor(config: IResolvedConfig, logger?: ILogger) {
    this.config = config;
    this.logger = config.debug
      ? logger ?? defaultLogger
      : this.createNoopLogger();

    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${config.token}`,
        ...config.customHeaders,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Create a no-op logger when debug is disabled
   */
  private createNoopLogger(): ILogger {
    const noop = () => {};
    return { debug: noop, info: noop, warn: noop, error: noop };
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        this.logger.debug(
          `Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            params: config.params,
            data: config.data,
          }
        );
        return config;
      },
      (error: AxiosError) => {
        this.logger.error("Request error", error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response: ${response.status}`, {
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      async (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleError(error: AxiosError): Promise<never> {
    const config = error.config as AxiosRequestConfig & {
      _retryCount?: number;
    };

    // Retry logic for certain status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const shouldRetry =
      config &&
      (config._retryCount ?? 0) < this.config.retryAttempts &&
      error.response &&
      retryableStatuses.includes(error.response.status);

    if (shouldRetry) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      const delay = Math.min(1000 * Math.pow(2, config._retryCount), 10000);

      this.logger.warn(`Retrying request (attempt ${config._retryCount})`, {
        url: config.url,
        delay,
      });

      await this.sleep(delay);
      return this.client.request(config);
    }

    // Transform error to PermissioApiError
    const apiError = this.transformError(error);
    this.logger.error("API Error", apiError);

    if (this.config.throwOnError) {
      throw new PermissioApiError(apiError, error);
    }

    return Promise.reject(new PermissioApiError(apiError, error));
  }

  /**
   * Transform axios error to API error format
   */
  private transformError(error: AxiosError): IApiError {
    if (error.response) {
      const data = error.response.data as Record<string, unknown> | undefined;
      return {
        message: (data?.message as string) || error.message,
        code: (data?.code as string) || "API_ERROR",
        statusCode: error.response.status,
        details: data,
      };
    }

    if (error.request) {
      return {
        message: "Network error - no response received",
        code: "NETWORK_ERROR",
        statusCode: 0,
      };
    }

    return {
      message: error.message,
      code: "REQUEST_SETUP_ERROR",
      statusCode: 0,
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build the API path with project and environment context
   */
  protected buildPath(path: string): string {
    const { projectId, environmentId } = this.config;

    // Debug logging for path building
    if (this.config.debug) {
      this.logger.debug(`Building path for: ${path}`, {
        projectId,
        environmentId,
        hasScope: !!(projectId && environmentId),
      });
    }

    // For schema endpoints (resources, roles, actions) - use /v1/schema/{project}/{env}/...
    if (path.startsWith("/schema")) {
      if (projectId && environmentId) {
        const result = `/v1/schema/${projectId}/${environmentId}${path.replace(
          "/schema",
          ""
        )}`;
        if (this.config.debug) {
          this.logger.debug(`Built schema path: ${result}`);
        }
        return result;
      }
      return `/v1${path}`;
    }

    // For facts endpoints (users, tenants, role_assignments, check) - use /v1/facts/{project}/{env}/...
    if (projectId && environmentId) {
      const result = `/v1/facts/${projectId}/${environmentId}${path}`;
      if (this.config.debug) {
        this.logger.debug(`Built facts path: ${result}`);
      }
      return result;
    }

    const result = `/v1${path}`;
    if (this.config.debug) {
      this.logger.debug(`Built fallback path (no scope): ${result}`);
    }
    return result;
  }

  /**
   * Make a GET request
   */
  protected async httpGet<T>(
    path: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.client.get<T>(this.buildPath(path), { params });
    return response.data;
  }

  /**
   * Make a POST request
   */
  protected async httpPost<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(this.buildPath(path), data);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  protected async httpPut<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(this.buildPath(path), data);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  protected async httpPatch<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(this.buildPath(path), data);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  protected async httpDelete<T = void>(path: string): Promise<T> {
    const response = await this.client.delete<T>(this.buildPath(path));
    return response.data;
  }
}
