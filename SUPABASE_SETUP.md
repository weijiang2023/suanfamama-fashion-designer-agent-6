# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be set up (this takes a few minutes)

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" 
4. Copy your:
   - Project URL (looks like: `https://your-project-id.supabase.co`)
   - Anon/Public Key (starts with `eyJ...`)
   - JWT Secret (from Settings → API → JWT Settings)

**Important:** You'll need the JWT Secret for database configuration.

## 3. Set Up Environment Variables

1. Create a `.env` file in the `frontend` directory
2. Copy the contents from `.env.example`
3. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## 4. Set Up Database Tables

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy the contents of `supabase-schema.sql`
4. **IMPORTANT:** Replace `'your-jwt-secret'` with your actual JWT Secret from Settings → API → JWT Settings
5. Click "Run" to execute the SQL

This will create:
- `users` table for user profiles
- `collections` table for fashion collections
- `news` table for news articles
- Proper Row Level Security policies
- JWT configuration for authentication
- Sample data

### 4.1 Fix RLS Policy Issue (Important!)

If you encounter a 403 error during signup with the message "new row violates row-level security policy for table 'users'", you need to fix the INSERT policy.

Run this additional SQL command in your Supabase SQL Editor:

```sql
-- Drop the incorrect INSERT policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- Create the correct INSERT policy
CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);
```

This allows authenticated users to insert their own profile record where the `id` matches their authentication UUID.

### 4.2 Set Up Password Reset (Optional)

If you want to enable password reset functionality, run the additional SQL from `password-reset-migration.sql`:

```sql
-- This creates the password_reset_tokens table and related policies
-- Copy and paste the contents of password-reset-migration.sql
```

This adds:
- Password reset tokens table for tracking reset requests
- Proper RLS policies for security
- Cleanup function for expired tokens

## 5. Configure Email Settings

For password reset emails to work, you need to configure email settings in Supabase:

1. Go to **Settings** → **Auth** in your Supabase dashboard
2. Scroll down to **SMTP Settings**
3. Configure your email provider (Gmail, SendGrid, etc.)
4. Update the email templates if needed

## 6. Test the Integration

1. Start your development server: `npm run dev`
2. Try signing up with a new account
3. Check your Supabase dashboard:
   - Go to "Authentication" → "Users" to see the new user
   - Go to "Table Editor" → "users" to see the user profile

## 6. Verify Data Storage

After signing up and logging in, you should see:
- User authentication data in the "Authentication" section
- User profile data in the "users" table
- Real-time data updates when you interact with the app

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Make sure your environment variables are correct
2. **"Table doesn't exist"**: Run the SQL schema script in the SQL Editor
3. **"Row Level Security"**: The policies are set up to allow authenticated users to access their data

### Checking Logs:

1. Go to "Logs" in your Supabase dashboard
2. Check for any error messages
3. Look at the browser console for client-side errors

## Features Now Working:

✅ **Real User Registration**: Creates accounts in Supabase Auth
✅ **Real User Login**: Authenticates against Supabase
✅ **Data Persistence**: User profiles stored in database
✅ **Email Validation**: Checks for existing emails
✅ **Role-based Access**: Different user types (designer, buyer, customer)
✅ **Session Management**: Proper token handling
✅ **Security**: Row Level Security policies protect user data

Your login and signup forms now store real data in Supabase! 🎉