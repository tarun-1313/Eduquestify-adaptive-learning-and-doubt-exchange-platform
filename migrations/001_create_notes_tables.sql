CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                  -- To link notes to a specific user
    title VARCHAR(255) NOT NULL,           -- The "Chapter Name" (e.g., "Physics Chapter 3...")
    description TEXT,                      -- The small description
    subject VARCHAR(100) NOT NULL,         -- The subject (e.g., "Physics", "History")
    
    file_path VARCHAR(1024) NOT NULL,      -- The path on the server (e.g., "/var/www/uploads/user_5/note_abc123.pdf")
    original_filename VARCHAR(255),    -- The original name (e.g., "my-notes.pdf")
    file_mime_type VARCHAR(100),       -- e.g., "application/pdf" or "image/png"
    file_size_bytes INT,                   -- The file size in bytes
    
    views_count INT DEFAULT 0,             -- For the eye icon
    likes_count INT DEFAULT 0,             -- For the heart icon (if you add it)
    comments_count INT DEFAULT 0,          -- For the comment icon
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- The date displayed on the card
    
    FOREIGN KEY (user_id) REFERENCES users(id) -- Assumes you have a 'users' table
);