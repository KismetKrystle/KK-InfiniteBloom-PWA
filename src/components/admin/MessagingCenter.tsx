import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Alert, AlertDescription } from '../ui/alert'
import { supabase, Message, UserProfile } from '../../lib/supabase'
import { Send, Reply, Trash2, RefreshCw, MessageSquare, User, Clock, Mail } from 'lucide-react'
import { useIsMobile } from '../ui/use-mobile'
import { toast } from 'sonner'

interface EmailMessage {
  id: string
  user_email: string
  subject: string
  content: string
  created_at: string
  is_replied: boolean
}

export default function MessagingCenter() {
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    loadEmailMessages()
  }, [])

  const loadEmailMessages = async () => {
    setLoading(true)
    try {
      // Mock data for email messages sent to author
      const mockEmailMessages: EmailMessage[] = [
        {
          id: '1',
          user_email: 'user1@example.com',
          subject: 'Thank you for this beautiful collection',
          content: 'I wanted to reach out and express my gratitude for "Infinite Bloom." The poem "Morning Dew" particularly resonated with me during a difficult time.',
          created_at: new Date('2024-01-20T10:30:00Z').toISOString(),
          is_replied: false
        },
        {
          id: '2',
          user_email: 'user2@example.com',
          subject: 'Question about the audio companion',
          content: 'Hi! I love the audio narrations that accompany each poem. Could you share more about your process for recording these?',
          created_at: new Date('2024-01-18T14:15:00Z').toISOString(),
          is_replied: true
        },
        {
          id: '3',
          user_email: 'user3@example.com',
          subject: 'Recommendation request',
          content: 'I\'ve read through the entire collection twice now. Do you have any recommendations for similar poetry collections I might enjoy?',
          created_at: new Date('2024-01-15T09:45:00Z').toISOString(),
          is_replied: false
        }
      ]
      
      setEmailMessages(mockEmailMessages)
      toast.success('Email messages loaded successfully')
    } catch (error) {
      console.error('Error loading email messages:', error)
      toast.error('Failed to load email messages')
    } finally {
      setLoading(false)
    }
  }

  const markAsReplied = async (messageId: string) => {
    try {
      setEmailMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_replied: true } : msg
        )
      )
      toast.success('Message marked as replied')
    } catch (error) {
      console.error('Error marking message as replied:', error)
      toast.error('Failed to mark as replied')
    }
  }

  const deleteEmailMessage = async (messageId: string) => {
    try {
      setEmailMessages(prev => prev.filter(msg => msg.id !== messageId))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
      toast.success('Message deleted')
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUnrepliedCount = () => {
    return emailMessages.filter(msg => !msg.is_replied).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Email Messages
            {getUnrepliedCount() > 0 && (
              <Badge variant="destructive" className="ml-2">
                {getUnrepliedCount()} need reply
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">Messages sent to your email address from users</p>
        </div>
        <Button onClick={loadEmailMessages} variant="outline" className="self-start sm:self-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Messages List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Messages</CardTitle>
              <CardDescription>Messages sent to your email from users</CardDescription>
            </CardHeader>
            <CardContent>
              {emailMessages.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No email messages yet. Messages from users will appear here.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {emailMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      } ${!message.is_replied ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      {isMobile ? (
                        // Mobile layout
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback>
                                  {message.user_email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {message.subject}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  From: {message.user_email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                              {!message.is_replied ? (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                  Needs Reply
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  Replied
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteEmailMessage(message.id)
                                }}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Desktop layout
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {message.user_email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">
                                  {message.subject}
                                </p>
                                {!message.is_replied ? (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                    Needs Reply
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    Replied
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                From: {message.user_email}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {message.content.substring(0, 60)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(message.created_at)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteEmailMessage(message.id)
                              }}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail & Actions */}
        <div>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {selectedMessage.subject}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(selectedMessage.created_at)}
                      <span className="ml-2">From: {selectedMessage.user_email}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Message Content:</h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Note:</strong> This message was sent to your email address. Reply directly to {selectedMessage.user_email} from your email client to respond to this message.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    {!selectedMessage.is_replied ? (
                      <Button onClick={() => markAsReplied(selectedMessage.id)}>
                        <Reply className="w-4 h-4 mr-2" />
                        Mark as Replied
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        <Reply className="w-4 h-4 mr-2" />
                        Already Replied
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}