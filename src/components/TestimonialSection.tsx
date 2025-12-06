import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Meditation Teacher",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=faces",
    rating: 5,
    text: "Infinite Bloom has transformed my daily practice. Each poem opens doorways to deeper understanding and inner peace."
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Life Coach",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    rating: 5,
    text: "The audio companions bring these poems to life. It's like having a personal guide through the landscape of consciousness."
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Therapist",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
    rating: 5,
    text: "I recommend this collection to all my clients. The insights are profound and the interactive format makes it deeply engaging."
  },
  {
    id: 4,
    name: "David Park",
    role: "Writer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
    rating: 5,
    text: "As a fellow writer, I'm amazed by the depth and beauty of each piece. The dynamic formatting adds a whole new dimension."
  },
  {
    id: 5,
    name: "Amira Hassan",
    role: "Mindfulness Practitioner",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
    rating: 5,
    text: "Every page is a revelation. The 143 insights have become part of my daily contemplation practice."
  }
];

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-12 px-4 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="mb-4">What Readers Are Saying</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover how Infinite Bloom has touched the lives of readers around the world
          </p>
        </div>

        <div className="relative">
          {/* Main Testimonial Display */}
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <Card className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border-0">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                          <ImageWithFallback 
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                          <Quote className="w-6 h-6 text-primary/30 mb-3 mx-auto md:mx-0" />
                          <blockquote className="text-base leading-relaxed mb-4 text-foreground/90">
                            "{testimonial.text}"
                          </blockquote>
                          
                          <div className="flex items-center justify-center md:justify-start space-x-1 mb-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          
                          <div>
                            <div className="font-medium text-sm">{testimonial.name}</div>
                            <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={nextTestimonial}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary scale-110' : 'bg-muted-foreground/30'
                }`}
                onClick={() => goToTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}