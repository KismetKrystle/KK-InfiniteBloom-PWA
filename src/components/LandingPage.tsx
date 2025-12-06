import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Play, Pause, SkipBack, SkipForward, Quote, Star, ArrowRight, ExternalLink, Sparkles, FileText, Volume2, Lightbulb, Palette, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Header from './Header';
import HeroSection from './HeroSection';
import TestimonialSection from './TestimonialSection';
import OffersSection from './OffersSection';
import AboutSection from './AboutSection';
import ProjectsSection from './ProjectsSection';
import Footer from './Footer';

const quotes = [
  "In the infinite bloom of possibility, every moment holds the seed of transformation.",
  "Like petals unfolding in perfect time, wisdom reveals itself to those who wait and watch.",
  "The deepest truths are often found in the quiet spaces between thoughts.",
  "Each insight is a flower in the garden of consciousness, blooming when conditions are right.",
  "In stillness, we discover the infinite bloom that has always been within us."
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentQuote, setCurrentQuote] = useState('');

  useEffect(() => {
    // Set a random quote when component mounts
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
  }, []);

  return (
    <div className="w-full">
      <Header onLoginClick={() => navigate('/access')} />
      <HeroSection 
        currentQuote={currentQuote} 
        onAccessClick={() => navigate('/access')}
        onLearnMoreClick={() => {
          const learnMoreSection = document.getElementById('learn-more');
          if (learnMoreSection) {
            learnMoreSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
      
      {/* About Infinite Bloom Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Quote className="w-8 h-8 text-primary/60 mr-3" />
            <h2>What is Infinite Bloom?</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            The Infinite Bloom is a transformative collection of 45 carefully curated poems, each accompanied by 
            immersive audio experiences and profound insights. This interactive flipbook takes you on a journey 
            of self-discovery, offering 143 unique insights that bloom like flowers in the garden of consciousness. 
            Each page invites contemplation, reflection, and personal growth through the power of poetry and mindful observation.
          </p>
        </div>
      </section>

      <LearnMoreSection />
      <OffersSection />
      <AboutSection />
      {/* <ProjectsSection /> */}
      <TestimonialSection />
      <Footer />
    </div>
  );
}

// Learn More About Product Section
function LearnMoreSection() {
  return (
    <section id="learn-more" className="py-12 px-4 bg-muted/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="mb-4">Learn More About the Product</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Listen to Book Overview Button */}
          <AudioPlayerDialog />
          
          {/* Preview Flipbook Button */}
          <FlipbookPreviewDialog />
        </div>
      </div>
    </section>
  );
}

// Audio Player Dialog Component
function AudioPlayerDialog() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(245);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-16 text-lg">
          Listen to Book Overview
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Listen to Book Overview</DialogTitle>
          <DialogDescription>
            Listen to an audio introduction and overview of the Infinite Bloom poetry collection.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop"
                  alt="Audio Cover"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium">Infinite Bloom Overview</h4>
                  <p className="text-sm text-muted-foreground">Introduction podcast</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <Button variant="ghost" size="sm">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-12 w-12 rounded-full"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

// Flipbook Preview Dialog Component
function FlipbookPreviewDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-16 text-lg">
          Preview Flipbook
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preview Flipbook</DialogTitle>
          <DialogDescription>
            Experience a sample of the interactive digital flipbook format and poetry content.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center space-y-6 p-6">
          <BookOpen className="w-16 h-16 text-primary mx-auto" />
          <div>
            <h4 className="font-medium mb-2">Experience the Interactive Format</h4>
            <p className="text-sm text-muted-foreground">
              Get a taste of the immersive digital flipbook experience. Preview a sample of the transformative poetry and interactive elements.
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => {
              const sampleUrl = window.location.origin + '/sample-flipbook.html';
              window.open(sampleUrl, '_blank', 'noopener,noreferrer,width=900,height=700,scrollbars=yes,resizable=yes');
            }}
            className="w-full"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Open Sample Flipbook
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}