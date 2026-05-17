import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { Alert, AlertDescription } from '../ui/alert'
import { supabase } from '../../lib/supabase'
import { useIsMobile } from '../ui/use-mobile'
import { 
  Save, 
  RefreshCw, 
  User, 
  Quote, 
  Camera, 
  Globe, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Facebook,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Users,
  MessageCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface SocialLink {
  id: string
  platform: string
  url: string
  is_active: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  date: string
  is_featured: boolean
}

export default function AboutAuthorManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Author basic info
  const [authorInfo, setAuthorInfo] = useState({
    name: '',
    title: '',
    bio: '',
    short_bio: '',
    profile_image: '',
    location: '',
    email: '',
    website: ''
  })
  
  // Social media links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [newSocialLink, setNewSocialLink] = useState({ platform: 'x', url: '' })
  const [customPlatform, setCustomPlatform] = useState('')
  const [isCustomPlatform, setIsCustomPlatform] = useState(false)
  const [hiddenUrls, setHiddenUrls] = useState<Set<string>>(new Set())
  const isMobile = useIsMobile()
  
  // Achievements & milestones
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: '',
    is_featured: false
  })
  
  // Quote & testimonials
  const [authorQuote, setAuthorQuote] = useState({
    quote: '',
    context: '',
    is_active: true
  })
  
  // Booking information
  const [bookingInfo, setBookingInfo] = useState({
    is_available: true,
    booking_email: '',
    booking_form_url: '',
    services: [] as string[],
    introduction: '',
    availability_note: ''
  })

  useEffect(() => {
    loadAuthorData()
  }, [])

  const loadAuthorData = async () => {
    setLoading(true)
    try {
      // Load author information
      const authorMockData = {
        name: 'Sarah Johnson',
        title: 'Poet, Author & Mindfulness Teacher',
        bio: 'Sarah Johnson is a celebrated poet and mindfulness teacher with over 15 years of experience guiding individuals through transformative literary journeys. Her work has been featured in numerous publications and has touched the lives of thousands worldwide.',
        short_bio: 'Poet, author, and mindfulness teacher helping people find peace through poetry.',
        profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=faces',
        location: 'San Francisco, CA',
        email: 'hello@sarahjohnson.com',
        website: 'https://sarahjohnson.com'
      }
      
      const socialMockData: SocialLink[] = [
        { id: '1', platform: 'x', url: 'https://x.com/sarahjpoetry', is_active: true },
        { id: '2', platform: 'instagram', url: 'https://instagram.com/sarahjpoetry', is_active: true },
        { id: '3', platform: 'linkedin', url: 'https://linkedin.com/in/sarahjohnson', is_active: true },
        { id: '4', platform: 'youtube', url: 'https://youtube.com/@sarahjpoetry', is_active: false }
      ]
      
      const achievementsMockData: Achievement[] = [
        {
          id: '1',
          title: 'Published Author',
          description: 'Author of 3 published poetry collections',
          date: '2020-01-01',
          is_featured: true
        },
        {
          id: '2',
          title: 'Mindfulness Certification',
          description: 'Certified Mindfulness-Based Stress Reduction (MBSR) Teacher',
          date: '2018-06-15',
          is_featured: true
        },
        {
          id: '3',
          title: 'Poetry Award',
          description: 'Winner of the National Poetry Society Excellence Award',
          date: '2019-11-20',
          is_featured: false
        }
      ]
      
      const quoteMockData = {
        quote: 'Poetry is the language of the soul speaking to souls. Through words, we find the infinite blooming within us.',
        context: 'From her TEDx talk "The Healing Power of Poetry"',
        is_active: true
      }
      
      const bookingMockData = {
        is_available: true,
        booking_email: 'booking@sarahjohnson.com',
        booking_form_url: 'https://calendly.com/sarahjohnson',
        services: ['Speaking Engagements', 'Workshops', 'Poetry Readings'],
        introduction: 'I\'m available for speaking engagements, workshops, and poetry readings. Let\'s connect to discuss how we can bring mindfulness and poetry to your community.',
        availability_note: 'Currently booking 2-3 months in advance. Virtual and in-person options available.'
      }
      
      setAuthorInfo(authorMockData)
      setSocialLinks(socialMockData)
      setAchievements(achievementsMockData)
      setAuthorQuote(quoteMockData)
      setBookingInfo(bookingMockData)
      
      toast.success('Author data loaded successfully')
    } catch (error) {
      console.error('Error loading author data:', error)
      toast.error('Failed to load author data')
    } finally {
      setLoading(false)
    }
  }

  const saveAuthorInfo = async () => {
    setSaving(true)
    try {
      // In real implementation, save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Author information saved successfully')
    } catch (error) {
      console.error('Error saving author info:', error)
      toast.error('Failed to save author information')
    } finally {
      setSaving(false)
    }
  }

  const addSocialLink = () => {
    if (!newSocialLink.url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    if (isCustomPlatform && !customPlatform.trim()) {
      toast.error('Please enter a platform name')
      return
    }
    
    const link: SocialLink = {
      id: Date.now().toString(),
      platform: isCustomPlatform ? customPlatform.trim().toLowerCase() : newSocialLink.platform,
      url: newSocialLink.url.trim(),
      is_active: true
    }
    
    setSocialLinks(prev => [...prev, link])
    setNewSocialLink({ platform: 'x', url: '' })
    setCustomPlatform('')
    setIsCustomPlatform(false)
    toast.success('Social link added')
  }

  const removeSocialLink = (id: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id))
    toast.success('Social link removed')
  }

  const toggleSocialLink = (id: string) => {
    setSocialLinks(prev => 
      prev.map(link => 
        link.id === id ? { ...link, is_active: !link.is_active } : link
      )
    )
  }

  const toggleUrlVisibility = (id: string) => {
    setHiddenUrls(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const addAchievement = () => {
    if (!newAchievement.title.trim() || !newAchievement.date) {
      toast.error('Please enter title and date')
      return
    }
    
    const achievement: Achievement = {
      id: Date.now().toString(),
      title: newAchievement.title.trim(),
      description: newAchievement.description.trim(),
      date: newAchievement.date,
      is_featured: newAchievement.is_featured
    }
    
    setAchievements(prev => [...prev, achievement])
    setNewAchievement({ title: '', description: '', date: '', is_featured: false })
    toast.success('Achievement added')
  }

  const removeAchievement = (id: string) => {
    setAchievements(prev => prev.filter(achievement => achievement.id !== id))
    toast.success('Achievement removed')
  }

  const toggleAchievementFeatured = (id: string) => {
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === id ? { ...achievement, is_featured: !achievement.is_featured } : achievement
      )
    )
  }

  const saveQuote = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Author quote saved successfully')
    } catch (error) {
      console.error('Error saving quote:', error)
      toast.error('Failed to save quote')
    } finally {
      setSaving(false)
    }
  }

  const saveBookingInfo = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Booking information saved successfully')
    } catch (error) {
      console.error('Error saving booking info:', error)
      toast.error('Failed to save booking information')
    } finally {
      setSaving(false)
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'x':
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'instagram': return <Instagram className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      case 'youtube': return <Youtube className="w-4 h-4" />
      case 'facebook': return <Facebook className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
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
          <h2 className="text-2xl font-semibold">About Author Management</h2>
          <p className="text-muted-foreground">Manage author profile, biography, and achievements</p>
        </div>
        <Button onClick={loadAuthorData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Author Profile
              </CardTitle>
              <CardDescription>
                Basic author information and biography
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={authorInfo.name}
                    onChange={(e) => setAuthorInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Sarah Johnson"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={authorInfo.title}
                    onChange={(e) => setAuthorInfo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Poet, Author & Mindfulness Teacher"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={authorInfo.location}
                    onChange={(e) => setAuthorInfo(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="San Francisco, CA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={authorInfo.website}
                    onChange={(e) => setAuthorInfo(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="short_bio">Short Bio (for cards/previews)</Label>
                <Input
                  id="short_bio"
                  value={authorInfo.short_bio}
                  onChange={(e) => setAuthorInfo(prev => ({ ...prev, short_bio: e.target.value }))}
                  placeholder="Brief one-line description..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Full Biography</Label>
                <Textarea
                  id="bio"
                  value={authorInfo.bio}
                  onChange={(e) => setAuthorInfo(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Detailed biography..."
                  rows={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profile_image">Profile Image</Label>
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
                          setAuthorInfo(prev => ({ ...prev, profile_image: URL.createObjectURL(e.target.files[0]) }))
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Or use URL</Label>
                    <Input
                      id="profile_image"
                      value={authorInfo.profile_image}
                      onChange={(e) => setAuthorInfo(prev => ({ ...prev, profile_image: e.target.value }))}
                      placeholder="https://example.com/profile.jpg"
                    />
                  </div>
                </div>
                {authorInfo.profile_image && (
                  <img 
                    src={authorInfo.profile_image} 
                    alt="Profile preview"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                )}
              </div>
              
              <Button onClick={saveAuthorInfo} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Author Info
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Links */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Manage social media profiles and external links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new social link */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Add New Social Link</h4>
                <div className="space-y-3">
                  {isMobile ? (
                    // Mobile layout - stacked vertically
                    <div className="space-y-3">
                      {!isCustomPlatform ? (
                        <select 
                          value={newSocialLink.platform}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setIsCustomPlatform(true)
                            } else {
                              setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="x">X (Twitter)</option>
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="youtube">YouTube</option>
                          <option value="facebook">Facebook</option>
                          <option value="custom">+ Custom Platform</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={customPlatform}
                            onChange={(e) => setCustomPlatform(e.target.value)}
                            placeholder="Platform name (e.g., TikTok)"
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsCustomPlatform(false)
                              setCustomPlatform('')
                            }}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newSocialLink.url}
                          onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                          placeholder={isCustomPlatform ? "https://platform.com/username" : "https://x.com/username"}
                          className="flex-1"
                        />
                        <Button onClick={addSocialLink}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Desktop layout - horizontal
                    <div className="flex gap-2">
                      {!isCustomPlatform ? (
                        <select 
                          value={newSocialLink.platform}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setIsCustomPlatform(true)
                            } else {
                              setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))
                            }
                          }}
                          className="px-3 py-2 border rounded-md"
                        >
                          <option value="x">X (Twitter)</option>
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="youtube">YouTube</option>
                          <option value="facebook">Facebook</option>
                          <option value="custom">+ Custom Platform</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={customPlatform}
                            onChange={(e) => setCustomPlatform(e.target.value)}
                            placeholder="Platform name (e.g., TikTok)"
                            className="w-40"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsCustomPlatform(false)
                              setCustomPlatform('')
                            }}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      <Input
                        value={newSocialLink.url}
                        onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                        placeholder={isCustomPlatform ? "https://platform.com/username" : "https://x.com/username"}
                        className="flex-1"
                      />
                      <Button onClick={addSocialLink}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Existing social links */}
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <div key={link.id} className={`border rounded-lg p-3 ${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getSocialIcon(link.platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium capitalize">
                          {link.platform === 'x' ? 'X' : link.platform}
                        </div>
                        <div className={`text-sm text-muted-foreground ${hiddenUrls.has(link.id) ? 'hidden' : 'block'} ${isMobile ? 'break-all' : ''}`}>
                          {link.url}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${isMobile ? 'justify-between' : ''}`}>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={link.is_active}
                          onCheckedChange={() => toggleSocialLink(link.id)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleUrlVisibility(link.id)}
                          title={hiddenUrls.has(link.id) ? 'Show URL' : 'Hide URL'}
                        >
                          {hiddenUrls.has(link.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
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
                          onClick={() => removeSocialLink(link.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  )
}