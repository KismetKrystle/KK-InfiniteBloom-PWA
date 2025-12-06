import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ExternalLink, Check, ChevronRight, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const offers = [
  {
    id: 1,
    title: "Digital Edition",
    price: "$29",
    originalPrice: "$39",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
    description: "Complete digital access to Infinite Bloom with all features",
    features: [
      "45 Poems with Dynamic Formatting",
      "45 Audio Experiences",
      "143 Insights & Reflections",
      "Interactive Flipbook Interface",
      "2 Device Access",
      "Lifetime Updates"
    ],
    badge: "Most Popular",
    badgeColor: "bg-green-500",
    buttonText: "Get Digital Access",
    link: "https://buy.stripe.com/digital-edition"
  },
  {
    id: 2,
    title: "Premium Bundle",
    price: "$49",
    originalPrice: "$69",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
    description: "Digital edition plus exclusive bonus content and community access",
    features: [
      "Everything in Digital Edition",
      "Exclusive Bonus Poems (10 additional)",
      "Author Commentary Audio",
      "Private Community Access",
      "Monthly Live Sessions",
      "Printable Journal Pages",
      "Priority Support"
    ],
    badge: "Best Value",
    badgeColor: "bg-purple-500",
    buttonText: "Get Premium Bundle",
    link: "https://buy.stripe.com/premium-bundle"
  },
  {
    id: 3,
    title: "Collector's Edition",
    price: "$89",
    originalPrice: "$120",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop",
    description: "The ultimate experience with physical materials and personalized elements",
    features: [
      "Everything in Premium Bundle",
      "Physical Art Print Collection (5 prints)",
      "Handwritten Personal Note",
      "Limited Edition Bookmark Set",
      "Exclusive Behind-the-Scenes Content",
      "One-on-One Video Call with Author",
      "Signed Certificate of Authenticity"
    ],
    badge: "Limited Edition",
    badgeColor: "bg-amber-500",
    buttonText: "Get Collector's Edition",
    link: "https://buy.stripe.com/collectors-edition"
  }
];

export default function OffersSection() {
  const [selectedOffer, setSelectedOffer] = useState(null);

  return (
    <section id="offers" className="py-16 px-4 bg-muted/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4">Choose Your Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect edition of Infinite Bloom to begin your transformative poetry experience
          </p>
        </div>

        <div className="space-y-4">
          {offers.map((offer, index) => (
            <Dialog key={offer.id}>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <Card className="relative group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback 
                              src={offer.image}
                              alt={offer.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">{offer.title}</h3>
                            <p className="text-sm text-muted-foreground">{offer.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">{offer.price}</div>
                            {offer.originalPrice && (
                              <div className="text-sm text-muted-foreground line-through">
                                {offer.originalPrice}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="mb-4">
                    <DialogTitle className="text-2xl">{offer.title}</DialogTitle>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Product Image */}
                  <div className="relative rounded-lg overflow-hidden">
                    <ImageWithFallback 
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  
                  {/* Price and Description */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="text-3xl font-bold text-primary">{offer.price}</div>
                      {offer.originalPrice && (
                        <div className="text-lg text-muted-foreground line-through">
                          {offer.originalPrice}
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {offer.description}
                    </p>
                  </div>
                  
                  {/* Features List */}
                  <div>
                    <h4 className="font-medium mb-4">What's Included:</h4>
                    <ul className="space-y-3">
                      {offer.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Buy Button */}
                  <Button 
                    className="w-full group/btn"
                    size="lg"
                    onClick={() => window.open(offer.link, '_blank')}
                  >
                    {offer.buttonText}
                    <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
}