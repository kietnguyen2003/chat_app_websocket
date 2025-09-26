"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { type User, type LoginCredentials, type RegisterCredentials, authAPI, tokenManager } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshTokens: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing user on mount
    const savedUser = tokenManager.getUser()
    const accessToken = tokenManager.getAccessToken()

    if (savedUser && accessToken) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login(credentials)
      tokenManager.setTokens(response.tokens)
      tokenManager.setUser(response.user)
      setUser(response.user)
      router.push("/chat")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true)
    try {
      const response = await authAPI.register(credentials)
      tokenManager.setTokens(response.tokens)
      tokenManager.setUser(response.user)
      setUser(response.user)
      router.push("/chat")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    const userID = tokenManager.getUserId()
    const refreshToken = tokenManager.getRefreshToken()

    if (userID && refreshToken) {
      try {
        await authAPI.logout(userID, refreshToken)
      } catch (error) {
        console.error("Logout API call failed:", error)
        // Continue with local logout even if API fails
      }
    }

    tokenManager.clearTokens()
    setUser(null)
    router.push("/auth")
  }

  const refreshTokens = async () => {
    const refreshToken = tokenManager.getRefreshToken()
    const userID = tokenManager.getUserId()

    if (!refreshToken || !userID) {
      logout()
      return
    }

    try {
      const newTokens = await authAPI.refreshToken(userID, refreshToken)
      tokenManager.setTokens(newTokens)
    } catch (error) {
      console.error("Token refresh failed:", error)
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
