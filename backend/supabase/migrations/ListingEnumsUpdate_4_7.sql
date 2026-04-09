-- Create enums type
CREATE TYPE listing_category AS ENUM ('shoes', 'shirts', 'jacket', 'pants', 'accessory', 'other');

-- Make sure current listings match new enum accepted type
UPDATE listings
SET category = 'shoes';

-- Update listing to have enums for category
ALTER TABLE listings
ALTER COLUMN category TYPE listing_category
USING category::listing_category;