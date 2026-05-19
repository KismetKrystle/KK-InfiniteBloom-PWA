import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, Volume2, Lightbulb, Palette, BookOpen, Heart, ExternalLink } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: "45 Poems",
    description: "Carefully curated collection of transformative poetry",
    highlight: "45",
    color: "text-blue-500"
  },
  {
    icon: Volume2,
    title: "45 Audio Experiences",
    description: "Immersive audio companions for each poem",
    highlight: "45",
    color: "text-green-500"
  },
  {
    icon: Lightbulb,
    title: "143 Insights",
    description: "Profound realizations and contemplative observations",
    highlight: "143",
    color: "text-yellow-500"
  },
  {
    icon: Palette,
    title: "Dynamic Formatting",
    description: "Interactive layout that adapts to enhance your reading experience",
    highlight: "Smart",
    color: "text-purple-500"
  }
];


export default function FeaturesSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4">Unique Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover what makes Infinite Bloom a revolutionary approach to poetry and personal growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{feature.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {feature.highlight}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h3>Experience Infinite Bloom</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get a taste of the immersive digital flipbook experience. Preview a sample of the transformative poetry and interactive elements that await you.
              </p>
            </div>
            
            <Button 
              size="lg"
              onClick={() => {
                // Open the local sample flipbook
                const sampleUrl = window.location.origin + '/sample-flipbook.html';
                window.open(sampleUrl, '_blank', 'noopener,noreferrer,width=900,height=700,scrollbars=yes,resizable=yes');
              }}
              className="group"
            >
              <BookOpen className="w-5 h-5 mr-2 group-hover:rotate-6 transition-transform duration-300" />
              Preview Sample Flipbook
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Opens in a new window • Sample content included
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}