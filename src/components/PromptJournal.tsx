import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { 
  RefreshCw, 
  PenTool, 
  Save, 
  Quote,
  ArrowLeft,
  Search,
  FileText,
  Calendar,
  Eye,
  NotebookPen,
  Filter,
  BookOpen,
  User,
  Download,
  X,
  CheckCircle2,
  Pencil,
  Trash2
} from 'lucide-react';

interface JournalEntry {
  id: string;
  prompt: string;
  title?: string;
  entry: string;
  entryType: 'poem' | 'insight' | 'neither';
  createdAt: Date;
}

interface PromptJournalProps {
  userId: string;
}

// User Profile Component
function UserProfile({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string }) {
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [newEmail, setNewEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  
  // Mock user data - replace with actual user data
  const userData = {
    name: 'John Doe',
    email: userEmail,
    devicesUsed: 1,
    maxDevices: 2,
    registrationDate: new Date('2024-01-15')
  };

  const handleEmailUpdate = () => {
    if (newEmail && newEmail !== userEmail) {
      setUserEmail(newEmail);
      setIsEditingEmail(false);
      setNewEmail('');
      // Here you would update the email in your backend
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <p className="text-sm text-muted-foreground">{userData.name}</p>
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
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setNewEmail(userData.email);
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
                  {userData.devicesUsed} of {userData.maxDevices}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(userData.devicesUsed / userData.maxDevices) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Registration: {userData.registrationDate.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PromptJournal({ userId }: PromptJournalProps) {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentLineNumber, setCurrentLineNumber] = useState<number | null>(null);
  const [currentQuote, setCurrentQuote] = useState('');
  const [journalEntry, setJournalEntry] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryType, setEntryType] = useState<'poem' | 'insight' | 'neither'>('neither');
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [writingMode, setWritingMode] = useState<'none' | 'respond' | 'custom' | 'viewAll'>('none');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'poem' | 'insight' | 'neither'>('all');
  const [previousView, setPreviousView] = useState<'none' | 'respond' | 'custom' | 'viewAll'>('none');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editedEntry, setEditedEntry] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedType, setEditedType] = useState<'poem' | 'insight' | 'neither'>('neither');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [customPromptInput, setCustomPromptInput] = useState('');

  // Collection of writing prompts for inspiration with line numbers, quotes, and questions
  const prompts = [
    { lineNumber: 42, quote: "In stillness, we find the whispers of our soul.", question: "What moment today reminded you to slow down and breathe?", type: "insight" },
    { lineNumber: 108, quote: "Beauty lives in the margins, waiting to be noticed.", question: "Describe a small beauty you noticed that others might have missed.", type: "poem" },
    { lineNumber: 215, quote: "The heart speaks in a language older than words.", question: "What is your heart trying to tell you right now?", type: "insight" },
    { lineNumber: 89, quote: "Like petals unfolding to greet the morning sun.", question: "If your current emotion was a season, what would it be and why?", type: "poem" },
    { lineNumber: 156, quote: "We carry gardens in our hearts, some blooming, some waiting.", question: "What are you ready to let go of to make space for something new?", type: "insight" },
    { lineNumber: 203, quote: "Between the words, a universe of meaning breathes.", question: "Write about a time when silence spoke louder than words.", type: "poem" },
    { lineNumber: 67, quote: "Time moves differently when we choose to truly see.", question: "What would you say to yourself from five years ago?", type: "insight" },
    { lineNumber: 134, quote: "Home is not a place but a feeling we return to.", question: "Describe the feeling of home without mentioning a place.", type: "poem" },
    { lineNumber: 178, quote: "Every scar tells a story of survival and strength.", question: "What story do your hands tell about your life?", type: "poem" },
    { lineNumber: 91, quote: "Gratitude paints the world in softer hues.", question: "If gratitude had a color, what would it be in your life today?", type: "poem" },
    { lineNumber: 245, quote: "The moon witnesses what daylight cannot hold.", question: "Write about moonlight touching something unexpected.", type: "poem" },
    { lineNumber: 52, quote: "Morning arrives with quiet promises.", question: "Capture the sound of morning in three lines.", type: "poem" },
    { lineNumber: 167, quote: "In the pause between heartbeats, infinity dwells.", question: "Describe the space between two heartbeats.", type: "poem" },
    { lineNumber: 199, quote: "Wind carries the words we were too afraid to speak.", question: "What does the wind carry that we cannot see?", type: "poem" },
    { lineNumber: 123, quote: "Shadows remember what light forgets.", question: "Write a conversation between your shadow and the sun.", type: "poem" },
    { lineNumber: 78, quote: "Even endings hold the seeds of beginning.", question: "Find poetry in the last thing you threw away.", type: "poem" },
    { lineNumber: 211, quote: "Earth drinks rain like stories, holding each one deep.", question: "Describe rain from the perspective of the earth.", type: "poem" },
    { lineNumber: 145, quote: "Reflections reveal truths we cannot face directly.", question: "What secrets do mirrors keep?", type: "poem" },
    { lineNumber: 183, quote: "Forgiveness blooms in colors we have no names for.", question: "Write about the color of forgiveness.", type: "poem" },
    { lineNumber: 56, quote: "Dawn holds its breath before it breaks.", question: "Capture the moment just before dawn breaks.", type: "poem" },
    { lineNumber: 234, quote: "Old beliefs fall away like autumn leaves.", question: "What limiting belief are you ready to outgrow?", type: "insight" },
    { lineNumber: 112, quote: "Courage is not the absence of fear but dancing with it.", question: "Describe a fear that once held you back but no longer does.", type: "insight" },
    { lineNumber: 189, quote: "We discover ourselves in the most unexpected moments.", question: "What strength did you discover about yourself this week?", type: "insight" },
    { lineNumber: 73, quote: "Success is a journey that changes with every step.", question: "How has your definition of success evolved?", type: "insight" },
    { lineNumber: 227, quote: "Bravery wears many faces, most unrecognized.", question: "What would courage look like in your life today?", type: "insight" },
    { lineNumber: 98, quote: "Mistakes are simply stepping stones in disguise.", question: "Write about a mistake that became a stepping stone.", type: "insight" },
    { lineNumber: 161, quote: "We are always becoming, never quite finished.", question: "What are you becoming that you weren't a year ago?", type: "insight" },
    { lineNumber: 204, quote: "Our truest self emerges in solitude.", question: "Describe the person you are when no one is watching.", type: "insight" },
    { lineNumber: 84, quote: "Without fear of failure, what dreams would take flight?", question: "What would you attempt if you knew you couldn't fail?", type: "insight" },
    { lineNumber: 249, quote: "Legacy lives in the moments we choose to create.", question: "How do you want to be remembered by your future self?", type: "insight" },
    { lineNumber: 87, quote: "We are seasons in constant bloom and decay.", question: "If your current emotion was a season, what would it be and why?", type: "poem" },
    { lineNumber: 156, quote: "To grow, we must first release what no longer serves.", question: "What are you ready to let go of to make space for something new?", type: "insight" },
    { lineNumber: 293, quote: "Sometimes silence is the loudest truth we speak.", question: "Write about a time when silence spoke louder than words.", type: "poem" },
    { lineNumber: 64, quote: "Our past selves hold wisdom we're only now ready to hear.", question: "What would you say to yourself from five years ago?", type: "insight" },
    { lineNumber: 171, quote: "Home is a feeling that lives inside us.", question: "Describe the feeling of home without mentioning a place.", type: "poem" },
    { lineNumber: 329, quote: "Our hands carry the stories of every moment we've lived.", question: "What story do your hands tell about your life?", type: "poem" },
    { lineNumber: 95, quote: "Gratitude paints our world in colors we choose to see.", question: "If gratitude had a color, what would it be in your life today?", type: "poem" },
    { lineNumber: 203, quote: "Moonlight transforms the ordinary into magic.", question: "Write about moonlight touching something unexpected.", type: "poem" },
    { lineNumber: 12, quote: "Morning arrives with its own song.", question: "Capture the sound of morning in three lines.", type: "poem" },
    { lineNumber: 267, quote: "Between heartbeats lies an entire universe.", question: "Describe the space between two heartbeats.", type: "poem" },
    { lineNumber: 134, quote: "The wind carries messages meant only for those who listen.", question: "What does the wind carry that we cannot see?", type: "poem" },
    { lineNumber: 301, quote: "Even our shadows seek understanding.", question: "Write a conversation between your shadow and the sun.", type: "poem" },
    { lineNumber: 78, quote: "Nothing is wasted in the economy of a poet's heart.", question: "Find poetry in the last thing you threw away.", type: "poem" },
    { lineNumber: 245, quote: "The earth receives rain as a love letter from the sky.", question: "Describe rain from the perspective of the earth.", type: "poem" },
    { lineNumber: 189, quote: "Mirrors reflect not just images, but truths unspoken.", question: "What secrets do mirrors keep?", type: "poem" },
    { lineNumber: 321, quote: "Forgiveness blooms in colors the eye cannot see.", question: "Write about the color of forgiveness.", type: "poem" },
    { lineNumber: 29, quote: "Dawn breaks with promises written in light.", question: "Capture the moment just before dawn breaks.", type: "poem" },
    { lineNumber: 142, quote: "We are not bound by the stories we once believed.", question: "What limiting belief are you ready to outgrow?", type: "insight" },
    { lineNumber: 278, quote: "Fear shrinks when we turn to face it.", question: "Describe a fear that once held you back but no longer does.", type: "insight" },
    { lineNumber: 56, quote: "Strength is discovered in our breaking and rebuilding.", question: "What strength did you discover about yourself this week?", type: "insight" },
    { lineNumber: 198, quote: "Success is not a destination but an evolution.", question: "How has your definition of success evolved?", type: "insight" },
    { lineNumber: 310, quote: "Courage is not the absence of fear but the presence of will.", question: "What would courage look like in your life today?", type: "insight" },
    { lineNumber: 121, quote: "Our mistakes are the stepping stones to who we become.", question: "Write about a mistake that became a stepping stone.", type: "insight" },
    { lineNumber: 251, quote: "We are always becoming, never finished.", question: "What are you becoming that you weren't a year ago?", type: "insight" },
    { lineNumber: 73, quote: "Who we are in solitude reveals our truest self.", question: "Describe the person you are when no one is watching.", type: "insight" },
    { lineNumber: 336, quote: "Without the fear of failure, we are limitless.", question: "What would you attempt if you knew you couldn't fail?", type: "insight" },
    { lineNumber: 163, quote: "The future remembers what we choose to become.", question: "How do you want to be remembered by your future self?", type: "insight" }
  ];

  // Generate a random prompt
  const generateNewPrompt = () => {
    setIsGenerating(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      const randomPromptObj = prompts[Math.floor(Math.random() * prompts.length)];
      setCurrentLineNumber(randomPromptObj.lineNumber);
      setCurrentQuote(randomPromptObj.quote);
      setCurrentPrompt(randomPromptObj.question);
      setEntryType(randomPromptObj.type as 'poem' | 'insight' | 'neither'); // Set suggested type
      setJournalEntry(''); // Clear previous entry when generating new prompt
      setEntryTitle(''); // Clear title
      setWritingMode('none'); // Reset to view mode
      setIsCustomMode(false);
      setShowSavedMessage(false);
      setIsGenerating(false);
    }, 800);
  };

  // Save journal entry
  const saveEntry = () => {
    if (!journalEntry.trim()) return;
    
    setIsSaving(true);
    
    setTimeout(() => {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        prompt: isCustomMode ? (customPromptInput.trim() || 'Custom entry') : currentPrompt,
        title: entryTitle.trim() || undefined,
        entry: journalEntry.trim(),
        entryType: entryType,
        createdAt: new Date()
      };
      
      setSavedEntries(prev => [newEntry, ...prev]);
      setRecentEntries(prev => [newEntry, ...prev.slice(0, 2)]); // Keep last 3 entries
      
      // Clear the form but stay in writing mode
      setJournalEntry('');
      setEntryTitle('');
      setEntryType('neither');
      setCustomPromptInput(''); // Clear custom prompt input
      setIsSaving(false);
      setShowSavedMessage(true);
      
      // Hide the saved message after 3 seconds
      setTimeout(() => setShowSavedMessage(false), 3000);
    }, 500);
  };

  // Clear prompt and enter custom mode
  const clearPrompt = () => {
    setPreviousView(writingMode);
    setCurrentPrompt('');
    setCurrentLineNumber(null);
    setCurrentQuote('');
    setIsCustomMode(true);
    setWritingMode('custom');
    setEntryType('neither');
    setEntryTitle('');
    setCustomPromptInput('');
  };

  // Start responding to current prompt
  const startResponding = () => {
    setPreviousView(writingMode);
    setWritingMode('respond');
  };

  // Exit writing mode and return to previous view
  const exitWritingMode = () => {
    if (previousView === 'viewAll') {
      setWritingMode('viewAll');
    } else {
      setWritingMode('none');
    }
    setJournalEntry('');
    setEntryTitle('');
    setEntryType('neither');
    setShowSavedMessage(false);
    setSearchTerm('');
    setCustomPromptInput('');
    if (isCustomMode) {
      setIsCustomMode(false);
      generateNewPrompt();
    }
    setPreviousView('none');
  };

  // Open view all mode
  const openViewAll = () => {
    setPreviousView(writingMode);
    setWritingMode('viewAll');
    setSearchTerm('');
  };

  // Toggle entry selection
  const toggleEntrySelection = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  // Select all filtered entries
  const selectAllEntries = () => {
    const allIds = filteredEntries.map(entry => entry.id);
    setSelectedEntries(allIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedEntries([]);
  };

  // Start editing an entry
  const startEditingEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditedEntry(entry.entry);
    setEditedTitle(entry.title || '');
    setEditedType(entry.entryType);
  };

  // Save edited entry
  const saveEditedEntry = () => {
    if (!editingEntryId || !editedEntry.trim()) return;
    
    setSavedEntries(prev => prev.map(entry => 
      entry.id === editingEntryId
        ? { ...entry, entry: editedEntry.trim(), title: editedTitle.trim() || undefined, entryType: editedType }
        : entry
    ));
    
    // Update recent entries if the edited entry is in there
    setRecentEntries(prev => prev.map(entry => 
      entry.id === editingEntryId
        ? { ...entry, entry: editedEntry.trim(), title: editedTitle.trim() || undefined, entryType: editedType }
        : entry
    ));
    
    setEditingEntryId(null);
    setEditedEntry('');
    setEditedTitle('');
    setEditedType('neither');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEntryId(null);
    setEditedEntry('');
    setEditedTitle('');
    setEditedType('neither');
  };

  // Initiate delete
  const initiateDelete = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteDialog(true);
  };

  // Confirm delete entry
  const confirmDeleteEntry = () => {
    if (!entryToDelete) return;
    
    setSavedEntries(prev => prev.filter(entry => entry.id !== entryToDelete));
    setRecentEntries(prev => prev.filter(entry => entry.id !== entryToDelete));
    setSelectedEntries(prev => prev.filter(id => id !== entryToDelete));
    
    setShowDeleteDialog(false);
    setEntryToDelete(null);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setEntryToDelete(null);
  };

  // Download selected entries
  const downloadSelectedEntries = () => {
    if (selectedEntries.length === 0) return;
    
    const selectedEntriesData = savedEntries.filter(entry => 
      selectedEntries.includes(entry.id)
    );
    
    const content = selectedEntriesData.map(entry => {
      let text = `Title: ${entry.title || 'Untitled'}\n`;
      text += `Type: ${entry.entryType}\n`;
      text += `Date: ${formatDate(entry.createdAt)}\n`;
      if (entry.prompt) {
        text += `Prompt: ${entry.prompt}\n`;
      }
      text += `\nContent:\n${entry.entry}\n`;
      text += '\n' + '='.repeat(50) + '\n\n';
      return text;
    }).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflections-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Clear selections after download
    setSelectedEntries([]);
  };

  // Filter entries based on search term and type filter
  const filteredEntries = savedEntries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || (
      entry.entry.toLowerCase().includes(searchLower) ||
      entry.prompt.toLowerCase().includes(searchLower) ||
      (entry.title && entry.title.toLowerCase().includes(searchLower)) ||
      entry.entryType.toLowerCase().includes(searchLower)
    );
    
    const matchesType = filterType === 'all' || entry.entryType === filterType;
    
    return matchesSearch && matchesType;
  });

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load saved entries from localStorage
  useEffect(() => {
    const savedEntriesKey = `journal_entries_${userId}`;
    const stored = localStorage.getItem(savedEntriesKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt)
        }));
        setSavedEntries(entriesWithDates);
        setRecentEntries(entriesWithDates.slice(0, 3));
      } catch (error) {
        console.error('Error loading saved entries:', error);
      }
    }
  }, [userId]);

  // Save entries to localStorage whenever savedEntries changes
  useEffect(() => {
    if (savedEntries.length > 0) {
      const savedEntriesKey = `journal_entries_${userId}`;
      localStorage.setItem(savedEntriesKey, JSON.stringify(savedEntries));
    }
  }, [savedEntries, userId]);

  // Initialize with a random prompt
  useEffect(() => {
    generateNewPrompt();
  }, []);

  // Full screen writing mode
  if (writingMode === 'respond' || writingMode === 'custom') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={exitWritingMode}
                className="group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium">Infinite Bloom</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <PenTool className="w-4 h-4 text-primary" />
                <span className="font-medium">Reflections</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowUserProfile(true)}
              variant="ghost"
              size="sm"
              className="group"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Writing Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Prompt Display (if responding to prompt) */}
            {writingMode === 'respond' && currentPrompt && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Quote className="w-5 h-5 text-primary" />
                    <span className="font-medium">Reflection Prompt</span>
                  </div>
                  
                  {/* Quote from the book */}
                  {currentQuote && (
                    <div className="space-y-2">
                      <blockquote className="text-base italic text-foreground/90 leading-relaxed pl-4 border-l-2 border-primary/30">
                        "{currentQuote}"
                      </blockquote>
                      
                      {/* Type and Number */}
                      <div className="flex items-center gap-2 pl-4">
                        {currentLineNumber && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
                            {entryType} {currentLineNumber}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Reflection Question */}
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-base font-medium text-foreground leading-relaxed">
                      {currentPrompt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Custom Mode Instructions */}
            {writingMode === 'custom' && (
              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">What would you like to write about?</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Your Prompt/Question (optional)</Label>
                      <Textarea
                        value={customPromptInput}
                        onChange={(e) => setCustomPromptInput(e.target.value)}
                        placeholder="Reference content from the book, or write your own prompt/question to reflect on..."
                        className="bg-background min-h-20 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Title (optional)</Label>
                      <Input
                        value={entryTitle}
                        onChange={(e) => setEntryTitle(e.target.value)}
                        placeholder="Give your writing a title..."
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">What type of entry is this?</Label>
                      <RadioGroup 
                        value={entryType} 
                        onValueChange={(value) => setEntryType(value as 'poem' | 'insight' | 'neither')}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="poem" id="poem" />
                          <Label htmlFor="poem">Poem</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="insight" id="insight" />
                          <Label htmlFor="insight">Insight</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="neither" id="neither" />
                          <Label htmlFor="neither">Neither</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Saved Message */}
            {showSavedMessage && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">
                  Entry saved successfully!
                </AlertDescription>
              </Alert>
            )}


            
            {/* Writing Textarea */}
            <Card className="flex-1">
              <CardContent className="p-6 space-y-6">
                <div>
                  <Textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder={writingMode === 'respond' 
                      ? "Let your thoughts flow freely in response to this prompt..." 
                      : "Write about whatever is on your mind..."
                    }
                    className="min-h-96 resize-none bg-transparent border-0 focus:ring-0 text-base leading-relaxed"
                    autoFocus
                  />
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      {journalEntry.length} characters
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={exitWritingMode}
                      >
                        Done
                      </Button>
                      <Button
                        onClick={saveEntry}
                        disabled={!journalEntry.trim() || isSaving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Entry'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recently Saved Entries - Below Input */}
                {recentEntries.length > 0 && (
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Recently Saved</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openViewAll}
                        className="text-xs"
                      >
                        View All ({savedEntries.length})
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {recentEntries.slice(0, 3).map((entry) => (
                        <div key={entry.id} className="p-3 bg-muted/20 border rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              {entry.title && (
                                <span className="font-medium">{entry.title}</span>
                              )}
                              <Badge variant="secondary" className="text-xs capitalize">
                                {entry.entryType}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {entry.entry.length > 100 
                              ? entry.entry.substring(0, 100) + "..." 
                              : entry.entry
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* User Profile Dialog */}
        <UserProfile 
          isOpen={showUserProfile} 
          onClose={() => setShowUserProfile(false)} 
          userId={userId} 
        />
      </div>
    );
  }

  // View All mode
  if (writingMode === 'viewAll') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={exitWritingMode}
                className="group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium">Infinite Bloom</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">Reflections</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowUserProfile(true)}
              variant="ghost"
              size="sm"
              className="group"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search and Filter Area */}
        <div className="border-b bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your reflections..."
                className="pl-10"
              />
            </div>
            
            {/* Type Filter and Download Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filter by type:</span>
                </div>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="poem">Poem</SelectItem>
                    <SelectItem value="insight">Insight</SelectItem>
                    <SelectItem value="neither">Neither</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Download Section */}
              <div className="flex items-center space-x-2">
                {selectedEntries.length > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {selectedEntries.length} selected
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearAllSelections}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant={selectedEntries.length > 0 ? "default" : "outline"}
                  onClick={selectedEntries.length > 0 ? downloadSelectedEntries : selectAllEntries}
                  disabled={filteredEntries.length === 0}
                >
                  {selectedEntries.length > 0 ? (
                    <>
                      <Download className="w-3 h-3 md:mr-1" />
                      <span className="hidden md:inline">Download</span>
                    </>
                  ) : (
                    'Select All'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reflections List */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {filteredEntries.length > 0 ? (
              <div className="space-y-6">
                {filteredEntries.map((entry) => (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedEntries.includes(entry.id)}
                            onCheckedChange={() => toggleEntrySelection(entry.id)}
                          />
                          <div className="flex items-center space-x-2">
                            {entry.title && (
                              <h3 className="font-medium">{entry.title}</h3>
                            )}
                            <Badge variant="secondary" className="capitalize">
                              {entry.entryType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(entry.createdAt)}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingEntry(entry)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => initiateDelete(entry.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {entry.prompt && (
                        <div className="mb-4 p-4 bg-muted/50 rounded-md">
                          <p className="text-sm font-bold italic">
                            {entry.prompt}
                          </p>
                        </div>
                      )}
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{entry.entry}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No reflections found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'all' 
                    ? "Try adjusting your search or filter" 
                    : "Start writing to see your reflections here"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* User Profile Dialog */}
        <UserProfile 
          isOpen={showUserProfile} 
          onClose={() => setShowUserProfile(false)} 
          userId={userId} 
        />

        {/* Edit Entry Dialog */}
        <Dialog open={editingEntryId !== null} onOpenChange={(open) => !open && cancelEditing()}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Reflection</DialogTitle>
              <DialogDescription>
                Make changes to your reflection entry
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title (optional)</Label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Give your writing a title..."
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Type</Label>
                <RadioGroup 
                  value={editedType} 
                  onValueChange={(value) => setEditedType(value as 'poem' | 'insight' | 'neither')}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poem" id="edit-poem" />
                    <Label htmlFor="edit-poem">Poem</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="insight" id="edit-insight" />
                    <Label htmlFor="edit-insight">Insight</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="neither" id="edit-neither" />
                    <Label htmlFor="edit-neither">Neither</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Content</Label>
                <Textarea
                  value={editedEntry}
                  onChange={(e) => setEditedEntry(e.target.value)}
                  placeholder="Your reflection..."
                  className="min-h-64 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={saveEditedEntry} disabled={!editedEntry.trim()}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Reflection?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your reflection entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteEntry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Regular view mode
  return (
    <Card className="bg-white rounded-xl shadow-lg border-0">
      <CardContent className="p-4 md:p-8">
        <div className="space-y-4 md:space-y-6">
          {/* Random Quote Display with Line Number and Question */}
          {currentPrompt ? (
            <div className="space-y-4">
              {/* Quote from the book - Left justified */}
              {currentQuote && (
                <div className="text-left space-y-2">
                  <div className="relative pl-6">
                    <Quote className="absolute left-0 top-0 w-5 h-5 text-primary/30" />
                    <blockquote className="text-base md:text-lg italic text-foreground/90 leading-relaxed">
                      "{currentQuote}"
                    </blockquote>
                  </div>
                  
                  {/* Type and Number beneath the quote - Right justified */}
                  <div className="flex items-center justify-end gap-2 pr-6">
                    {currentLineNumber && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
                        {entryType} {currentLineNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Reflection Question */}
              <div className="pt-3 border-t border-border/50">
                <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">
                  {currentPrompt}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-center" id="action-buttons-container">
            <Button
              onClick={startResponding}
              variant="default"
              className="flex items-center space-x-2"
              id="reflect-button"
            >
              <PenTool className="w-4 h-4" />
              <span>Reflect</span>
            </Button>
            
            <Button
              onClick={clearPrompt}
              variant="outline"
              className="flex items-center space-x-2"
              id="custom-button"
            >
              <NotebookPen className="w-4 h-4" />
              <span>Custom</span>
            </Button>
            
            <Button
              onClick={generateNewPrompt}
              disabled={isGenerating}
              variant="outline"
              size="icon"
              className="w-10 h-10"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {/* View Reflections Button - Spans width of action buttons */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs"> {/* Approximate width to match the three buttons above */}
              <Button
                onClick={openViewAll}
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center space-x-2 py-4"
              >
                <span className="uppercase">View Reflections</span>
                {savedEntries.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {savedEntries.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}