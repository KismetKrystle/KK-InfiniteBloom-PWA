import React from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Heart, 
  ExternalLink, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin,
  Globe,
  Mail
} from 'lucide-react';

const socialLinks = [
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://twitter.com/infinitebloom',
    color: 'hover:text-blue-400'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/infinitebloom',
    color: 'hover:text-pink-400'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: 'https://youtube.com/@infinitebloom',
    color: 'hover:text-red-400'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://linkedin.com/in/infinitebloom',
    color: 'hover:text-blue-600'
  }
];

export default function Footer() {
  const handleDonation = () => {
    window.open('https://donate.stripe.com/infinite-bloom', '_blank');
  };

  const handleWebsiteClick = () => {
    window.open('https://your-main-website.com', '_blank');
  };

  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Infinite Bloom</h3>
            <p className="text-muted-foreground leading-relaxed">
              A transformative journey through poetry, consciousness, and personal growth. 
              Experience 45 poems, audio companions, and profound insights.
            </p>
            <Button onClick={handleWebsiteClick} variant="outline" className="group">
              <Globe className="w-4 h-4 mr-2" />
              Visit Full Website
              <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h4>Support the Project</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Help us continue creating meaningful content and experiences. 
              Your support enables new projects and community initiatives.
            </p>
            <Button 
              onClick={handleDonation}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white group"
            >
              <Heart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Make a Donation
              <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h4>Stay Connected</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Follow our journey and join the community for updates, 
              behind-the-scenes content, and creative inspiration.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(social.url, '_blank')}
                  className={`transition-colors duration-300 ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.name}</span>
                </Button>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('mailto:hello@infinitebloom.com', '_blank')}
                className="group text-xs"
              >
                <Mail className="w-3 h-3 mr-2" />
                Get Updates
              </Button>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 Infinite Bloom. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button className="hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <button className="hover:text-foreground transition-colors">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}