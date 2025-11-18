-- Create question_banks table
CREATE TABLE IF NOT EXISTS question_banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(120) NOT NULL,
  topic VARCHAR(120) NOT NULL,
  department VARCHAR(120) NOT NULL,
  year VARCHAR(50) NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  question_count INT DEFAULT 0,
  student_count INT DEFAULT 0,
  avg_performance DECIMAL(5,2) DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_qb_subject (subject),
  INDEX idx_qb_department (department),
  INDEX idx_qb_created_by (created_by),
  INDEX idx_qb_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
