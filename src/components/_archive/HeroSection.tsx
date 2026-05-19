import React from 'react';
import { Button } from './ui/button';
import { Quote, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroSectionProps {
  currentQuote: string;
  onAccessClick: () => void;
  onLearnMoreClick: () => void;
}

export default function HeroSection({ currentQuote, onAccessClick, onLearnMoreClick }: HeroSectionProps) {
  return (
    <section className="relative py-8 px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center space-y-4 mb-4">
            <div className="w-28 h-28 flex items-center justify-center">
              <ImageWithFallback 
                src="https://ik.imagekit.io/kis84/infinite%20bloom%20logo.png?updatedAt=1759401362780" 
                alt="Infinite Bloom Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                The Infinite Bloom
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Evolving By Perspective</p>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            {/* Quote */}
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
              <blockquote className="text-xl leading-relaxed text-foreground/90 italic pl-8">
                "{currentQuote}"
              </blockquote>
            </div>

            {/* Access Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={onAccessClick}
                className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Access Book
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-muted/50 transition-all duration-300"
                onClick={onLearnMoreClick}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://ik.imagekit.io/kis84/IB%20-%20paperback.png?updatedAt=1759400531996"
                alt="Beautiful flowers blooming - representing infinite bloom"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}