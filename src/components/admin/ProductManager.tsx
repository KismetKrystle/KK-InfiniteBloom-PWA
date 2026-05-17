import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { supabase } from '../../lib/supabase'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  DollarSign, 
  Eye, 
  EyeOff,
  Image,
  Link,
  ShoppingCart,
  Star,
  RefreshCw
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

export default function ProductManager() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  useEffect(() => {
    loadProducts()
    
    // Listen for storage changes to reload products when updated from detail page
    const handleStorageChange = () => {
      loadProducts()
    }
    
    // Also listen for focus to reload when coming back from detail page
    const handleFocus = () => {
      loadProducts()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Check if we have updated products in localStorage first
      const storedProducts = localStorage.getItem('adminProducts')
      
      let mockProducts: Product[] = [
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

      if (storedProducts) {
        try {
          mockProducts = JSON.parse(storedProducts)
        } catch (e) {
          console.error('Error parsing stored products:', e)
        }
      } else {
        // Store initial mock data
        localStorage.setItem('adminProducts', JSON.stringify(mockProducts))
      }
      
      setProducts(mockProducts)
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
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

      if (editingProduct) {
        // Update existing product
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id ? { ...p, ...productData } : p
        )
        setProducts(updatedProducts)
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
        toast.success('Product updated successfully')
      } else {
        // Create new product
        const newProduct: Product = {
          id: Date.now().toString(),
          ...productData,
          created_at: new Date().toISOString()
        }
        const updatedProducts = [newProduct, ...products]
        setProducts(updatedProducts)
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
        toast.success('Product created successfully')
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const updatedProducts = products.filter(p => p.id !== id)
      setProducts(updatedProducts)
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const toggleProductStatus = async (id: string, is_active: boolean) => {
    try {
      const updatedProducts = products.map(p => 
        p.id === id ? { ...p, is_active, updated_at: new Date().toISOString() } : p
      )
      setProducts(updatedProducts)
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
      toast.success(`Product ${is_active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.error('Failed to update product status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      currency: 'USD',
      image_url: '',
      video_url: '',
      media_gallery: [],
      external_link: '',
      button_text: 'Buy Now',
      is_active: true,
      category: 'ebook',
      sort_order: 1
    })
    setEditingProduct(null)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.original_price || 0,
      currency: product.currency,
      image_url: product.image_url || '',
      video_url: product.video_url || '',
      media_gallery: product.media_gallery || [],
      external_link: product.external_link,
      button_text: product.button_text,
      is_active: product.is_active,
      category: product.category,
      sort_order: product.sort_order
    })
    setIsDialogOpen(true)
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Product Management</h2>
          <p className="text-muted-foreground">Manage your digital and physical products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadProducts} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update product information' : 'Create a new product listing'}
                </DialogDescription>
              </DialogHeader>
              
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
                  rows={3}
                />
              </div>
              
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
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Product Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          setFormData(prev => ({ ...prev, image_url: URL.createObjectURL(e.target.files[0]) }))
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Or use URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/product-image.jpg"
                    />
                  </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active" className="text-sm">Active</Label>
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
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveProduct} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      {editingProduct ? 'Update' : 'Create'} Product
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            Manage your product catalog and external purchase links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
              <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((product) => (
                    <TableRow 
                      key={product.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/admin/product/${product.id}`)}
                    >
                      <TableCell>
                        <div className="w-16 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{getCategoryIcon(product.category)}</span>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            {!product.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatPrice(product.price, product.currency)}
                          </div>
                          {product.original_price && product.original_price > product.price && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.original_price, product.currency)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/admin/product/${product.id}`)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}