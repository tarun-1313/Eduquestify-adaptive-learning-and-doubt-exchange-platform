-- Add image column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS image VARCHAR(255) NULL 
COMMENT 'URL to the user\'s profile image' 
AFTER email;
