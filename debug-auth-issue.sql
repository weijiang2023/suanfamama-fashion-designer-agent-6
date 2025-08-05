-- Debug script to check auth user creation and foreign key constraints

-- 1. Check if the auth.users table exists and has data
SELECT 'auth.users table check' as check_type, count(*) as count FROM auth.users;

-- 2. Check the foreign key constraint on users table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='users'
    AND tc.table_schema='public';

-- 3. Check current users table structure
\d public.users;

-- 4. Alternative: Temporarily disable the foreign key constraint for testing
-- UNCOMMENT ONLY IF NEEDED FOR TESTING:
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 5. Alternative: Recreate the constraint with DEFERRABLE option
-- UNCOMMENT ONLY IF NEEDED:
-- ALTER TABLE public.users 
-- ADD CONSTRAINT users_id_fkey 
-- FOREIGN KEY (id) REFERENCES auth.users(id) 
-- ON DELETE CASCADE 
-- DEFERRABLE INITIALLY DEFERRED;