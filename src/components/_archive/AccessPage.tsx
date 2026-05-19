import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Eye, EyeOff, ArrowLeft, Key, LogIn, ShoppingBag } from 'lucide-react';

interface AccessPageProps {
  user: any;
  setUser: (user: any) => void;
  hasAccessCode: boolean;
  setHasAccessCode: (hasCode: boolean) => void;
}

export default function AccessPage({ user, setUser, hasAccessCode, setHasAccessCode }: AccessPageProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [accessForm, setAccessForm] = useState({ code: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Mock login validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (loginForm.email === 'user@example.com' && loginForm.password === 'password123') {
      setUser({ email: loginForm.email, name: 'Demo User' });
      setSuccess('Login successful!');
      setTimeout(() => navigate('/flipbook'), 1500);
    } else {
      setError('Invalid email or password. Try: user@example.com / password123');
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    // Mock Google login - In production, this would integrate with Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful Google login
    setUser({ email: 'google.user@example.com', name: 'Google User' });
    setSuccess('Google login successful!');
    setTimeout(() => navigate('/flipbook'), 1500);
    
    setLoading(false);
  };

  const handleAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Mock access code validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (accessForm.code === 'BLOOM2024' || accessForm.code === 'POETRY123') {
      setHasAccessCode(true);
      setSuccess('Access code verified!');
      setTimeout(() => navigate('/profile'), 1500);
    } else {
      setError('Invalid access code. Try: BLOOM2024 or POETRY123');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/landing')}
          className="mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Access Infinite Bloom</CardTitle>
            <p className="text-muted-foreground">
              Welcome back! Please sign in to continue your journey.
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-6 border-green-500/50 text-green-600">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </TabsTrigger>
                <TabsTrigger value="access" className="flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>Access Code</span>
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
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

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {loading ? 'Connecting...' : 'Continue with Google'}
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="link" size="sm">
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Access Code Tab */}
              <TabsContent value="access">
                <form onSubmit={handleAccessCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Access Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter your access code"
                      value={accessForm.code}
                      onChange={(e) => setAccessForm({ ...accessForm, code: e.target.value.toUpperCase() })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the access code you received with your purchase
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Access Code'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* No Access Code Section */}
            <div className="mt-8 pt-6 border-t">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an access code or login?
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate('/landing');
                    setTimeout(() => {
                      const offersSection = document.getElementById('offers');
                      if (offersSection) {
                        offersSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 500);
                  }}
                  className="group"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  View Purchase Options
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Instructions */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2">Demo Credentials</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Login:</strong> user@example.com / password123</p>
              <p><strong>Access Codes:</strong> BLOOM2024 or POETRY123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}