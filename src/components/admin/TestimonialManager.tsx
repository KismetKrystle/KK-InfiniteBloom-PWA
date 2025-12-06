import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { Alert, AlertDescription } from '../ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Clock,
  User,
  Quote
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  rating: number
  image?: string
  isPublic: boolean
  isApproved: boolean
  isUserSubmitted: boolean
  submittedAt: string
  approvedAt?: string
  email?: string
}

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'manual'>('all')

  // Mock data for demo - replace with real database calls
  const mockTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Meditation Teacher',
      text: 'Infinite Bloom has transformed my daily practice. Each poem opens doorways to deeper understanding and inner peace.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=faces',
      isPublic: true,
      isApproved: true,
      isUserSubmitted: false,
      submittedAt: '2024-01-15T10:00:00Z',
      approvedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      role: 'Life Coach',
      text: 'The audio companions bring these poems to life. It\'s like having a personal guide through the landscape of consciousness.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      isPublic: true,
      isApproved: true,
      isUserSubmitted: false,
      submittedAt: '2024-01-16T10:00:00Z',
      approvedAt: '2024-01-16T10:00:00Z'
    },
    {
      id: '3',
      name: 'Jennifer Williams',
      role: 'Student',
      text: 'This collection has been a constant companion during my studies. The insights help me reflect and grow.',
      rating: 5,
      isPublic: false,
      isApproved: false,
      isUserSubmitted: true,
      submittedAt: '2024-01-20T15:30:00Z',
      email: 'jennifer@example.com'
    },
    {
      id: '4',
      name: 'Robert Thompson',
      role: 'Writer',
      text: 'Incredible depth and beautiful presentation. A must-read for anyone interested in mindful literature.',
      rating: 4,
      isPublic: false,
      isApproved: false,
      isUserSubmitted: true,
      submittedAt: '2024-01-21T09:15:00Z',
      email: 'robert@example.com'
    }
  ]

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    setLoading(true)
    try {
      // Replace with actual database call
      setTimeout(() => {
        setTestimonials(mockTestimonials)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading testimonials:', error)
      toast.error('Failed to load testimonials')
      setLoading(false)
    }
  }

  const saveTestimonial = async (testimonial: Partial<Testimonial>) => {
    try {
      if (testimonial.id) {
        // Update existing testimonial
        setTestimonials(prev => 
          prev.map(t => t.id === testimonial.id ? { ...t, ...testimonial } : t)
        )
        toast.success('Testimonial updated successfully')
      } else {
        // Create new testimonial
        const newTestimonial: Testimonial = {
          id: Date.now().toString(),
          name: testimonial.name || '',
          role: testimonial.role || '',
          text: testimonial.text || '',
          rating: testimonial.rating || 5,
          image: testimonial.image,
          isPublic: testimonial.isPublic ?? true,
          isApproved: true,
          isUserSubmitted: false,
          submittedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString()
        }
        setTestimonials(prev => [newTestimonial, ...prev])
        toast.success('Testimonial created successfully')
      }
      setIsDialogOpen(false)
      setEditingTestimonial(null)
    } catch (error) {
      console.error('Error saving testimonial:', error)
      toast.error('Failed to save testimonial')
    }
  }

  const deleteTestimonial = async (id: string) => {
    try {
      setTestimonials(prev => prev.filter(t => t.id !== id))
      toast.success('Testimonial deleted successfully')
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast.error('Failed to delete testimonial')
    }
  }

  const togglePublicStatus = async (id: string, isPublic: boolean) => {
    try {
      setTestimonials(prev => 
        prev.map(t => t.id === id ? { ...t, isPublic } : t)
      )
      toast.success(`Testimonial ${isPublic ? 'published' : 'unpublished'}`)
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Failed to update testimonial')
    }
  }

  const approveTestimonial = async (id: string, approved: boolean) => {
    try {
      setTestimonials(prev => 
        prev.map(t => t.id === id ? { 
          ...t, 
          isApproved: approved,
          approvedAt: approved ? new Date().toISOString() : undefined
        } : t)
      )
      toast.success(`Testimonial ${approved ? 'approved' : 'rejected'}`)
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Failed to update testimonial')
    }
  }

  const filteredTestimonials = testimonials.filter(testimonial => {
    switch (filter) {
      case 'pending':
        return testimonial.isUserSubmitted && !testimonial.isApproved
      case 'approved':
        return testimonial.isApproved
      case 'manual':
        return !testimonial.isUserSubmitted
      default:
        return true
    }
  })

  const pendingCount = testimonials.filter(t => t.isUserSubmitted && !t.isApproved).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Testimonial Management</h2>
          <p className="text-muted-foreground">
            Manage customer testimonials and user submissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTestimonial(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </DialogTitle>
              <DialogDescription>
                Create or edit a testimonial that will appear on your site
              </DialogDescription>
            </DialogHeader>
            <TestimonialForm 
              testimonial={editingTestimonial}
              onSave={saveTestimonial}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter testimonials" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Testimonials</SelectItem>
            <SelectItem value="pending">
              Pending Approval {pendingCount > 0 && `(${pendingCount})`}
            </SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="manual">Manual (Admin Created)</SelectItem>
          </SelectContent>
        </Select>
        
        {pendingCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Quote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No testimonials found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                Add Your First Testimonial
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onEdit={(t) => {
                setEditingTestimonial(t)
                setIsDialogOpen(true)
              }}
              onDelete={deleteTestimonial}
              onTogglePublic={togglePublicStatus}
              onApprove={approveTestimonial}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Testimonial Form Component
function TestimonialForm({ 
  testimonial, 
  onSave, 
  onCancel 
}: { 
  testimonial: Testimonial | null
  onSave: (testimonial: Partial<Testimonial>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || '',
    role: testimonial?.role || '',
    text: testimonial?.text || '',
    rating: testimonial?.rating || 5,
    image: testimonial?.image || '',
    isPublic: testimonial?.isPublic ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.text) {
      toast.error('Name and testimonial text are required')
      return
    }
    onSave({ ...testimonial, ...formData })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Customer name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role/Title</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            placeholder="e.g., Life Coach, Student"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text">Testimonial Text *</Label>
        <Textarea
          id="text"
          value={formData.text}
          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Enter the testimonial text..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Select value={formData.rating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(rating => (
                <SelectItem key={rating} value={rating.toString()}>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span>{rating} Star{rating !== 1 ? 's' : ''}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Profile Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            placeholder="https://example.com/profile.jpg"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
        />
        <Label htmlFor="isPublic">Make this testimonial public</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {testimonial ? 'Update' : 'Create'} Testimonial
        </Button>
      </div>
    </form>
  )
}

// Testimonial Card Component
function TestimonialCard({ 
  testimonial, 
  onEdit, 
  onDelete, 
  onTogglePublic, 
  onApprove 
}: {
  testimonial: Testimonial
  onEdit: (testimonial: Testimonial) => void
  onDelete: (id: string) => void
  onTogglePublic: (id: string, isPublic: boolean) => void
  onApprove: (id: string, approved: boolean) => void
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {testimonial.image && (
              <img 
                src={testimonial.image} 
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{testimonial.name}</h3>
                {testimonial.isUserSubmitted && (
                  <Badge variant="secondary" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    User Submitted
                  </Badge>
                )}
              </div>
              {testimonial.role && (
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {testimonial.isUserSubmitted && !testimonial.isApproved && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(testimonial.id, true)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(testimonial.id, false)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTogglePublic(testimonial.id, !testimonial.isPublic)}
            >
              {testimonial.isPublic ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(testimonial)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(testimonial.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <blockquote className="text-sm leading-relaxed mb-4 pl-4 border-l-2 border-muted">
          "{testimonial.text}"
        </blockquote>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <Clock className="w-3 h-3 inline mr-1" />
              Submitted {new Date(testimonial.submittedAt).toLocaleDateString()}
            </span>
            {testimonial.approvedAt && (
              <span>
                <Check className="w-3 h-3 inline mr-1" />
                Approved {new Date(testimonial.approvedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {testimonial.isApproved ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Approved
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Pending
              </Badge>
            )}
            
            {testimonial.isPublic ? (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Public
              </Badge>
            ) : (
              <Badge variant="secondary">
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}