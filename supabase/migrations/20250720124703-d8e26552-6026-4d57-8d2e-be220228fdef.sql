-- Create users table with the same structure as current User interface
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  status TEXT CHECK (status IN ('Live', 'Off')) DEFAULT 'Live',
  expire_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (for now, allow all authenticated users)
-- You can make this more restrictive later
CREATE POLICY "Allow all operations for authenticated users" 
ON public.users 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Enable realtime for the users table
ALTER TABLE public.users REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (you can change this password later)
INSERT INTO public.users (email, password, status, expire_time) 
VALUES ('admin@netflix.com', 'admin123', 'Live', '2025-12-31T23:59:59Z');