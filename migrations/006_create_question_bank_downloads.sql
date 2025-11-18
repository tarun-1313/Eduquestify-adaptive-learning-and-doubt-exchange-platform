-- Create question_bank_downloads table to track who downloads question banks
CREATE TABLE IF NOT EXISTS question_bank_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_bank_id INT NOT NULL,
    subject VARCHAR(120) NOT NULL,
    topic VARCHAR(120) NOT NULL,
    department VARCHAR(120),
    year VARCHAR(50),
    download_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    download_count INT DEFAULT 1,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_qb_downloads_user_id (user_id),
    INDEX idx_qb_downloads_question_bank_id (question_bank_id),
    INDEX idx_qb_downloads_subject (subject),
    INDEX idx_qb_downloads_topic (topic),
    INDEX idx_qb_downloads_department (department),
    INDEX idx_qb_downloads_download_timestamp (download_timestamp),
    
    -- Composite index for common queries
    INDEX idx_qb_downloads_user_subject (user_id, subject),
    INDEX idx_qb_downloads_user_topic (user_id, topic),
    INDEX idx_qb_downloads_subject_topic (subject, topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a unique constraint to prevent duplicate downloads in quick succession
-- This allows multiple downloads but prevents accidental rapid-click duplicates
CREATE UNIQUE INDEX idx_qb_downloads_user_bank_timestamp 
ON question_bank_downloads (user_id, question_bank_id, DATE(download_timestamp));

-- Create a view for easy reporting on download statistics
CREATE OR REPLACE VIEW question_bank_download_stats AS
SELECT 
    qbd.subject,
    qbd.topic,
    qbd.department,
    qbd.year,
    COUNT(DISTINCT qbd.user_id) as unique_downloaders,
    COUNT(*) as total_downloads,
    COUNT(*) / NULLIF(COUNT(DISTINCT qbd.user_id), 0) as avg_downloads_per_user,
    MIN(qbd.download_timestamp) as first_download,
    MAX(qbd.download_timestamp) as latest_download,
    DATE(qbd.download_timestamp) as download_date
FROM question_bank_downloads qbd
GROUP BY qbd.subject, qbd.topic, qbd.department, qbd.year, DATE(qbd.download_timestamp)
ORDER BY total_downloads DESC;

-- Create a view for user download activity
CREATE OR REPLACE VIEW user_question_bank_activity AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    qbd.subject,
    qbd.topic,
    qbd.department,
    qbd.year,
    COUNT(*) as download_count,
    MIN(qbd.download_timestamp) as first_download,
    MAX(qbd.download_timestamp) as latest_download,
    GROUP_CONCAT(DISTINCT qbd.question_bank_id ORDER BY qbd.download_timestamp DESC) as downloaded_bank_ids
FROM users u
JOIN question_bank_downloads qbd ON u.id = qbd.user_id
GROUP BY u.id, u.name, u.email, qbd.subject, qbd.topic, qbd.department, qbd.year
ORDER BY u.name, qbd.subject, qbd.topic;