'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  HelpCircle,
  Maximize,
  Minimize,
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  X
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
  const router = useRouter();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userEmail, setUserEmail] = useState(user?.email || 'user@example.com');
  const [newEmail, setNewEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showReflectionsInfo, setShowReflectionsInfo] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  const toggleAudio = () => {
    if (iframeRef?.contentWindow) {
      const audioElements = iframeRef.contentDocument?.getElementsByTagName('audio');
      if (audioElements && audioElements.length > 0) {
        let anyPlaying = false;

        // Check if any are effectively playing
        for (let i = 0; i < audioElements.length; i++) {
          const audio = audioElements[i];
          if (!audio.paused && audio.playbackRate > 0) {
            anyPlaying = true;
            break;
          }
        }

        const targetState = !anyPlaying;
        setIsPlaying(targetState);

        for (let i = 0; i < audioElements.length; i++) {
          const audio = audioElements[i];
          try {
            if (targetState) {
              // RESUME Logic
              // 1. If it was 'soft paused' (rate 0), restore rate and force play
              if (audio.playbackRate === 0) {
                audio.playbackRate = 1;
                audio.play().catch(e => console.error("Resume soft-pause failed:", e));
              }
              // 2. If it was hard paused but had progress, play it
              else if (audio.paused && audio.currentTime > 0 && !audio.ended) {
                audio.playbackRate = 1;
                audio.play().catch(e => console.error("Resume hard-pause failed:", e));
              }
            } else {
              // PAUSE Logic
              // Soft pause by setting rate to 0 to prevent 'ended'/'pause' events firing
              if (!audio.paused) {
                audio.playbackRate = 0;
              }
            }
          } catch (e) {
            console.error("Error toggling audio:", e);
          }
        }
      }
    }
  };

  const toggleMute = () => {
    if (iframeRef?.contentWindow) {
      const audioElements = iframeRef.contentDocument?.getElementsByTagName('audio');
      if (audioElements && audioElements.length > 0) {
        // Determine target mute state from the first element
        const targetMute = !audioElements[0].muted;
        setIsMuted(targetMute);

        for (let i = 0; i < audioElements.length; i++) {
          audioElements[i].muted = targetMute;
        }
      }
    }
  };

  const openFlipbook = () => {
    // Track flipbook access
    trackEvent('page_view', { page: 'flipbook', user: user.email });
    setShowFlipbook(true);
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-2 md:py-8">
        {/* Welcome Message */}
        <div className="mb-4 md:mb-6 text-left">
          <h2 className="text-2xl">Welcome to Infinite Bloom, </h2>
          <h2> {user.name}!</h2>
        </div>

        {/* Book Image */}
        {/* Book Image or Iframe */}
        <div className="text-center mb-4 md:mb-6">
          {showFlipbook ? (
            <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-background' : 'relative max-w-4xl mx-auto w-full h-80 md:h-[600px] bg-gray-100 rounded-lg overflow-hidden shadow-xl'}`}>
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {/* Mobile Back Button - integrated into vertical stack if needed, or kept separate. 
                     User requested specific icons. I'll add the requested ones here. */}

                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/40 text-white hover:bg-black/60 hover:text-white backdrop-blur-sm transition-colors rounded-full"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/40 text-white hover:bg-black/60 hover:text-white backdrop-blur-sm transition-colors rounded-full"
                  onClick={toggleAudio}
                  title={isPlaying ? "Pause" : "Play Music"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/40 text-white hover:bg-black/60 hover:text-white backdrop-blur-sm transition-colors rounded-full"
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>

              {/* Close Button remains top-right but simplified */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-red-500/80 text-white hover:bg-red-600 hover:text-white shadow-sm rounded-full backdrop-blur-sm transition-colors"
                  onClick={() => {
                    setShowFlipbook(false);
                    setIsFullScreen(false);
                  }}
                  title="Close Book"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <iframe
                ref={(el) => setIframeRef(el)}
                src={process.env.NEXT_PUBLIC_BOOK_URL ?? '/book/index.html'}
                className="w-full h-full border-0"
                title="Infinite Bloom Flipbook"
              />
            </div>
          ) : (
            <Card className="max-w-4xl mx-auto group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2" onClick={() => setShowFlipbook(true)}>
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
          )}
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