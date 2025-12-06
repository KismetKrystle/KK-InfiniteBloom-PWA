import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  LogOut, 
  Settings, 
  Key, 
  BarChart3, 
  MessageSquare, 
  ExternalLink,
  Edit,
  Users,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import ContentManager from './ContentManager'
import AccessCodeManager from './AccessCodeManager'

import MessagingCenter from './MessagingCenter'

export default function AdminDashboard() {
  const { logout } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock unread messages count - in real app this would come from your messaging system
  const unreadMessagesCount = 0 // Change this to test red vs green state

  // Handle navigation state to set the correct tab
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location.state])

  const handleOpenSite = () => {
    // Navigate to landing page in current tab for now
    // This ensures proper React Router context
    navigate('/landing')
  }

  // Check if Supabase is configured
  const isSupabaseConfigured = window.location.hostname !== 'localhost' && 
    !document.querySelector('script[src*="supabase"]')?.textContent?.includes('YOUR_SUPABASE_URL_HERE')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://ik.imagekit.io/kis84/infinite%20bloom%20logo.png?updatedAt=1759401362780" 
                alt="Infinite Bloom Logo" 
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-2xl font-semibold">Infinite Bloom Admin</h1>
                <p className="text-muted-foreground">Manage your digital flipbook experience</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={handleOpenSite} size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Site
              </Button>             
              <Button variant="outline" onClick={logout} size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Status Alert */}
      {!isSupabaseConfigured && (
        <div className="container mx-auto px-6 py-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode:</strong> You're using demo credentials. To enable full functionality, configure your Supabase credentials in <code className="bg-yellow-100 px-1 rounded">/lib/supabase.ts</code> and create an admin account.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-4 gap-1 p-1 h-auto">
            <TabsTrigger value="overview" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2 py-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2 py-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2 py-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Access</span>
            </TabsTrigger>

            <TabsTrigger value="messages" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2 py-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+23% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Site Visits</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">+8% from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,680</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                  <MessageSquare className={`h-4 w-4 ${unreadMessagesCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${unreadMessagesCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {unreadMessagesCount}
                  </div>
                  <p className={`text-xs ${unreadMessagesCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {unreadMessagesCount > 0 ? `${unreadMessagesCount} message${unreadMessagesCount > 1 ? 's' : ''} need${unreadMessagesCount === 1 ? 's' : ''} reply` : 'All messages read'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Current system health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <Badge variant="secondary" className={isSupabaseConfigured ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {isSupabaseConfigured ? 'Online' : 'Demo Mode'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Authentication</span>
                    <Badge variant="secondary" className={isSupabaseConfigured ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {isSupabaseConfigured ? 'Online' : 'Demo Mode'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Messaging</span>
                    <Badge variant="secondary" className={isSupabaseConfigured ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {isSupabaseConfigured ? 'Online' : 'Demo Mode'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analytics</span>
                    <Badge variant="secondary" className={isSupabaseConfigured ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {isSupabaseConfigured ? 'Online' : 'Demo Mode'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <ContentManager />
          </TabsContent>

          <TabsContent value="access">
            <AccessCodeManager />
          </TabsContent>



          <TabsContent value="messages">
            <MessagingCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}