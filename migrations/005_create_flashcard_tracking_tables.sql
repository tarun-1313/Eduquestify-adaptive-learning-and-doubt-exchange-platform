-- Create flashcard_sessions table to track user flashcard sessions
CREATE TABLE IF NOT EXISTS flashcard_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(120) NOT NULL,
    topic VARCHAR(120) NOT NULL,
    total_flashcards INT NOT NULL,
    completed_flashcards INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    session_duration_seconds INT DEFAULT 0,
    difficulty_level ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_flashcard_sessions_user_id (user_id),
    INDEX idx_flashcard_sessions_subject (subject),
    INDEX idx_flashcard_sessions_topic (topic),
    INDEX idx_flashcard_sessions_created_at (created_at),
    INDEX idx_flashcard_sessions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create flashcard_performance table to track individual flashcard performance
CREATE TABLE IF NOT EXISTS flashcard_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    subject VARCHAR(120) NOT NULL,
    topic VARCHAR(120) NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    time_spent_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES flashcard_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_flashcard_performance_session_id (session_id),
    INDEX idx_flashcard_performance_user_id (user_id),
    INDEX idx_flashcard_performance_subject (subject),
    INDEX idx_flashcard_performance_topic (topic),
    INDEX idx_flashcard_performance_created_at (created_at),
    INDEX idx_flashcard_performance_is_correct (is_correct)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create flashcard_mastery table to track user mastery levels per subject/topic
CREATE TABLE IF NOT EXISTS flashcard_mastery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(120) NOT NULL,
    topic VARCHAR(120) NOT NULL,
    mastery_level INT DEFAULT 1,
    total_flashcards_attempted INT DEFAULT 0,
    total_correct_answers INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_practice_date TIMESTAMP NULL,
    next_review_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_subject_topic (user_id, subject, topic),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_flashcard_mastery_user_id (user_id),
    INDEX idx_flashcard_mastery_subject (subject),
    INDEX idx_flashcard_mastery_topic (topic),
    INDEX idx_flashcard_mastery_mastery_level (mastery_level),
    INDEX idx_flashcard_mastery_next_review (next_review_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create flashcard_subjects table to store available flashcard subjects and topics
CREATE TABLE IF NOT EXISTS flashcard_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(120) NOT NULL,
    topic VARCHAR(120) NOT NULL,
    description TEXT,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    estimated_flashcard_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_subject_topic (subject, topic),
    INDEX idx_flashcard_subjects_subject (subject),
    INDEX idx_flashcard_subjects_topic (topic),
    INDEX idx_flashcard_subjects_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;