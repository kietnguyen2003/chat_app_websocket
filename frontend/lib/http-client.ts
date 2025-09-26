import { tokenManager } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface RequestConfig {
  method?: string
  headers?: Record<string, string>
  body?: string
}

class HttpClient {
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []

  private async processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })

    this.failedQueue = []
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = tokenManager.getRefreshToken()
    const userID = tokenManager.getUserId()

    if (!refreshToken || !userID) {
      throw new Error('No refresh token or user ID available')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID,
          refresh_token: refreshToken,
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newTokens = {
        accessToken: data.data.token.access_token,
        refreshToken: data.data.token.refresh_token,
      }

      tokenManager.setTokens(newTokens)
      return newTokens.accessToken
    } catch (error) {
      tokenManager.clearTokens()
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
      throw error
    }
  }

  async request(endpoint: string, config: RequestConfig = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`
    const accessToken = tokenManager.getAccessToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    }

    // Add Authorization header if token exists
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const requestConfig = {
      method: config.method || 'GET',
      headers,
      body: config.body,
    }

    try {
      const response = await fetch(url, requestConfig)

      // Handle 401 Unauthorized
      if (response.status === 401 && accessToken) {
        if (this.isRefreshing) {
          // If already refreshing, wait for it to complete
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject })
          }).then(() => {
            // Retry original request with new token
            const newToken = tokenManager.getAccessToken()
            const newHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            }
            return fetch(url, { ...requestConfig, headers: newHeaders })
              .then(response => response.json())
          })
        }

        this.isRefreshing = true

        try {
          const newToken = await this.refreshToken()
          this.processQueue(null, newToken)

          // Retry original request with new token
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          }
          const retryResponse = await fetch(url, { ...requestConfig, headers: newHeaders })

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`)
          }

          return await retryResponse.json()
        } catch (error) {
          this.processQueue(error, null)
          throw error
        } finally {
          this.isRefreshing = false
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
      }
      throw error
    }
  }

  // Convenience methods
  async get(endpoint: string, config?: Omit<RequestConfig, 'method'>) {
    return this.request(endpoint, { ...config, method: 'GET' })
  }

  async post(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string, config?: Omit<RequestConfig, 'method'>) {
    return this.request(endpoint, { ...config, method: 'DELETE' })
  }
}

export const httpClient = new HttpClient()