"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_PASSWORD = "Demitrie23@"
const AUTH_KEY = "admin_authenticated"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user was previously authenticated (only in browser)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AUTH_KEY)
      if (saved === "true") {
        setIsAuthenticated(true)
      }
    }
  }, [])

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, "true")
      }
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
