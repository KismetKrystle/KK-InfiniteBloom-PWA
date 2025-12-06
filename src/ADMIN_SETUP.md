# Infinite Bloom Admin Dashboard Setup

This document explains how to set up and use the comprehensive admin dashboard for Infinite Bloom.

## Features

The admin dashboard provides:

### ✅ Content Management
- Edit all frontend content dynamically
- Update hero section (title, subtitle, quote, main image, description)
- Modify features section (poem count, audio count, insights count, descriptions)
- Manage testimonials, products, about section, and other content
- Real-time content updates across the site

### ✅ Access Code Management  
- Generate access codes manually using email addresses
- View all access codes and their usage status
- Track which users have used which codes
- Delete unused codes
- Monitor access code statistics

### ✅ Analytics Dashboard
- Track page views, product clicks, shares, and access code usage
- View daily activity charts and event distribution
- Monitor user engagement metrics
- Real-time analytics with automatic tracking

### ✅ Two-Way Messaging System
- Users can send messages from their flipbook interface
- Admin can read, reply to, and manage all messages
- Real-time message notifications
- Message history and conversation tracking

### ✅ User Management
- View all registered users and their profiles
- Monitor device usage and limits
- Track user activity and engagement

## Setup Instructions

### 1. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from your project settings
3. Update the Supabase configuration in `/lib/supabase.ts`:
   ```typescript
   const supabaseUrl = 'https://your-project-id.supabase.co'
   const supabaseAnonKey = 'your-anon-key-here'
   ```
   
   **Important**: Replace the placeholder values with your actual Supabase credentials. The anon key is safe to use in client-side code as it only provides the access defined by your Row Level Security policies.

### 2. Database Setup

1. In your Supabase dashboard, go to the SQL editor
2. Copy and paste the entire contents of `/supabase-schema.sql`
3. Run the script to create all necessary tables and policies

### 3. Admin Account Setup

1. In Supabase, go to Authentication > Users
2. Create a new user with email: `admin@infinitebloom.com`
3. Set a secure password for the admin account
4. The admin dashboard will recognize this email as the admin user

## Accessing the Admin Dashboard

### Admin Login
- Navigate to `/admin` or `/admin/login`
- Use the admin email and password you created in Supabase
- The admin interface is completely hidden from regular users

### Dashboard Features

#### Content Management (`/admin` → Content tab)
- Edit hero section content
- Update feature numbers and descriptions
- Manage testimonials and products
- Update about section and other content
- Changes are applied immediately to the live site

#### Access Code Generation (`/admin` → Access Codes tab)
- Enter an email address
- Click "Generate Code" to create a unique 8-character code
- View all codes, their status, and usage
- Copy codes to clipboard for sharing
- Delete unused codes

#### Analytics (`/admin` → Analytics tab)
- View real-time site metrics
- Monitor page views, product clicks, and shares
- Track access code usage
- Daily activity charts and trends
- User engagement statistics

#### Messaging (`/admin` → Messages tab)
- View all user messages
- Reply to users directly
- Send new messages to any user
- Real-time message notifications
- Message history and conversation tracking

## User Features

### Messaging Interface
- Users can access messaging from their flipbook page
- Click the "Messages" button in the header
- Send messages to the admin
- View reply history and notifications
- Real-time message updates

### Analytics Tracking
- Automatic page view tracking
- Product click tracking
- Share event tracking
- Access code usage tracking
- All data flows to admin analytics dashboard

## Security Features

### Row Level Security (RLS)
- Admin-only access to sensitive data
- Users can only access their own messages and data
- Public read access only where appropriate
- Secure authentication through Supabase

### Protected Routes
- Admin dashboard requires admin authentication
- Regular users cannot access admin functions
- Protected API calls and database operations

## Customization

### Adding New Content Types
1. Add new columns to the `site_content` table
2. Create new content management forms in `ContentManager.tsx`
3. Update the frontend components to use the dynamic content

### Custom Analytics Events
1. Use the `useAnalytics` hook in any component
2. Call `trackEvent()` with custom event types
3. Update the analytics dashboard to display new metrics

### Extended Messaging Features
1. Add new message types or categories
2. Implement message attachments or rich text
3. Add user-to-user messaging capabilities

## Database Schema

The system uses the following main tables:
- `site_content` - Dynamic content management
- `access_codes` - User access code generation and tracking
- `user_profiles` - User account information and preferences
- `messages` - Two-way messaging between users and admin
- `analytics` - Event tracking and metrics
- `products` - Product information and links

## Maintenance

### Regular Tasks
- Monitor unread messages in the admin dashboard
- Review analytics for unusual activity
- Clean up old unused access codes
- Update content as needed

### Backup
- Supabase automatically backs up your data
- Export important content periodically
- Keep admin credentials secure

## Troubleshooting

### Common Issues
1. **Admin login fails**: Verify the email is exactly `admin@infinitebloom.com`
2. **Database errors**: Check if the schema was applied correctly
3. **Real-time updates not working**: Verify Supabase realtime is enabled
4. **Analytics not tracking**: Check console for JavaScript errors

### Support
- Check Supabase logs for database errors
- Use browser dev tools to debug frontend issues
- Verify environment variables are set correctly

## Production Deployment

1. Set up environment variables in your production environment
2. Ensure Supabase project is configured for production
3. Test all admin functions in staging first
4. Set up monitoring and alerting for the admin system
5. Document admin procedures for your team

The admin dashboard is now fully integrated with your Infinite Bloom application and ready for use!