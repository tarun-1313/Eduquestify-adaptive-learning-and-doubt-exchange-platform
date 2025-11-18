-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  subject VARCHAR(120) NOT NULL,
  topic VARCHAR(120),
  difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
  score INT NOT NULL,
  total_questions INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qa_user (user_id),
  INDEX idx_qa_subject (subject),
  INDEX idx_qa_completed (completed_at)
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  user_id BIGINT PRIMARY KEY,
  level INT DEFAULT 1,
  total_xp INT DEFAULT 0,
  xp_to_next_level INT DEFAULT 1000,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subject Mastery
CREATE TABLE IF NOT EXISTS subject_mastery (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  subject VARCHAR(120) NOT NULL,
  mastery_level INT DEFAULT 1,
  quizzes_taken INT DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  last_quiz_date TIMESTAMP NULL,
  UNIQUE KEY uk_user_subject (user_id, subject),
  INDEX idx_sm_user (user_id),
  INDEX idx_sm_subject (subject),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
