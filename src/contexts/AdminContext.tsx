import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface AdminContextType {
  isAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in as admin
    const checkAdminSession = async () => {
      try {
        // First check localStorage for demo mode
        const isAdminStored = localStorage.getItem('isAdmin')
        if (isAdminStored === 'true') {
          setIsAdmin(true)
          setLoading(false)
          return
        }

        // Then check Supabase session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email === 'admin@infinitebloom.com') {
          setIsAdmin(true)
        }
      } catch (error) {
        console.log('Supabase not configured, using demo mode')
        // Check localStorage as fallback
        const isAdminStored = localStorage.getItem('isAdmin')
        if (isAdminStored === 'true') {
          setIsAdmin(true)
        }
      }
      setLoading(false)
    }

    checkAdminSession()

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user?.email === 'admin@infinitebloom.com') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.log('Supabase auth listener not available')
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Demo mode - allow admin login with specific credentials
        if (email === 'admin@infinitebloom.com' && password === 'admin123') {
          setIsAdmin(true)
          localStorage.setItem('isAdmin', 'true') // Persist admin state
          return true
        }
        return false
      }

      if (data.user?.email === 'admin@infinitebloom.com') {
        setIsAdmin(true)
        localStorage.setItem('isAdmin', 'true')
        return true
      }
      
      return false
    } catch (error) {
      // If Supabase is not configured or any error occurs, try demo mode
      if (email === 'admin@infinitebloom.com' && password === 'admin123') {
        setIsAdmin(true)
        localStorage.setItem('isAdmin', 'true')
        return true
      }
      console.error('Admin login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.log('Logout error (Supabase not configured)')
    }
    setIsAdmin(false)
    localStorage.removeItem('isAdmin') // Remove persisted admin state
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}