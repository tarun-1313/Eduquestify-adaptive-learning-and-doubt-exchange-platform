-- Create question_bank table
CREATE TABLE IF NOT EXISTS question_bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(120) NOT NULL,
  topic VARCHAR(120) NOT NULL,
  department VARCHAR(120) NOT NULL,
  year VARCHAR(50) NOT NULL,
  num_questions INT DEFAULT 0,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_qb_subject (subject),
  INDEX idx_qb_department (department),
  INDEX idx_qb_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
