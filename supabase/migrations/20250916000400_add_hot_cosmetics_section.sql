-- Add hot cosmetics section to page_sections table
INSERT INTO page_sections (section_name, position, article_id) VALUES
  -- Hot cosmetics section (5 articles)
  ('hot_cosmetics', 1, NULL),
  ('hot_cosmetics', 2, NULL),
  ('hot_cosmetics', 3, NULL),
  ('hot_cosmetics', 4, NULL),
  ('hot_cosmetics', 5, NULL)
ON CONFLICT (section_name, position) DO NOTHING;