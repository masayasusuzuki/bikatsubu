-- Check if hot_cosmetics sections exist
SELECT * FROM page_sections WHERE section_name = 'hot_cosmetics' ORDER BY position;

-- If no results, insert the hot_cosmetics sections
INSERT INTO page_sections (section_name, position, article_id)
SELECT 'hot_cosmetics', position, NULL
FROM generate_series(1, 5) AS position
WHERE NOT EXISTS (
    SELECT 1 FROM page_sections
    WHERE section_name = 'hot_cosmetics' AND page_sections.position = position
);

-- Verify the insertion
SELECT * FROM page_sections WHERE section_name = 'hot_cosmetics' ORDER BY position;