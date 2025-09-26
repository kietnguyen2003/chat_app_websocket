export interface User {
  user_id: string
  role: string
  username?: string
  email?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface BackendAuthResponse {
  status: string
  message: string
  data: {
    user: User
    token: AuthTokens
  }
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  username: string
}

import { httpClient } from './http-client'

// Real API functions
export const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Auth endpoints don't need token, so use direct fetch
    const data: BackendAuthResponse = await httpClient.post('/auth/login', credentials)

    // Transform backend response to frontend format
    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.token.accessToken,
        refreshToken: data.data.token.refreshToken,
      },
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Auth endpoints don't need token, so use direct fetch
    const data: BackendAuthResponse = await httpClient.post('/auth/register', credentials)

    // Transform backend response to frontend format
    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.token.accessToken,
        refreshToken: data.data.token.refreshToken,
      },
    }
  },

  async refreshToken(userID: string, refreshToken: string): Promise<AuthTokens> {
    const data: BackendAuthResponse = await httpClient.post('/auth/refresh', {
      userID,
      refreshToken: refreshToken,
    })

    return {
      accessToken: data.data.token.accessToken,
      refreshToken: data.data.token.refreshToken,
    }
  },

  async logout(userID: string, refreshToken: string): Promise<void> {
    await httpClient.post('/auth/logout', {
      userID,
      refreshToken: refreshToken,
    })
  },
}

// Token management
export const tokenManager = {
  setTokens(tokens: AuthTokens) {
    localStorage.setItem("accessToken", tokens.accessToken)
    localStorage.setItem("refreshToken", tokens.refreshToken)
  },

  getAccessToken(): string | null {
    return localStorage.getItem("accessToken")
  },

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken")
  },

  clearTokens() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
  },

  setUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user))
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  getUserId(): string | null {
    const user = this.getUser()
    return user ? user.user_id : null
  },
}
