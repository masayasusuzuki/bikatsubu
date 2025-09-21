-- Create hero_slides table
CREATE TABLE hero_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    order_position INTEGER NOT NULL,
    article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on order_position for sorting
CREATE INDEX hero_slides_order_idx ON hero_slides(order_position);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_hero_slides_updated_at
    BEFORE UPDATE ON hero_slides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Hero slides are viewable by everyone"
ON hero_slides FOR SELECT
USING (true);

-- Create policy for admin access (full CRUD)
CREATE POLICY "Admins can manage hero slides"
ON hero_slides FOR ALL
USING (auth.role() = 'admin');

-- Insert initial data from constants
INSERT INTO hero_slides (image_url, alt_text, order_position, article_id) VALUES
('/hero/samune1.png', '美活部 - あなたのキレイを応援する美容メディア', 1, 'd660b75c-d62f-481e-8c46-3889527ecefd'),
('/hero/samune2.png', '美活部 - メイクアップ特集', 2, 'd4a59830-89c1-4974-9325-40f791a841e4'),
('https://source.unsplash.com/1200x500/?haircare,shiny,hair', 'お悩み別ヘアケア診断', 3, null);