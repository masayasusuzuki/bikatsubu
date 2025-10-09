-- Create admin login history table
CREATE TABLE admin_login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_admin_login_history_user_id ON admin_login_history(user_id);
CREATE INDEX idx_admin_login_history_login_time ON admin_login_history(login_time DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_login_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all login history
CREATE POLICY "Allow authenticated users to read login history" ON admin_login_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert their own login history
CREATE POLICY "Allow authenticated users to insert login history" ON admin_login_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);
