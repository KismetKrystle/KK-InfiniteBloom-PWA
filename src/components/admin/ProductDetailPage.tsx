import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Separator } from '../ui/separator'
import { 
  ArrowLeft, 
  Package, 
  Save, 
  RefreshCw, 
  ExternalLink, 
  Star,
  Eye,
  EyeOff,
  DollarSign,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  currency: string
  image_url?: string
  video_url?: string
  media_gallery?: string[]
  external_link: string
  button_text: string
  is_active: boolean
  sort_order: number
  category: string
  created_at: string
  updated_at: string
}

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    currency: 'USD',
    image_url: '',
    video_url: '',
    media_gallery: [] as string[],
    external_link: '',
    button_text: 'Buy Now',
    is_active: true,
    category: 'ebook',
    sort_order: 1
  })

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    setLoading(true)
    try {
      // Mock data - in real implementation, this would load from database
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Infinite Bloom - Digital Edition',
          description: 'A transformative journey through 45 carefully curated poems with audio companions and interactive insights.',
          price: 29.99,
          original_price: 39.99,
          currency: 'USD',
          image_url: 'https://images.unsplash.com/photo-1755545730104-3cb4545282b1?w=400&h=300&fit=crop',
          video_url: '',
          media_gallery: ['https://images.unsplash.com/photo-1755545730104-3cb4545282b1?w=400&h=300&fit=crop'],
          external_link: 'https://gumroad.com/infinite-bloom-digital',
          button_text: 'Get Digital Edition',
          is_active: true,
          sort_order: 1,
          category: 'ebook',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Infinite Bloom - Premium Bundle',
          description: 'Complete package including digital book, exclusive audio meditations, and bonus reflection journal.',
          price: 49.99,
          original_price: 69.99,
          currency: 'USD',
          image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
          video_url: '',
          media_gallery: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop'],
          external_link: 'https://gumroad.com/infinite-bloom-premium',
          button_text: 'Get Premium Bundle',
          is_active: true,
          sort_order: 2,
          category: 'bundle',
          created_at: '2024-01-10T15:30:00Z',
          updated_at: '2024-01-10T15:30:00Z'
        },
        {
          id: '3',
          name: 'Printed Edition - Hardcover',
          description: 'Beautiful hardcover edition with premium paper and elegant typography. Perfect for gift-giving.',
          price: 34.99,
          currency: 'USD',
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
          video_url: '',
          media_gallery: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop'],
          external_link: 'https://amazon.com/infinite-bloom-hardcover',
          button_text: 'Order on Amazon',
          is_active: true,
          sort_order: 3,
          category: 'physical',
          created_at: '2024-01-05T12:00:00Z',
          updated_at: '2024-01-05T12:00:00Z'
        }
      ]
      
      const foundProduct = mockProducts.find(p => p.id === productId)
      
      if (foundProduct) {
        setProduct(foundProduct)
        setFormData({
          name: foundProduct.name,
          description: foundProduct.description,
          price: foundProduct.price,
          original_price: foundProduct.original_price || 0,
          currency: foundProduct.currency,
          image_url: foundProduct.image_url || '',
          video_url: foundProduct.video_url || '',
          media_gallery: foundProduct.media_gallery || [],
          external_link: foundProduct.external_link,
          button_text: foundProduct.button_text,
          is_active: foundProduct.is_active,
          category: foundProduct.category,
          sort_order: foundProduct.sort_order
        })
      } else {
        toast.error('Product not found')
        navigate('/admin', { state: { activeTab: 'content', activeSubTab: 'products' } })
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error('Failed to load product')
      navigate('/', { state: { activeTab: 'content', activeSubTab: 'products' } })
    } finally {
      setLoading(false)
    }
  }

  const saveProduct = async () => {
    if (!formData.name.trim() || !formData.external_link.trim()) {
      toast.error('Name and external link are required')
      return
    }

    setSaving(true)
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price.toString()),
        original_price: formData.original_price ? parseFloat(formData.original_price.toString()) : null,
        updated_at: new Date().toISOString()
      }

      // In real implementation, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProduct(prev => prev ? { ...prev, ...productData } : null)
      toast.success('Product updated successfully')
      
      // Store updated product in localStorage to share with ProductManager
      const storedProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
      const updatedProducts = storedProducts.map((p: Product) => 
        p.id === productId ? { ...p, ...productData } : p
      )
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const addMediaToGallery = (url: string) => {
    if (url && !formData.media_gallery.includes(url)) {
      setFormData(prev => ({
        ...prev,
        media_gallery: [...prev.media_gallery, url]
      }))
    }
  }

  const removeMediaFromGallery = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media_gallery: prev.media_gallery.filter((_, i) => i !== index)
    }))
  }

  const getAllMedia = () => {
    const media = []
    if (formData.video_url) media.push({ type: 'video', url: formData.video_url })
    if (formData.image_url) media.push({ type: 'image', url: formData.image_url })
    formData.media_gallery.forEach(url => {
      if (url !== formData.image_url) {
        media.push({ type: 'image', url })
      }
    })
    return media
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ebook': return 'ðŸ“±'
      case 'bundle': return 'ðŸ“¦'
      case 'physical': return 'ðŸ“š'
      case 'audio': return 'ðŸŽ§'
      default: return 'ðŸ“„'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Product not found</p>
          <Button onClick={() => navigate('/', { state: { activeTab: 'content', activeSubTab: 'products' } })} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  const allMedia = getAllMedia()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  // Navigate back to admin dashboard and set the active tab to content/products
                  navigate('/', { state: { activeTab: 'content', activeSubTab: 'products' } })
                }}
                className="group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back to Products</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="hidden sm:flex items-center space-x-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="font-medium">Product Details</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(product.external_link, '_blank')}
                className="hidden md:flex"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Product
              </Button>
              <Button onClick={saveProduct} disabled={saving} size="sm">
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Product Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Product Preview
                </CardTitle>
                <CardDescription>
                  How this product appears to customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Media Gallery or Single Image */}
                {allMedia.length > 0 && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                    {allMedia.length === 1 ? (
                      // Single media item
                      allMedia[0].type === 'video' ? (
                        <video 
                          src={allMedia[0].url} 
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img 
                          src={allMedia[0].url} 
                          alt={formData.name}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      // Media gallery with navigation
                      <div className="relative w-full h-full">
                        {allMedia[currentMediaIndex].type === 'video' ? (
                          <video 
                            src={allMedia[currentMediaIndex].url} 
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img 
                            src={allMedia[currentMediaIndex].url} 
                            alt={formData.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Navigation buttons */}
                        {allMedia.length > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80"
                              onClick={() => setCurrentMediaIndex(prev => 
                                prev === 0 ? allMedia.length - 1 : prev - 1
                              )}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80"
                              onClick={() => setCurrentMediaIndex(prev => 
                                prev === allMedia.length - 1 ? 0 : prev + 1
                              )}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                            
                            {/* Media indicator dots */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {allMedia.map((_, index) => (
                                <button
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                                  }`}
                                  onClick={() => setCurrentMediaIndex(index)}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      <span className="mr-1">{getCategoryIcon(formData.category)}</span>
                      {formData.category}
                    </Badge>
                    <Badge variant={formData.is_active ? "default" : "secondary"}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg">{formData.name}</h3>
                  <p className="text-sm text-muted-foreground">{formData.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {formatPrice(formData.price, formData.currency)}
                    </span>
                    {formData.original_price && formData.original_price > formData.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(formData.original_price, formData.currency)}
                      </span>
                    )}
                  </div>
                  
                  <Button className="w-full" disabled>
                    {formData.button_text}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential product details and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Infinite Bloom - Digital Edition"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ebook">ðŸ“± Digital/eBook</SelectItem>
                        <SelectItem value="bundle">ðŸ“¦ Bundle</SelectItem>
                        <SelectItem value="physical">ðŸ“š Physical Book</SelectItem>
                        <SelectItem value="audio">ðŸŽ§ Audio</SelectItem>
                        <SelectItem value="other">ðŸ“„ Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the product..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing
                </CardTitle>
                <CardDescription>
                  Set product pricing and currency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="29.99"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="original_price">Original Price (optional)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="39.99"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (â‚¬)</SelectItem>
                        <SelectItem value="GBP">GBP (Â£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media & Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Media & Links
                </CardTitle>
                <CardDescription>
                  Product media and purchase link configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Upload */}
                <div className="space-y-2">
                  <Label htmlFor="video_url">Product Video (optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Upload Video File</Label>
                      <Input
                        type="file"
                        accept="video/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          // File upload handling would go here
                          if (e.target.files?.[0]) {
                            setFormData(prev => ({ ...prev, video_url: URL.createObjectURL(e.target.files[0]) }))
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Or use Video URL</Label>
                      <Input
                        id="video_url"
                        value={formData.video_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                        placeholder="https://example.com/product-video.mp4"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image_url">Product Image</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Upload Image File</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFormData(prev => ({ ...prev, image_url: URL.createObjectURL(e.target.files[0]) }))
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Or use Image URL</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://example.com/product-image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Gallery Images */}
                <div className="space-y-2">
                  <Label>Additional Gallery Images</Label>
                  <div className="space-y-2">
                    {formData.media_gallery.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const newGallery = [...formData.media_gallery]
                            newGallery[index] = e.target.value
                            setFormData(prev => ({ ...prev, media_gallery: newGallery }))
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMediaFromGallery(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addMediaToGallery('')}
                    >
                      Add Gallery Image
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="external_link">
                      Purchase Link <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="external_link"
                      value={formData.external_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                      placeholder="https://gumroad.com/your-product"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="button_text">Button Text</Label>
                    <Input
                      id="button_text"
                      value={formData.button_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                      placeholder="Buy Now"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
                <CardDescription>
                  Visibility and display options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <div>
                      <Label htmlFor="is_active" className="font-medium">Active</Label>
                      <p className="text-xs text-muted-foreground">Product visible to customers</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Product ID</Label>
                    <p className="font-mono">{product.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p>{new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p>{new Date(product.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}