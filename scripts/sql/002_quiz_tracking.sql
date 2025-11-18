-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  completed_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_quizzes (user_id, subject, topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  user_id INT PRIMARY KEY,
  level INT NOT NULL DEFAULT 1,
  total_xp INT NOT NULL DEFAULT 0,
  xp_to_next_level INT NOT NULL DEFAULT 1000,
  last_activity DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Subject Mastery
CREATE TABLE IF NOT EXISTS subject_mastery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  mastery_level INT NOT NULL DEFAULT 1,
  quizzes_taken INT NOT NULL DEFAULT 0,
  average_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  last_quiz_date DATETIME,
  UNIQUE KEY unique_user_subject (user_id, subject),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
