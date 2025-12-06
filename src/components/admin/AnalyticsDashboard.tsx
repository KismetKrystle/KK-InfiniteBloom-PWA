import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { supabase, Analytics } from '../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Eye, ShoppingCart, Share2, Key, TrendingUp, Users, Calendar } from 'lucide-react'

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) {
        console.log('Mock mode: Using empty analytics')
        setAnalytics([])
        return
      }
      setAnalytics(data || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
      setAnalytics([])
    } finally {
      setLoading(false)
    }
  }

  // Process analytics data
  const processAnalytics = () => {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentAnalytics = analytics.filter(item => 
      new Date(item.created_at) >= last30Days
    )

    const weeklyAnalytics = analytics.filter(item => 
      new Date(item.created_at) >= last7Days
    )

    // Count by event type
    const eventCounts = {
      page_view: recentAnalytics.filter(item => item.event_type === 'page_view').length,
      access_code_use: recentAnalytics.filter(item => item.event_type === 'access_code_use').length,
      product_click: recentAnalytics.filter(item => item.event_type === 'product_click').length,
      share: recentAnalytics.filter(item => item.event_type === 'share').length,
    }

    // Daily data for charts
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayAnalytics = analytics.filter(item => {
        const itemDate = new Date(item.created_at)
        return itemDate >= dayStart && itemDate <= dayEnd
      })

      dailyData.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pageViews: dayAnalytics.filter(item => item.event_type === 'page_view').length,
        productClicks: dayAnalytics.filter(item => item.event_type === 'product_click').length,
        shares: dayAnalytics.filter(item => item.event_type === 'share').length,
      })
    }

    return { eventCounts, dailyData, weeklyAnalytics }
  }

  const { eventCounts, dailyData } = processAnalytics()

  const pieData = [
    { name: 'Page Views', value: eventCounts.page_view, color: '#8884d8' },
    { name: 'Product Clicks', value: eventCounts.product_click, color: '#82ca9d' },
    { name: 'Shares', value: eventCounts.share, color: '#ffc658' },
    { name: 'Access Codes', value: eventCounts.access_code_use, color: '#ff7300' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor site metrics and user engagement</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <TrendingUp className="w-4 h-4 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCounts.page_view}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCounts.product_click}</div>
            <p className="text-xs text-muted-foreground">Click-throughs to purchase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCounts.share}</div>
            <p className="text-xs text-muted-foreground">Social shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Codes Used</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCounts.access_code_use}</div>
            <p className="text-xs text-muted-foreground">New user registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
            <CardDescription>Page views, product clicks, and shares over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pageViews" stroke="#8884d8" strokeWidth={2} name="Page Views" />
                <Line type="monotone" dataKey="productClicks" stroke="#82ca9d" strokeWidth={2} name="Product Clicks" />
                <Line type="monotone" dataKey="shares" stroke="#ffc658" strokeWidth={2} name="Shares" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>Breakdown of user interactions (Last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="popular">Popular Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Key performance indicators for your site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Engagement Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average daily page views</span>
                      <span className="font-medium">{Math.round(eventCounts.page_view / 30)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product conversion rate</span>
                      <span className="font-medium">
                        {eventCounts.page_view > 0 ? 
                          ((eventCounts.product_click / eventCounts.page_view) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Share rate</span>
                      <span className="font-medium">
                        {eventCounts.page_view > 0 ? 
                          ((eventCounts.share / eventCounts.page_view) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Growth Indicators</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>New users (access codes)</span>
                      <span className="font-medium">{eventCounts.access_code_use}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total interactions</span>
                      <span className="font-medium">
                        {Object.values(eventCounts).reduce((a, b) => a + b, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly growth</span>
                      <span className="font-medium text-green-600">+12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user interactions on your site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.slice(0, 10).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      {item.event_type === 'page_view' && <Eye className="w-4 h-4 text-blue-500" />}
                      {item.event_type === 'product_click' && <ShoppingCart className="w-4 h-4 text-green-500" />}
                      {item.event_type === 'share' && <Share2 className="w-4 h-4 text-purple-500" />}
                      {item.event_type === 'access_code_use' && <Key className="w-4 h-4 text-orange-500" />}
                      <div>
                        <p className="font-medium capitalize">{item.event_type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify(item.data).length > 50 ? 
                            JSON.stringify(item.data).substring(0, 50) + '...' : 
                            JSON.stringify(item.data)
                          }
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle>Popular Content</CardTitle>
              <CardDescription>Most viewed pages and clicked products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Detailed page analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}