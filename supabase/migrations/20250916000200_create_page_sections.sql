-- Create page_sections table to manage which articles appear in different sections
CREATE TABLE page_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique position per section
  UNIQUE(section_name, position)
);

-- Create index for efficient queries
CREATE INDEX idx_page_sections_section_position ON page_sections(section_name, position);
CREATE INDEX idx_page_sections_article_id ON page_sections(article_id);

-- Insert default sections with placeholder data (will be managed via admin)
INSERT INTO page_sections (section_name, position, article_id) VALUES
  -- BrandUpdates section (6 articles)
  ('brand_updates', 1, NULL),
  ('brand_updates', 2, NULL),
  ('brand_updates', 3, NULL),
  ('brand_updates', 4, NULL),
  ('brand_updates', 5, NULL),
  ('brand_updates', 6, NULL),

  -- BeautyEvents section (4 articles)
  ('beauty_events', 1, NULL),
  ('beauty_events', 2, NULL),
  ('beauty_events', 3, NULL),
  ('beauty_events', 4, NULL),

  -- ManagementTips section (3 articles)
  ('management_tips', 1, NULL),
  ('management_tips', 2, NULL),
  ('management_tips', 3, NULL),

  -- MostRead articles (2 articles)
  ('most_read', 1, NULL),
  ('most_read', 2, NULL),

  -- Hot cosmetics section (5 articles)
  ('hot_cosmetics', 1, NULL),
  ('hot_cosmetics', 2, NULL),
  ('hot_cosmetics', 3, NULL),
  ('hot_cosmetics', 4, NULL),
  ('hot_cosmetics', 5, NULL);

-- Add RLS policies
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read page sections
CREATE POLICY "Anyone can view page sections" ON page_sections FOR SELECT USING (true);

-- Only authenticated users can modify page sections (admin functionality)
CREATE POLICY "Only authenticated users can modify page sections" ON page_sections
FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_page_sections_updated_at
    BEFORE UPDATE ON page_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_page_sections_updated_at();