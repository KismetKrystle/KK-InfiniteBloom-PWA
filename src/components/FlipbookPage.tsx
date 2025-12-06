import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  BookOpen, 
  User, 
  Home,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

import UserMessaging from './UserMessaging';
import UserTestimonialForm from './UserTestimonialForm';
import PromptJournal from './PromptJournal';
import { useAnalytics } from '../hooks/useAnalytics';

interface FlipbookPageProps {
  user: any;
}

export default function FlipbookPage({ user }: FlipbookPageProps) {
  const navigate = useNavigate();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userEmail, setUserEmail] = useState(user?.email || 'user@example.com');
  const [newEmail, setNewEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showReflectionsInfo, setShowReflectionsInfo] = useState(false);

  const { trackEvent } = useAnalytics();

  // Mock user subscription data - replace with actual user data
  const userSubscription = {
    devicesUsed: 1,
    maxDevices: 2,
    purchaseDate: new Date('2024-01-15')
  };

  const handleEmailUpdate = () => {
    if (newEmail && newEmail !== userEmail) {
      setUserEmail(newEmail);
      setIsEditingEmail(false);
      setNewEmail('');
      // Here you would update the email in your backend
    }
  };

  const openFlipbook = () => {
    // Track flipbook access
    trackEvent('page_view', { page: 'flipbook', user: user.email });
    
    // This will open the HTML flipbook in a new window
    // For now, we'll open a placeholder - you'll replace this with your flipbook HTML
    window.open('/sample-flipbook.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/landing')}
              className="group"
            >
              <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-medium">Infinite Bloom</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Messaging Component */}
            <UserMessaging userId={user.id || 'mock-user-id'} userEmail={user.email} />
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowUserProfile(true)}
              className="group"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-2 md:py-8">
        {/* Welcome Message */}
        <div className="mb-4 md:mb-6 text-left">
          <h2 className="text-2xl">Welcome to Infinite Bloom, </h2>
          <h2> {user.name}!</h2>
        </div>

        {/* Book Image */}
        <div className="text-center mb-4 md:mb-6">
          <Card className="max-w-2xl mx-auto group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2" onClick={openFlipbook}>
            <CardContent className="p-4 md:p-8">
              <div className="relative">
                <ImageWithFallback 
                  src="https://ik.imagekit.io/kis84/Cover%204.png?updatedAt=1759400255592"
                  alt="Infinite Bloom - Poetry Collection"
                  className="w-full h-80 md:h-[600px] object-contain rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg">
                    <ExternalLink className="w-5 h-5" />
                    <span className="font-medium">Open Book</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Writing Companion Section */}
        <div className="mb-4 md:mb-6">
          <Card className="bg-white rounded-xl shadow-lg border-0">
            <CardContent className="p-4 md:p-8">
              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">Write & Reflect Companion</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted rounded-full"
                    onClick={() => setShowReflectionsInfo(!showReflectionsInfo)}
                    aria-label="Toggle reflections information"
                  >
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                {showReflectionsInfo && (
                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    Explore thoughtful prompts, capture your insights, and preserve your reflections in one place. 
                    Your personal writing space for poetry, thoughts, and moments of clarity.
                  </p>
                )}
              </div>
              <PromptJournal userId={user.id || 'mock-user-id'} />
            </CardContent>
          </Card>
        </div>

        {/* Light Divider */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-px bg-border"></div>
        </div>

        {/* User Testimonial Form - Centered */}
        <div className="flex justify-center mb-4">
          <UserTestimonialForm 
            userEmail={user.email} 
            userName={user.name} 
          />
        </div>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile & Settings</DialogTitle>
            <DialogDescription>
              Manage your account details and device usage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* User Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                {isEditingEmail ? (
                  <div className="space-y-2">
                    <Input
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                      type="email"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleEmailUpdate}>Save</Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditingEmail(false);
                          setNewEmail('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setIsEditingEmail(true);
                        setNewEmail(userEmail);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Device Usage */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Device Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Devices Used:</span>
                  <span className="text-sm font-medium">
                    {userSubscription.devicesUsed} of {userSubscription.maxDevices}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(userSubscription.devicesUsed / userSubscription.maxDevices) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Registration: {userSubscription.purchaseDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}