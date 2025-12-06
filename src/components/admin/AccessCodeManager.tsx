import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { supabase, AccessCode } from '../../lib/supabase'
import { Plus, Copy, Trash2, RefreshCw, Key, QrCode, ExternalLink, Phone, User, StickyNote, Smartphone } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export default function AccessCodeManager() {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [qrManagementUrl, setQrManagementUrl] = useState('https://example.com/qr-management')
  
  const [newCodeData, setNewCodeData] = useState({
    email: '',
    name: '',
    phone: '',
    deviceLimit: 2,
    note: ''
  })

  useEffect(() => {
    loadAccessCodes()
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'admin_settings')
        .eq('key', 'qr_management_url')
        .single()

      if (data && !error) {
        setQrManagementUrl(data.value)
      }
    } catch (error) {
      console.log('No QR management URL saved yet')
    }
  }



  const loadAccessCodes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('is_manual', true)  // Only show manually created codes
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Mock mode: Using sample access codes')
        setAccessCodes([])
        return
      }
      
      // Filter to only show manually created codes
      const manualCodes = (data || []).filter(code => code.is_manual === true)
      setAccessCodes(manualCodes)
    } catch (error) {
      console.error('Error loading access codes:', error)
      // Don't show error toast in demo mode
      setAccessCodes([])
    } finally {
      setLoading(false)
    }
  }

  const generateAccessCode = async () => {
    if (!newCodeData.email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!newCodeData.name.trim()) {
      toast.error('Please enter a name')
      return
    }

    setGenerating(true)
    try {
      // Generate a unique 8-character code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const accessCodeData = {
        code,
        email: newCodeData.email.trim(),
        name: newCodeData.name.trim(),
        phone: newCodeData.phone.trim() || null,
        device_limit: newCodeData.deviceLimit,
        note: newCodeData.note.trim() || null,
        is_used: false,
        is_manual: true,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('access_codes')
        .insert(accessCodeData)
        .select()
        .single()

      if (error) {
        console.log('Mock mode: Adding access code to local state')
        // In mock mode, add the code to local state
        const mockData = { ...accessCodeData, id: `mock-${Date.now()}` }
        setAccessCodes(prev => [mockData, ...prev])
      } else {
        setAccessCodes(prev => [data, ...prev])
      }

      setNewCodeData({
        email: '',
        name: '',
        phone: '',
        deviceLimit: 2,
        note: ''
      })
      setIsDialogOpen(false)
      toast.success(`Access code ${code} generated for ${newCodeData.name}`)
    } catch (error) {
      console.error('Error generating access code:', error)
      toast.error('Failed to generate access code')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const deleteAccessCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('access_codes')
        .delete()
        .eq('id', id)

      // Always update local state, even in mock mode
      setAccessCodes(prev => prev.filter(code => code.id !== id))
      toast.success('Access code deleted')
    } catch (error) {
      console.error('Error deleting access code:', error)
      toast.error('Failed to delete access code')
    }
  }

  const openQrManagement = () => {
    if (qrManagementUrl && qrManagementUrl.startsWith('http')) {
      window.open(qrManagementUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    } else {
      toast.error('Please configure a valid QR Management URL first')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhone = (phone: string) => {
    if (!phone) return '-'
    // Simple phone formatting
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
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
          <h2 className="text-2xl font-semibold">Access Code Management</h2>
          <p className="text-muted-foreground">Generate and manage user access codes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <Button variant="outline" onClick={openQrManagement}>
            <QrCode className="w-4 h-4 mr-2" />
            Manage QR Codes
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
          
          <Button onClick={loadAccessCodes} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Generate New Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Generate New Access Code
          </CardTitle>
          <CardDescription>
            Create a new access code with custom settings for a specific user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Access Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Access Code</DialogTitle>
                <DialogDescription>
                  Fill in the user details and access parameters
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newCodeData.name}
                    onChange={(e) => setNewCodeData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCodeData.email}
                    onChange={(e) => setNewCodeData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newCodeData.phone}
                    onChange={(e) => setNewCodeData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-555-0123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deviceLimit">Device Limit</Label>
                  <Select 
                    value={newCodeData.deviceLimit.toString()} 
                    onValueChange={(value) => setNewCodeData(prev => ({ ...prev, deviceLimit: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Device</SelectItem>
                      <SelectItem value="2">2 Devices</SelectItem>
                      <SelectItem value="3">3 Devices</SelectItem>
                      <SelectItem value="5">5 Devices</SelectItem>
                      <SelectItem value="10">10 Devices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Notes</Label>
                <Textarea
                  id="note"
                  value={newCodeData.note}
                  onChange={(e) => setNewCodeData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Add any notes about this user or access code..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateAccessCode} disabled={generating}>
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Code
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Access Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Access Codes</CardTitle>
          <CardDescription>
            All manually created access codes and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accessCodes.length === 0 ? (
            <Alert>
              <AlertDescription>
                No access codes generated yet. Create your first access code above.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>User Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Devices</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessCodes.map((accessCode, index) => (
                    <TableRow key={accessCode.id}>
                      <TableCell className="w-12">
                        <span className="text-sm text-muted-foreground font-medium">{index + 1}</span>
                      </TableCell>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{accessCode.code}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(accessCode.code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{accessCode.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{accessCode.email}</div>
                          {accessCode.note && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <StickyNote className="w-3 h-3" />
                              <span className="truncate max-w-32">{accessCode.note}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{formatPhone(accessCode.phone || '')}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="outline">
                            {accessCode.device_limit} {accessCode.device_limit === 1 ? 'Device' : 'Devices'}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={accessCode.is_used ? "secondary" : "default"}
                          className={accessCode.is_used ? 
                            "bg-green-100 text-green-800" : 
                            "bg-blue-100 text-blue-800"
                          }
                        >
                          {accessCode.is_used ? 'Used' : 'Available'}
                        </Badge>
                        {accessCode.used_by && (
                          <div className="text-xs text-muted-foreground mt-1">
                            by {accessCode.used_by}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {formatDate(accessCode.created_at)}
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAccessCode(accessCode.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
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