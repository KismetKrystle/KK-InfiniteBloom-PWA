'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { LogIn, Settings } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-6xl mx-auto flex justify-end space-x-2">
        {/* Temporary Admin Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/admin')}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLoginClick}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </div>
    </header>
  );
}