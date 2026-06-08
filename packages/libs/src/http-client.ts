import axios, { isAxiosError } from 'axios'
import type { AxiosInstance, RawAxiosRequestHeaders } from 'axios'

/** Options for constructing an {@link HttpClient}. */
export interface HttpClientOptions {
  /** Base URL prepended to every request path. */
  baseUrl: string
  /** Default headers merged into every request. */
  headers?: Record<string, string>
  /** Automatic retry configuration. Defaults to 1 attempt (no retry). */
  retry?: { attempts: number; delayMs: number }
}

/**
 * Typed HTTP error thrown by {@link HttpClient} when the server returns a
 * non-2xx response.
 *
 * @example
 * ```ts
 * try {
 *   await client.get('/users')
 * } catch (err) {
 *   if (err instanceof ApiError) console.log(err.status) // e.g. 404
 * }
 * ```
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Thin axios-based HTTP client with typed responses, default headers, and
 * optional automatic retry.
 *
 * @example
 * ```ts
 * const client = new HttpClient({ baseUrl: 'https://api.example.com', retry: { attempts: 3, delayMs: 300 } })
 * const user = await client.get<User>('/users/1')
 * ```
 */
export class HttpClient {
  private readonly axiosInstance: AxiosInstance
  private readonly options: HttpClientOptions

  constructor(options: HttpClientOptions) {
    this.options = options
    this.axiosInstance = axios.create({
      baseURL: options.baseUrl,
      headers: options.headers as RawAxiosRequestHeaders | undefined,
    })
  }

  /** The base URL this client was constructed with. */
  get baseUrl(): string {
    return this.options.baseUrl
  }

  /**
   * Executes an axios request with automatic retry on failure.
   * Returns the unwrapped response data.
   */
  private async execute<T>(
    requestFn: () => Promise<T>,
  ): Promise<T> {
    const maxAttempts = this.options.retry?.attempts ?? 1
    const delayMs = this.options.retry?.delayMs ?? 0

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        if (attempt === maxAttempts) {
          if (isAxiosError(error) && error.response !== undefined) {
            const status = error.response.status
            const message =
              typeof error.response.data === 'string'
                ? error.response.data
                : (error.message ?? `HTTP ${status}`)
            throw new ApiError(status, `HTTP ${status}: ${message}`)
          }
          throw error
        }
        await new Promise<void>((resolve) => setTimeout(resolve, delayMs))
      }
    }

    // Unreachable: the loop always returns or throws on the last attempt.
    throw new Error('Unexpected: exhausted retries without throwing')
  }

  /**
   * Sends a GET request and returns the parsed response body.
   *
   * @param path - Path appended to `baseUrl`.
   * @returns Parsed response data typed as `T`.
   */
  get<T>(path: string): Promise<T> {
    return this.execute<T>(async () => {
      const response = await this.axiosInstance.get<T>(path)
      return response.data
    })
  }

  /**
   * Sends a POST request with a JSON body and returns the parsed response body.
   *
   * @param path - Path appended to `baseUrl`.
   * @param body - Request payload — serialised as JSON.
   * @returns Parsed response data typed as `T`.
   */
  post<T>(path: string, body: unknown): Promise<T> {
    return this.execute<T>(async () => {
      const response = await this.axiosInstance.post<T>(path, body)
      return response.data
    })
  }

  /**
   * Sends a PUT request with a JSON body and returns the parsed response body.
   *
   * @param path - Path appended to `baseUrl`.
   * @param body - Request payload — serialised as JSON.
   * @returns Parsed response data typed as `T`.
   */
  put<T>(path: string, body: unknown): Promise<T> {
    return this.execute<T>(async () => {
      const response = await this.axiosInstance.put<T>(path, body)
      return response.data
    })
  }

  /**
   * Sends a PATCH request with an optional JSON body and returns the parsed
   * response body.
   *
   * @param path - Path appended to `baseUrl`.
   * @param body - Optional request payload — serialised as JSON when provided.
   * @returns Parsed response data typed as `T`.
   */
  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.execute<T>(async () => {
      const response = await this.axiosInstance.patch<T>(path, body)
      return response.data
    })
  }

  /**
   * Sends a DELETE request.
   *
   * @param path - Path appended to `baseUrl`.
   */
  delete(path: string): Promise<void> {
    return this.execute<void>(async () => {
      await this.axiosInstance.delete(path)
    })
  }
}
