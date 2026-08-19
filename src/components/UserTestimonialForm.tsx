import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Star, Send, Heart, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UserTestimonialFormProps {
  userEmail: string
  userName: string
  open: boolean
  onClose: () => void
}

export default function UserTestimonialForm({ userEmail, userName, open, onClose }: UserTestimonialFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: userName || '',
    role: '',
    text: '',
    rating: 5,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.text) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: formData.name,
          authorTitle: formData.role,
          content: formData.text,
          rating: formData.rating,
        }),
      })
      if (!res.ok) throw new Error('Failed')

      setIsSubmitted(true)
      toast.success('Thank you! Your testimonial has been submitted for review.')
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      toast.error('Failed to submit testimonial. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }))
  }

  function handleClose() {
    onClose()
    // Reset after the close animation, so the form doesn't visibly reset mid-close.
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: userName || '', role: '', text: '', rating: 5 })
    }, 300)
  }

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thank You!</DialogTitle>
            <DialogDescription>
              Your testimonial has been successfully submitted
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
            <p className="text-muted-foreground mb-4">
              We appreciate you taking the time to share your experience with Infinite Bloom.
            </p>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Share Your Infinite Bloom Experience
          </DialogTitle>
          <DialogDescription>
            Your feedback helps others discover the transformative power of this collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role/Title</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Teacher, Student, Writer"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground -mt-2">Posting as {userEmail}</p>

          <div className="space-y-2">
            <Label>How would you rate your experience?</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange(rating)}
                  className="transition-colors hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {formData.rating} out of 5 stars
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial">
              Your Experience <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="testimonial"
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value.slice(0, 500) }))}
              placeholder="Share how Infinite Bloom has impacted your life, practice, or perspective..."
              rows={5}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.text.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Testimonial
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
