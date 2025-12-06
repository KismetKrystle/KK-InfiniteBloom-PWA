import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { supabase } from '../../lib/supabase'
import { 
  Save, 
  RefreshCw, 
  Heart, 
  ExternalLink, 
  Mic, 
  Globe, 
  Mail, 
  Phone,
  Plus,
  Trash2,
  Edit,
  Link,
  DollarSign,
  Headphones,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface DonationLink {
  id: string
  platform: string
  name: string
  url: string
  description: string
  is_active: boolean
  sort_order: number
}

interface ExternalLink {
  id: string
  title: string
  url: string
  description: string
  category: string
  is_active: boolean
  sort_order: number
}

interface PodcastInfo {
  id: string
  title: string
  description: string
  platform: string
  url: string
  episode_count?: number
  is_active: boolean
}

export default function AdditionalContentManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Donation links
  const [donationLinks, setDonationLinks] = useState<DonationLink[]>([])
  const [newDonation, setNewDonation] = useState({
    platform: 'paypal',
    name: '',
    url: '',
    description: ''
  })
  
  // External links
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([])
  const [newExternalLink, setNewExternalLink] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general'
  })
  
  // Podcast information
  const [podcastInfo, setPodcastInfo] = useState<PodcastInfo[]>([])
  const [newPodcast, setNewPodcast] = useState({
    title: '',
    description: '',
    platform: 'spotify',
    url: '',
    episode_count: 0
  })
  
  // Contact information
  const [contactInfo, setContactInfo] = useState({
    business_email: '',
    support_email: '',
    phone: '',
    address: '',
    business_hours: '',
    contact_form_enabled: true,
    auto_reply_message: ''
  })
  
  // SEO & Meta information
  const [seoInfo, setSeoInfo] = useState({
    site_title: '',
    site_description: '',
    keywords: '',
    og_image: '',
    twitter_handle: '',
    google_analytics_id: '',
    facebook_pixel_id: ''
  })

  useEffect(() => {
    loadAdditionalContent()
  }, [])

  const loadAdditionalContent = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const donationMockData: DonationLink[] = [
        {
          id: '1',
          platform: 'paypal',
          name: 'PayPal Donation',
          url: 'https://paypal.me/infinitebloom',
          description: 'Support the creation of more mindful content',
          is_active: true,
          sort_order: 1
        },
        {
          id: '2',
          platform: 'ko-fi',
          name: 'Ko-fi',
          url: 'https://ko-fi.com/infinitebloom',
          description: 'Buy me a coffee to fuel creativity',
          is_active: true,
          sort_order: 2
        }
      ]
      
      const externalMockData: ExternalLink[] = [
        {
          id: '1',
          title: 'Mindfulness Blog',
          url: 'https://blog.infinitebloom.com',
          description: 'Weekly articles on mindfulness and poetry',
          category: 'blog',
          is_active: true,
          sort_order: 1
        },
        {
          id: '2',
          title: 'Poetry Workshop Series',
          url: 'https://workshops.infinitebloom.com',
          description: 'Interactive online poetry workshops',
          category: 'education',
          is_active: true,
          sort_order: 2
        }
      ]
      
      const podcastMockData: PodcastInfo[] = [
        {
          id: '1',
          title: 'Infinite Conversations',
          description: 'Deep conversations about poetry, mindfulness, and personal growth',
          platform: 'spotify',
          url: 'https://open.spotify.com/show/infiniteconversations',
          episode_count: 24,
          is_active: true
        },
        {
          id: '2',
          title: 'Poetry & Peace',
          description: 'Weekly guided meditations through poetry',
          platform: 'apple',
          url: 'https://podcasts.apple.com/poetryandpeace',
          episode_count: 18,
          is_active: true
        }
      ]
      
      const contactMockData = {
        business_email: 'hello@infinitebloom.com',
        support_email: 'support@infinitebloom.com',
        phone: '+1-555-POETRY',
        address: 'San Francisco, CA',
        business_hours: 'Mon-Fri 9AM-5PM PST',
        contact_form_enabled: true,
        auto_reply_message: 'Thank you for reaching out! I\'ll get back to you within 24 hours.'
      }
      
      const seoMockData = {
        site_title: 'Infinite Bloom - Poetry for the Soul',
        site_description: 'A transformative digital poetry collection with 45 curated poems, audio companions, and mindful insights.',
        keywords: 'poetry, mindfulness, meditation, digital book, spiritual growth',
        og_image: 'https://infinitebloom.com/og-image.jpg',
        twitter_handle: '@infinitebloom',
        google_analytics_id: 'GA-XXXXXX-X',
        facebook_pixel_id: ''
      }
      
      setDonationLinks(donationMockData)
      setExternalLinks(externalMockData)
      setPodcastInfo(podcastMockData)
      setContactInfo(contactMockData)
      setSeoInfo(seoMockData)
      
      toast.success('Additional content loaded successfully')
    } catch (error) {
      console.error('Error loading additional content:', error)
      toast.error('Failed to load additional content')
    } finally {
      setLoading(false)
    }
  }

  const addDonationLink = () => {
    if (!newDonation.name.trim() || !newDonation.url.trim()) {
      toast.error('Please enter name and URL')
      return
    }
    
    const donation: DonationLink = {
      id: Date.now().toString(),
      platform: newDonation.platform,
      name: newDonation.name.trim(),
      url: newDonation.url.trim(),
      description: newDonation.description.trim(),
      is_active: true,
      sort_order: donationLinks.length + 1
    }
    
    setDonationLinks(prev => [...prev, donation])
    setNewDonation({ platform: 'paypal', name: '', url: '', description: '' })
    toast.success('Donation link added')
  }

  const removeDonationLink = (id: string) => {
    setDonationLinks(prev => prev.filter(link => link.id !== id))
    toast.success('Donation link removed')
  }

  const toggleDonationLink = (id: string) => {
    setDonationLinks(prev => 
      prev.map(link => 
        link.id === id ? { ...link, is_active: !link.is_active } : link
      )
    )
  }

  const addExternalLink = () => {
    if (!newExternalLink.title.trim() || !newExternalLink.url.trim()) {
      toast.error('Please enter title and URL')
      return
    }
    
    const link: ExternalLink = {
      id: Date.now().toString(),
      title: newExternalLink.title.trim(),
      url: newExternalLink.url.trim(),
      description: newExternalLink.description.trim(),
      category: newExternalLink.category,
      is_active: true,
      sort_order: externalLinks.length + 1
    }
    
    setExternalLinks(prev => [...prev, link])
    setNewExternalLink({ title: '', url: '', description: '', category: 'general' })
    toast.success('External link added')
  }

  const removeExternalLink = (id: string) => {
    setExternalLinks(prev => prev.filter(link => link.id !== id))
    toast.success('External link removed')
  }

  const addPodcast = () => {
    if (!newPodcast.title.trim() || !newPodcast.url.trim()) {
      toast.error('Please enter title and URL')
      return
    }
    
    const podcast: PodcastInfo = {
      id: Date.now().toString(),
      title: newPodcast.title.trim(),
      description: newPodcast.description.trim(),
      platform: newPodcast.platform,
      url: newPodcast.url.trim(),
      episode_count: newPodcast.episode_count,
      is_active: true
    }
    
    setPodcastInfo(prev => [...prev, podcast])
    setNewPodcast({ title: '', description: '', platform: 'spotify', url: '', episode_count: 0 })
    toast.success('Podcast added')
  }

  const removePodcast = (id: string) => {
    setPodcastInfo(prev => prev.filter(podcast => podcast.id !== id))
    toast.success('Podcast removed')
  }

  const saveContactInfo = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Contact information saved successfully')
    } catch (error) {
      console.error('Error saving contact info:', error)
      toast.error('Failed to save contact information')
    } finally {
      setSaving(false)
    }
  }

  const saveSeoInfo = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('SEO information saved successfully')
    } catch (error) {
      console.error('Error saving SEO info:', error)
      toast.error('Failed to save SEO information')
    } finally {
      setSaving(false)
    }
  }

  const getDonationIcon = (platform: string) => {
    switch (platform) {
      case 'paypal': return '💳'
      case 'ko-fi': return '☕'
      case 'patreon': return '🎨'
      case 'venmo': return '💸'
      default: return '❤️'
    }
  }

  const getPodcastIcon = (platform: string) => {
    switch (platform) {
      case 'spotify': return '🎵'
      case 'apple': return '🍎'
      case 'google': return '🎧'
      case 'anchor': return '⚓'
      default: return '📻'
    }
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
          <h2 className="text-2xl font-semibold">Additional Content Management</h2>
          <p className="text-muted-foreground">Manage donations, external links, podcasts, and site settings</p>
        </div>
        <Button onClick={loadAdditionalContent} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="donations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="donations" className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Donations</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Contact Info</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Donation Links */}
        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Donation Links
              </CardTitle>
              <CardDescription>
                Manage donation platforms and support links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new donation link */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Add New Donation Link</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Select 
                    value={newDonation.platform} 
                    onValueChange={(value) => setNewDonation(prev => ({ ...prev, platform: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">💳 PayPal</SelectItem>
                      <SelectItem value="ko-fi">☕ Ko-fi</SelectItem>
                      <SelectItem value="patreon">🎨 Patreon</SelectItem>
                      <SelectItem value="venmo">💸 Venmo</SelectItem>
                      <SelectItem value="other">❤️ Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={newDonation.name}
                    onChange={(e) => setNewDonation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Display name..."
                  />
                </div>
                <Input
                  value={newDonation.url}
                  onChange={(e) => setNewDonation(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://paypal.me/username"
                />
                <Textarea
                  value={newDonation.description}
                  onChange={(e) => setNewDonation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={2}
                />
                <Button onClick={addDonationLink}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Donation Link
                </Button>
              </div>
              
              {/* Existing donation links */}
              <div className="space-y-3">
                {donationLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getDonationIcon(link.platform)}</span>
                      <div>
                        <div className="font-medium">{link.name}</div>
                        <div className="text-sm text-muted-foreground">{link.description}</div>
                        <div className="text-xs text-muted-foreground">{link.url}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={link.is_active}
                        onCheckedChange={() => toggleDonationLink(link.id)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeDonationLink(link.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* Contact Information */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Manage contact details and communication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  value={contactInfo.support_email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, support_email: e.target.value }))}
                  placeholder="support@yoursite.com"
                />
                <p className="text-xs text-muted-foreground">
                  This email will be used for all contact form submissions and user messages.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auto_reply">Auto-Reply Message</Label>
                <Textarea
                  id="auto_reply"
                  value={contactInfo.auto_reply_message}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, auto_reply_message: e.target.value }))}
                  placeholder="Thank you for reaching out..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={contactInfo.contact_form_enabled}
                  onCheckedChange={(checked) => setContactInfo(prev => ({ ...prev, contact_form_enabled: checked }))}
                />
                <Label>Enable contact form on website</Label>
              </div>
              
              <Button onClick={saveContactInfo} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Contact Info
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PWA Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                PWA Settings
              </CardTitle>
              <CardDescription>
                Progressive Web App metadata and SEO settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site_title">Site Title</Label>
                <Input
                  id="site_title"
                  value={seoInfo.site_title}
                  onChange={(e) => setSeoInfo(prev => ({ ...prev, site_title: e.target.value }))}
                  placeholder="Your Site Title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={seoInfo.site_description}
                  onChange={(e) => setSeoInfo(prev => ({ ...prev, site_description: e.target.value }))}
                  placeholder="Brief description of your site..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={seoInfo.keywords}
                  onChange={(e) => setSeoInfo(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="poetry, mindfulness, meditation, ebook"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="og_image">Open Graph Image URL</Label>
                  <Input
                    id="og_image"
                    value={seoInfo.og_image}
                    onChange={(e) => setSeoInfo(prev => ({ ...prev, og_image: e.target.value }))}
                    placeholder="https://yoursite.com/og-image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter_handle">Twitter Handle</Label>
                  <Input
                    id="twitter_handle"
                    value={seoInfo.twitter_handle}
                    onChange={(e) => setSeoInfo(prev => ({ ...prev, twitter_handle: e.target.value }))}
                    placeholder="@yourusername"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics">Google Analytics ID</Label>
                  <Input
                    id="google_analytics"
                    value={seoInfo.google_analytics_id}
                    onChange={(e) => setSeoInfo(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                    placeholder="GA-XXXXXX-X"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebook_pixel">Facebook Pixel ID</Label>
                  <Input
                    id="facebook_pixel"
                    value={seoInfo.facebook_pixel_id}
                    onChange={(e) => setSeoInfo(prev => ({ ...prev, facebook_pixel_id: e.target.value }))}
                    placeholder="1234567890"
                  />
                </div>
              </div>
              
              <Button onClick={saveSeoInfo} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save PWA Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}