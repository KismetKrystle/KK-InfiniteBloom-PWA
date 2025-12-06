import React, { useState } from 'react'
import { useAdmin } from '../../contexts/AdminContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Lock, AlertTriangle } from 'lucide-react'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAdmin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const success = await login(credentials.email, credentials.password)
    
    if (!success) {
      setError('Invalid admin credentials or Supabase not configured')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Sign in to access the administration panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Supabase Configuration Warning */}
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode:</strong> Use <code className="bg-yellow-100 px-1 rounded">admin@infinitebloom.com</code> and <code className="bg-yellow-100 px-1 rounded">admin123</code> to access the dashboard.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@infinitebloom.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Check the{' '}
              <a href="/ADMIN_SETUP.md" className="text-primary hover:underline" target="_blank">
                Admin Setup Guide
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}