-- Add featured_image_alt column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image_alt TEXT;

-- Add comment to the column
COMMENT ON COLUMN articles.featured_image_alt IS 'Alt text for the featured image (for SEO and accessibility)';
