import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { MessageSquare, Send, RefreshCw, Mail, CheckCircle } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface UserMessagingProps {
  userId: string
  userEmail?: string
}

export default function UserMessaging({ userId, userEmail }: UserMessagingProps) {
  const [newMessage, setNewMessage] = useState({ subject: '', content: '' })
  const [sending, setSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  // Mock user email for demo - in real app this would come from user context/props
  const replyToEmail = userEmail || 'user@example.com'

  const sendMessage = async () => {
    if (!newMessage.subject.trim() || !newMessage.content.trim()) {
      toast.error('Please fill in both subject and message')
      return
    }

    setSending(true)
    try {
      // In a real implementation, this would send an email to the author
      // For now, we'll simulate the email sending process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setNewMessage({ subject: '', content: '' })
      setMessageSent(true)
      toast.success('Message sent to author successfully!')
      
      // Auto-close dialog after showing success
      setTimeout(() => {
        setIsOpen(false)
        setMessageSent(false)
      }, 3000)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Author
          </DialogTitle>
          <DialogDescription>
            Send a message directly to the author's email
          </DialogDescription>
        </DialogHeader>

        {messageSent ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-medium mb-2">Message Sent!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your message has been sent to the author's email. 
                They will reply directly to <strong>{replyToEmail}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                To change your reply email, update your profile settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Reply email:</strong> {replyToEmail}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Update your profile settings to change this email.
                  </span>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input
                  id="subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Message subject..."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Message</label>
                <Textarea
                  id="content"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Type your message..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={sendMessage} 
                disabled={sending || !newMessage.subject.trim() || !newMessage.content.trim()}
                className="w-full"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending to Author...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to Author
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}