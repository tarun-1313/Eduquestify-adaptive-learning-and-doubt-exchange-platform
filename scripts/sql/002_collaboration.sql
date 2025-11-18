-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  subject VARCHAR(120),
  tags JSON,
  visibility ENUM('public','private') DEFAULT 'public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_notes_user (user_id),
  INDEX idx_notes_subject (subject)
);

-- Doubts (threads)
CREATE TABLE IF NOT EXISTS doubts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  subject VARCHAR(120),
  status ENUM('open','resolved') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_doubts_user (user_id),
  INDEX idx_doubts_subject (subject),
  INDEX idx_doubts_status (status)
);

-- Doubt messages
CREATE TABLE IF NOT EXISTS doubt_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  doubt_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dm_doubt (doubt_id)
);

-- Question bank
CREATE TABLE IF NOT EXISTS question_bank (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_by BIGINT NOT NULL,
  subject VARCHAR(120) NOT NULL,
  question TEXT NOT NULL,
  options JSON,
  answer VARCHAR(255) NOT NULL,
  difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qb_subject (subject),
  INDEX idx_qb_difficulty (difficulty)
);
