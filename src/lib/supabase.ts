import { createClient } from '@supabase/supabase-js'

// Types for the database schema
export interface SiteContent {
  id?: string
  section: string
  key: string
  value: any
  updated_at?: string
}

export interface AccessCode {
  id: string
  code: string
  email: string
  name?: string
  phone?: string
  device_limit: number
  note?: string
  is_used: boolean
  used_by?: string
  created_at: string
  used_at?: string
  is_manual: boolean  // Only show manually created codes
}

export interface Analytics {
  id: string
  event_type: string
  user_id?: string
  metadata?: any
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  admin_id?: string
  content: string
  is_from_admin: boolean
  created_at: string
  read: boolean
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  created_at: string
}

// Replace these with your actual Supabase credentials
// You can get these from your Supabase project dashboard
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE' // e.g., 'https://xyzcompany.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE' // Your public anon key

// Check if credentials are configured
const isConfigured = supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20

// Log demo mode status
if (!isConfigured) {
  console.log('%c🌸 Infinite Bloom - Demo Mode', 'color: #8B5CF6; font-size: 16px; font-weight: bold;')
  console.log('%cSupabase is running in mock mode. All data is stored locally and will be lost on refresh.', 'color: #666; font-size: 12px;')
  console.log('%cTo enable real persistence, update credentials in /lib/supabase.ts', 'color: #666; font-size: 12px;')
}

// Create either real or mock client
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()

// Mock client for when Supabase isn't configured yet
function createMockClient() {
  const mockResponse = { data: null, error: { message: 'Supabase not configured. Please update your credentials in /lib/supabase.ts' } }
  
  // Mock data for different tables
  const mockData: Record<string, any[]> = {
    access_codes: [
      {
        id: 'mock-1',
        code: 'ABC12345',
        email: 'user1@example.com',
        name: 'John Smith',
        phone: '+1-555-0123',
        device_limit: 2,
        note: 'VIP customer - priority support',
        is_used: false,
        is_manual: true,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'mock-2',
        code: 'XYZ67890',
        email: 'user2@example.com',
        name: 'Jane Doe',
        phone: '+1-555-0456',
        device_limit: 1,
        note: 'Educational discount applied',
        is_used: true,
        used_by: 'user2@example.com',
        is_manual: true,
        created_at: '2024-01-10T15:30:00Z',
        used_at: '2024-01-12T09:15:00Z'
      },
      {
        id: 'mock-3',
        code: 'DEF13579',
        email: 'user3@example.com',
        name: 'Mike Johnson',
        phone: '+1-555-0789',
        device_limit: 3,
        note: 'Corporate account - 3 device access',
        is_used: false,
        is_manual: true,
        created_at: '2024-01-20T14:20:00Z'
      }
    ],
    site_content: [],
    testimonials: [],
    analytics: [],
    messages: [],
    user_profiles: []
  }
  
  // Create a chainable query builder mock
  const createQueryBuilder = (tableName: string) => {
    let currentData = mockData[tableName] || []
    
    const builder = {
      select: function(columns?: string) { 
        console.log('Mock Supabase: select called with', columns)
        return this 
      },
      insert: function(data: any) { 
        console.log('Mock Supabase: insert called with', data)
        // For insert operations, return the inserted data with an ID
        const newItem = {
          id: `mock-${Date.now()}`,
          ...data
        }
        currentData.unshift(newItem)
        return {
          ...this,
          then: function(onFulfilled?: any) {
            return Promise.resolve({ data: newItem, error: null }).then(onFulfilled)
          }
        }
      },
      update: function(data: any) { 
        console.log('Mock Supabase: update called with', data)
        return {
          ...this,
          then: function(onFulfilled?: any) {
            // Return success for mock update operations
            return Promise.resolve({ data: data, error: null }).then(onFulfilled)
          }
        }
      },
      delete: function() { 
        console.log('Mock Supabase: delete called')
        return {
          ...this,
          then: function(onFulfilled?: any) {
            return Promise.resolve({ data: null, error: null }).then(onFulfilled)
          }
        }
      },
      upsert: function(data: any, options?: any) { 
        console.log('Mock Supabase: upsert called with', data, options)
        // For upsert, store the data in memory
        const newItem = {
          id: `mock-${Date.now()}`,
          ...data
        }
        // Add to mock data if it doesn't exist
        const existingIndex = currentData.findIndex((item: any) => 
          item.section === data.section && item.key === data.key
        )
        if (existingIndex >= 0) {
          currentData[existingIndex] = { ...currentData[existingIndex], ...data }
        } else {
          currentData.push(newItem)
        }
        return {
          ...this,
          then: function(onFulfilled?: any) {
            // Return success for mock upsert operations
            return Promise.resolve({ data: newItem, error: null }).then(onFulfilled)
          }
        }
      },
      eq: function(column: string, value: any) { 
        console.log('Mock Supabase: eq called with', column, value)
        return this 
      },
      order: function(column: string, options?: any) { 
        console.log('Mock Supabase: order called with', column, options)
        // For order, we can sort the mock data
        if (column === 'created_at' && options?.ascending === false) {
          currentData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }
        return this 
      },
      limit: function(count: number) { 
        console.log('Mock Supabase: limit called with', count)
        currentData = currentData.slice(0, count)
        return this 
      },
      single: function() { 
        console.log('Mock Supabase: single called')
        return {
          ...this,
          then: function(onFulfilled?: any) {
            const singleResult = currentData[0] || null
            return Promise.resolve({ data: singleResult, error: null }).then(onFulfilled)
          }
        }
      },
      or: function(query: string) { 
        console.log('Mock Supabase: or called with', query)
        return this 
      },
      then: function(onFulfilled?: any, onRejected?: any) {
        // This makes the query builder thenable (Promise-like)
        console.log('Mock Supabase: executing query, returning mock data for', tableName)
        return Promise.resolve({ data: currentData, error: null }).then(onFulfilled, onRejected)
      },
      catch: function(onRejected?: any) {
        return Promise.resolve({ data: currentData, error: null }).catch(onRejected)
      }
    }
    
    return builder
  }
  
  return {
    from: (table: string) => {
      console.log('Mock Supabase: from called with table', table)
      return createQueryBuilder(table)
    },
    auth: {
      getSession: () => {
        console.log('Mock Supabase: getSession called')
        return Promise.resolve({ data: { session: null }, error: null })
      },
      signInWithPassword: (credentials: any) => {
        console.log('Mock Supabase: signInWithPassword called with', credentials.email)
        // Return an error to allow demo mode fallback
        return Promise.resolve({ 
          data: { user: null, session: null }, 
          error: { message: 'Mock auth - use demo credentials' } 
        })
      },
      signOut: () => {
        console.log('Mock Supabase: signOut called')
        return Promise.resolve({ error: null })
      },
      onAuthStateChange: (callback: any) => {
        console.log('Mock Supabase: onAuthStateChange called')
        return { 
          data: { subscription: { unsubscribe: () => {} } }
        }
      }
    },
    channel: (name: string) => ({
      on: function() { return this },
      subscribe: () => ({ unsubscribe: () => {} })
    })
  }
}