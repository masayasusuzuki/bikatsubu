-- Set is_admin flag for all existing admin users
-- This migration grants admin privileges to authenticated users who should have admin access

-- IMPORTANT: Update the email addresses below with your actual admin user emails
-- Example:
-- UPDATE profiles SET is_admin = true WHERE email IN ('admin@example.com', 'admin2@example.com');

-- For now, we'll set all authenticated users with a profile as admin
-- This is a temporary solution. In production, you should specify exact email addresses.

-- Option 1: Set specific users as admin by email (RECOMMENDED for production)
-- Uncomment and update with your actual admin emails:
-- UPDATE profiles SET is_admin = true
-- WHERE email IN (
--   'your-admin-email@example.com',
--   'another-admin@example.com'
-- );

-- Option 2: Set all existing users as admin (FOR TESTING ONLY)
-- Uncomment the line below if you want to make all current users admins:
UPDATE profiles SET is_admin = true;

-- Option 3: Create a helper function to promote users to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles SET is_admin = true WHERE email = user_email;
END;
$$;

-- Usage example (run this after the migration):
-- SELECT promote_to_admin('admin@example.com');
