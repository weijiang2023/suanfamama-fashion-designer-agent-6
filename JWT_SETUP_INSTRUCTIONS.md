# JWT Signing Keys Setup for Supabase

## What are JWT Signing Keys?

JWT (JSON Web Token) signing keys are used to sign and verify tokens for authentication. In Supabase, these keys ensure that tokens are authentic and haven't been tampered with.

## How to Get Your JWT Secret

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll down to **JWT Settings**
4. Copy the **JWT Secret** (it's a long string)

## Update Database Configuration

In your `supabase-schema.sql` file, replace:

```sql
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';
```

With your actual JWT secret:

```sql
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-actual-jwt-secret-here';
```

## Why This Is Important

- **Authentication Security**: Ensures tokens are properly signed and verified
- **RLS Policies**: Row Level Security policies use JWT claims to determine user permissions
- **API Access**: Proper JWT configuration is required for API authentication

## Verification

After setting up the JWT secret, you can verify it's working by:

1. Signing up a new user
2. Checking that the authentication works properly
3. Verifying that RLS policies are enforced correctly

## Common Issues

### Issue: "JWT verification failed"
**Solution**: Make sure you've replaced the placeholder JWT secret with your actual secret from the Supabase dashboard.

### Issue: "RLS policies not working"
**Solution**: Ensure the JWT secret is properly configured in the database using the ALTER DATABASE command.

### Issue: "Authentication tokens invalid"
**Solution**: Check that your frontend is using the correct Supabase URL and anon key that match the JWT secret.

## Security Notes

- **Never commit JWT secrets to version control**
- **Use environment variables for sensitive data**
- **Rotate JWT secrets periodically for security**
- **Keep JWT secrets secure and private**

## Environment Variables

Make sure your `.env` file includes:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
# Note: JWT secret is configured in the database, not in frontend env vars
```

The JWT secret is configured on the database side and doesn't need to be in your frontend environment variables.