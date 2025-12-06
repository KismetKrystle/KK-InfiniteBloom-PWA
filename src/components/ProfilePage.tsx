import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Check, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Laptop,
  ShoppingBag,
  Crown
} from 'lucide-react';

interface ProfilePageProps {
  setUser: (user: any) => void;
}

export default function ProfilePage({ setUser }: ProfilePageProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [mockUser, setMockUser] = useState({
    name: 'Demo User',
    email: 'user@example.com',
    joinDate: '2024-01-15',
    devices: [
      { id: 1, name: 'iPhone 15', type: 'mobile', lastAccess: '2024-01-20', active: true },
      { id: 2, name: 'MacBook Pro', type: 'desktop', lastAccess: '2024-01-19', active: false }
    ],
    purchases: [
      { id: 1, item: 'Digital Edition', date: '2024-01-15', amount: '$29', status: 'Active' },
      { id: 2, item: 'Premium Bundle', date: '2024-01-20', amount: '$49', status: 'Active' }
    ],
    accessLevel: 'Premium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (profileData.password !== profileData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (profileData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Mock profile creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep(2);
    setSuccess('Profile created successfully! Confirmation email sent.');
    setLoading(false);
  };

  const confirmEmail = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser = {
      name: profileData.name,
      email: profileData.email,
      confirmed: true
    };
    
    setUser(newUser);
    setSuccess('Email confirmed! Redirecting to flipbook...');
    setTimeout(() => navigate('/flipbook'), 2000);
    setLoading(false);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/access')}
            className="mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Access
          </Button>

          <Card className="shadow-xl border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Your Profile</CardTitle>
              <p className="text-muted-foreground">
                Set up your account to access Infinite Bloom
              </p>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert className="mb-6 border-destructive/50 text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={profileData.password}
                      onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  <h4 className="font-medium mb-2">Account Benefits:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Access on up to 2 devices</li>
                    <li>• Sync reading progress</li>
                    <li>• Personal bookmarks</li>
                    <li>• Future content updates</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Profile...' : 'Create Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <p className="text-muted-foreground">
                We've sent a confirmation email to {profileData.email}
              </p>
            </CardHeader>
            
            <CardContent className="text-center space-y-6">
              {success && (
                <Alert className="border-green-500/50 text-green-600">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the confirmation link in the email to activate your account and access the flipbook.
                </p>
                
                <Button onClick={confirmEmail} className="w-full" disabled={loading}>
                  {loading ? 'Confirming...' : 'I\'ve Confirmed My Email'}
                </Button>
                
                <Button variant="outline" className="w-full">
                  Resend Confirmation Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard view (if user comes back to profile page later)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/flipbook')}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Flipbook
          </Button>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            {mockUser.accessLevel}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="font-medium">{mockUser.name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="font-medium">{mockUser.email}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Member Since</Label>
                <p className="font-medium">{mockUser.joinDate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Device Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Device Access (2/2 used)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUser.devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {device.type === 'mobile' ? (
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Laptop className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last access: {device.lastAccess}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={device.active ? "default" : "secondary"}>
                        {device.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Purchase History */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUser.purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{purchase.item}</p>
                        <p className="text-sm text-muted-foreground">
                          Purchased on {purchase.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{purchase.amount}</span>
                      <Badge className="bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        {purchase.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}