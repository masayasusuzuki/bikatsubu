-- Add external_link column to hero_slides table
-- This allows hero slides to link to external URLs instead of internal articles

ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS external_link text;

-- Add comment to explain the column
COMMENT ON COLUMN hero_slides.external_link IS 'External URL for the hero slide. Takes priority over article_id if both are set.';
