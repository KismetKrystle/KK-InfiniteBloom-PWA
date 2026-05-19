import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, BookOpen, Heart, Sparkles, ChevronLeft, ChevronRight, User, Globe, Trophy, Quote, Calendar, Users, Mail, MessageCircle, Twitter, Instagram, Linkedin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function AboutSection() {
  const [currentCard, setCurrentCard] = useState(0);

  // Helper function to get platform-specific icon
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Mock data that would come from the admin management system
  const authorInfo = {
    name: 'Krystle Wilson',
    title: 'Poet, Author & Tech/Web3',
    bio: 'Kismet Krystle is a celebrated poet and published author with over 20 years of experience guiding individuals through transformative literary journeys. Her work has been featured in numerous publications and has touched the lives of thousands worldwide.',
    short_bio: 'Poet, author, and mindfulness teacher helping people find peace through poetry.',
    profile_image: 'https://ik.imagekit.io/kis84/kismet%20on%20stool.jpg?updatedAt=1759400919481',
    location: 'Bali, Indonesia',
    website: 'https://kismetkrystle.com'
  };

  const socialLinks = [
    { platform: 'x', url: 'https://x.com/sarahjpoetry', is_active: true },
    { platform: 'instagram', url: 'https://instagram.com/sarahjpoetry', is_active: true },
    { platform: 'linkedin', url: 'https://linkedin.com/in/sarahjohnson', is_active: true }
  ];

  const achievements = [
    {
      title: 'Published Author',
      description: 'Author of 3 published poetry collections',
      date: '2020-01-01',
      is_featured: true
    },
    {
      title: 'Mindfulness Certification',
      description: 'Certified Mindfulness-Based Stress Reduction (MBSR) Teacher',
      date: '2018-06-15',
      is_featured: true
    },
    {
      title: 'Poetry Award',
      description: 'Winner of the National Poetry Society Excellence Award',
      date: '2019-11-20',
      is_featured: false
    }
  ];

  const authorQuote = {
    quote: 'Poetry is the language of the soul speaking to souls. Through words, we find the infinite blooming within us.',
    context: 'From her TEDx talk "The Healing Power of Poetry"'
  };

  const bookingInfo = {
    is_available: true,
    booking_email: 'booking@sarahjohnson.com',
    booking_form_url: 'https://calendly.com/sarahjohnson',
    services: ['Speaking Engagements', 'Workshops', 'Poetry Readings'],
    introduction: 'I\'m available for speaking engagements, workshops, and poetry readings. Let\'s connect to discuss how we can bring mindfulness and poetry to your community.',
    availability_note: 'Currently booking 2-3 months in advance. Virtual and in-person options available.'
  };

  const cards = [
    {
      id: 'basic',
      title: 'About the Author',
      icon: <User className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <img 
              src={authorInfo.profile_image} 
              alt={authorInfo.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold">{authorInfo.name}</h3>
            <p className="text-muted-foreground">{authorInfo.title}</p>
            <p className="text-sm text-muted-foreground">{authorInfo.location}</p>
          </div>
          <p className="text-sm leading-relaxed">{authorInfo.bio}</p>
        </div>
      )
    },
    {
      id: 'social',
      title: 'Connect & Follow',
      icon: <Globe className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Follow my journey and connect with me on social media
          </p>
          <div className="space-y-3">
            {socialLinks.filter(link => link.is_active).map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <span className="capitalize font-medium">
                  {link.platform === 'x' ? 'X (Twitter)' : link.platform}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  {getSocialIcon(link.platform)}
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={() => window.open(authorInfo.website, '_blank')}
              className="w-full"
            >
              Visit My Website
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )
    }
    // Commented out sections as requested:
    // {
    //   id: 'achievements',
    //   title: 'Achievements & Milestones',
    //   icon: <Trophy className="w-5 h-5" />,
    //   content: (...)
    // },
    // {
    //   id: 'booking',
    //   title: 'Book an Event',
    //   icon: <Calendar className="w-5 h-5" />,
    //   content: (...)
    // }
  ];

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <section id="about" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4">About the Author</h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto" />
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column - Author Image */}
            <div className="relative">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&crop=faces"
                    alt="Author portrait"
                    className="w-full h-[500px] object-cover"
                  />
                </CardContent>
              </Card>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Right Column - Bio Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-semibold">{authorInfo.name}</h3>
                  <p className="text-muted-foreground">{authorInfo.title}</p>
                  <p className="text-sm text-muted-foreground">{authorInfo.location}</p>
                </div>
                <p className="leading-relaxed">{authorInfo.bio}</p>
              </div>

              {/* Social Media Links */}
              <div className="flex items-center space-x-4 pt-4 border-t">
                {socialLinks.filter(link => link.is_active).map((link, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open(link.url, '_blank')}
                    className="rounded-full"
                  >
                    {getSocialIcon(link.platform)}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(authorInfo.website, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Website
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {/* Author Image */}
          <div className="relative max-w-sm mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ImageWithFallback 
                  src="https://ik.imagekit.io/kis84/kismet%20on%20stool.jpg?updatedAt=1759400961422"
                  alt="Author portrait"
                  className="w-full h-[400px] object-cover"
                />
              </CardContent>
            </Card>
          </div>

          {/* Bio Info */}
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-2xl font-semibold">{authorInfo.name}</h3>
              <p className="text-muted-foreground">{authorInfo.title}</p>
              <p className="text-sm text-muted-foreground">{authorInfo.location}</p>
            </div>
            <p className="leading-relaxed text-left">{authorInfo.bio}</p>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t">
            {socialLinks.filter(link => link.is_active).map((link, index) => (
              <Button 
                key={index}
                variant="outline" 
                size="icon"
                onClick={() => window.open(link.url, '_blank')}
                className="rounded-full"
              >
                {getSocialIcon(link.platform)}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(authorInfo.website, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Website
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}