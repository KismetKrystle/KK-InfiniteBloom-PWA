import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { supabase, SiteContent } from '../../lib/supabase'
import { Save, RefreshCw, Upload } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import TestimonialManager from './TestimonialManager'
import ProductManager from './ProductManager'
import AboutAuthorManager from './AboutAuthorManager'
import AdditionalContentManager from './AdditionalContentManager'

export default function ContentManager() {
  const location = useLocation()
  const [content, setContent] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('hero')

  // Handle navigation state to set the correct subtab
  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab)
    }
  }, [location.state])

  // Load content from database
  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')

      if (error) {
        console.log('Mock mode: Starting with empty content')
        // Don't throw - just start with empty content
        setContent({})
        return
      }

      const contentMap: Record<string, any> = {}
      data?.forEach((item: SiteContent) => {
        if (!contentMap[item.section]) contentMap[item.section] = {}
        contentMap[item.section][item.key] = item.value
      })
      
      setContent(contentMap)
    } catch (error) {
      console.error('Error loading content:', error)
      // Don't show error toast in demo mode - just use empty content
      setContent({})
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (section: string, key: string, value: any) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section,
          key,
          value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section,key'
        })

      if (error) throw error

      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }))

      toast.success('Content saved successfully')
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (section: string, key: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Content Management</h2>
          <p className="text-muted-foreground">Edit all frontend content dynamically</p>
        </div>
        <Button onClick={loadContent} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 md:grid-cols-5 gap-1 p-1 h-auto">
          <TabsTrigger value="hero" className="text-xs md:text-sm px-2 py-2">Hero</TabsTrigger>
          <TabsTrigger value="testimonials" className="text-xs md:text-sm px-2 py-2">Testimonials</TabsTrigger>
          <TabsTrigger value="products" className="text-xs md:text-sm px-2 py-2">Products</TabsTrigger>
          <TabsTrigger value="about" className="text-xs md:text-sm px-2 py-2">About</TabsTrigger>
          <TabsTrigger value="other" className="text-xs md:text-sm px-2 py-2">Other</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Main page title, subtitle, and opening quote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Page Title</Label>
                <Input
                  id="hero-title"
                  value={content.hero?.title || ''}
                  onChange={(e) => updateContent('hero', 'title', e.target.value)}
                  placeholder="Infinite Bloom"
                />
                <Button 
                  size="sm" 
                  onClick={() => saveContent('hero', 'title', content.hero?.title)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Title
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={content.hero?.subtitle || ''}
                  onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                  placeholder="A digital flipbook experience..."
                  rows={3}
                />
                <Button 
                  size="sm" 
                  onClick={() => saveContent('hero', 'subtitle', content.hero?.subtitle)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Subtitle
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-quote">Opening Quote</Label>
                <Textarea
                  id="hero-quote"
                  value={content.hero?.quote || ''}
                  onChange={(e) => updateContent('hero', 'quote', e.target.value)}
                  placeholder="Enter the opening quote..."
                  rows={3}
                />
                <Button 
                  size="sm" 
                  onClick={() => saveContent('hero', 'quote', content.hero?.quote)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Quote
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-image">Main Book Image</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Upload File</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      className="cursor-pointer"
                      onChange={(e) => {
                        // File upload handling would go here
                        // For now, show placeholder behavior
                        if (e.target.files?.[0]) {
                          updateContent('hero', 'mainImage', URL.createObjectURL(e.target.files[0]))
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Or use URL</Label>
                    <Input
                      id="hero-image"
                      value={content.hero?.mainImage || ''}
                      onChange={(e) => updateContent('hero', 'mainImage', e.target.value)}
                      placeholder="https://example.com/book-image.jpg"
                    />
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => saveContent('hero', 'mainImage', content.hero?.mainImage)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Image
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-description">Infinite Bloom Description</Label>
                <Textarea
                  id="hero-description"
                  value={content.hero?.description || ''}
                  onChange={(e) => updateContent('hero', 'description', e.target.value)}
                  placeholder="Describe the Infinite Bloom experience..."
                  rows={4}
                />
                <Button 
                  size="sm" 
                  onClick={() => saveContent('hero', 'description', content.hero?.description)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Description
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* Testimonials Section - Full Management Interface */}
        <TabsContent value="testimonials">
          <TestimonialManager />
        </TabsContent>

        <TabsContent value="products">
          <ProductManager />
        </TabsContent>

        <TabsContent value="about">
          <AboutAuthorManager />
        </TabsContent>

        <TabsContent value="other">
          <AdditionalContentManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}