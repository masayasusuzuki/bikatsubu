-- Create activity logs table for tracking user operations
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish', 'unpublish'
  target_type TEXT NOT NULL, -- 'article', 'page_section', 'hero_slide'
  target_id UUID,
  target_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX activity_logs_created_at_idx ON activity_logs(created_at DESC);
CREATE INDEX activity_logs_operation_type_idx ON activity_logs(operation_type);
CREATE INDEX activity_logs_target_type_idx ON activity_logs(target_type);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all activity logs
CREATE POLICY "Authenticated users can view activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert their own activity logs
CREATE POLICY "Authenticated users can insert activity logs"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
