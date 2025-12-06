import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const projects = [
  {
    id: 1,
    title: "Mindful Mornings Podcast",
    description: "Weekly conversations about consciousness, creativity, and personal growth",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=250&fit=crop",
    status: "Active",
    date: "2024",
    link: "https://mindful-mornings-podcast.com"
  },
  {
    id: 2,
    title: "Sacred Geometry Art Series",
    description: "Exploring the intersection of mathematics, spirituality, and visual art",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop",
    status: "In Progress",
    date: "2024",
    link: "https://sacred-geometry-art.com"
  },
  {
    id: 3,
    title: "Digital Detox Retreat",
    description: "Monthly virtual retreats for reconnecting with nature and inner peace",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    status: "Upcoming",
    date: "Spring 2024",
    link: "https://digital-detox-retreat.com"
  },
  {
    id: 4,
    title: "Poetry & Code Workshop",
    description: "Teaching the creative parallels between programming and poetic expression",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    status: "Planning",
    date: "Summer 2024",
    link: "https://poetry-code-workshop.com"
  }
];

export default function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, projects.length - itemsPerPage);

  const nextProjects = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevProjects = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Upcoming': return 'bg-yellow-500';
      case 'Planning': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4">Current Projects</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore my ongoing creative endeavors and upcoming initiatives
          </p>
        </div>

        <div className="relative">
          {/* Projects Carousel */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
            >
              {projects.map((project) => (
                <div key={project.id} className={`${isMobile ? 'w-full' : 'w-1/2'} flex-shrink-0 px-3`}>
                  <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="relative">
                        <ImageWithFallback 
                          src={project.image}
                          alt={project.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className={`${getStatusColor(project.status)} text-white`}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{project.date}</span>
                        </div>
                        
                        <h3 className="mb-3">{project.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {project.description}
                        </p>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="group/btn"
                          onClick={() => window.open(project.link, '_blank')}
                        >
                          Learn More
                          <ExternalLink className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background/80 backdrop-blur-sm"
              onClick={prevProjects}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          
          {currentIndex < maxIndex && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background/80 backdrop-blur-sm"
              onClick={nextProjects}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}