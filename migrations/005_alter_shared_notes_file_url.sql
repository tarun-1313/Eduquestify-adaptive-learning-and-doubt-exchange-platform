-- Check if the table exists first
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'shared_notes' AND table_schema = DATABASE());

-- Only alter the table if it exists
SET @alter_sql = IF(@table_exists > 0, 
    'ALTER TABLE shared_notes MODIFY COLUMN file_url LONGTEXT;',
    'SELECT "Table shared_notes does not exist" AS message;'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;