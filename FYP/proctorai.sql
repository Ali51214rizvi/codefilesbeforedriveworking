-- ============================================================
--  ProctorAI - Complete Database Schema
--  Database: Proctorai
-- ============================================================

CREATE DATABASE IF NOT EXISTS Proctorai;
USE Proctorai;

-- ============================================================
-- 1. INSTITUTES
--    Registered institutes (added by super admin)
-- ============================================================
CREATE TABLE institutes (
  institute_id     INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  domain           VARCHAR(100) UNIQUE NOT NULL,       -- e.g. "uet.edu.pk"
  registration_key VARCHAR(100) UNIQUE NOT NULL,       -- secret key given to institute
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. INSTITUTE_STUDENTS  (whitelist - loaded by institute admin)
--    Student must exist here before they can sign up
-- ============================================================
CREATE TABLE institute_students (
  record_id    INT AUTO_INCREMENT PRIMARY KEY,
  institute_id INT NOT NULL,
  roll_number  VARCHAR(50) UNIQUE NOT NULL,
  full_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  program      VARCHAR(100),                           -- "BS Computer Science"
  semester     TINYINT,                                -- 1 to 8
  is_active    BOOLEAN DEFAULT FALSE,                  -- TRUE once student signs up
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(institute_id)
);

-- ============================================================
-- 3. INSTITUTE_TEACHERS  (whitelist - loaded by institute admin)
--    Teacher must exist here before they can sign up
-- ============================================================
CREATE TABLE institute_teachers (
  record_id    INT AUTO_INCREMENT PRIMARY KEY,
  institute_id INT NOT NULL,
  employee_id  VARCHAR(50) UNIQUE NOT NULL,
  full_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  department   VARCHAR(100),
  is_active    BOOLEAN DEFAULT FALSE,                  -- TRUE once teacher signs up
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(institute_id)
);

-- ============================================================
-- 4. STUDENTS  (sign up records)
-- ============================================================
CREATE TABLE students (
  student_id    INT AUTO_INCREMENT PRIMARY KEY,
  institute_id  INT NOT NULL,
  roll_number   VARCHAR(50) UNIQUE NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,                 -- bcrypt hashed
  program       VARCHAR(100),
  semester      TINYINT,
  face_enrolled BOOLEAN DEFAULT FALSE,                 -- TRUE once face_db/.pkl exists
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(institute_id)
);

-- ============================================================
-- 5. TEACHERS  (sign up records)
-- ============================================================
CREATE TABLE teachers (
  teacher_id   INT AUTO_INCREMENT PRIMARY KEY,
  institute_id INT NOT NULL,
  employee_id  VARCHAR(50) UNIQUE NOT NULL,
  full_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,                  -- bcrypt hashed
  department   VARCHAR(100),
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(institute_id)
);

-- ============================================================
-- 6. LOGIN_LOGS  (sign in records for all roles)
-- ============================================================
CREATE TABLE login_logs (
  log_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  role        ENUM('student', 'teacher', 'admin') NOT NULL,
  login_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address  VARCHAR(45),
  status      ENUM('success', 'failed') NOT NULL,
  fail_reason VARCHAR(100)                             -- "wrong password", "face mismatch", "not activated"
);

-- ============================================================
-- 7. EXAMS
--    Created by teacher, both objective and subjective
-- ============================================================
CREATE TABLE exams (
  exam_id      INT AUTO_INCREMENT PRIMARY KEY,
  institute_id INT NOT NULL,
  teacher_id   INT NOT NULL,
  title        VARCHAR(150) NOT NULL,
  subject      VARCHAR(100) NOT NULL,
  class        VARCHAR(50) NOT NULL,                   -- "10th", "11th", "BS-3"
  department   VARCHAR(100) NOT NULL,
  quiz_number  VARCHAR(50) NOT NULL,
  exam_type    ENUM('objective', 'subjective') NOT NULL,
  total_marks  DECIMAL(6,2) NOT NULL,
  total_time   INT NOT NULL,                           -- in minutes
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(institute_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);

-- ============================================================
-- 8. QUESTIONS
--    Objective: has options + correct_answer
--    Subjective: options and correct_answer are NULL
-- ============================================================
CREATE TABLE questions (
  question_id    INT AUTO_INCREMENT PRIMARY KEY,
  exam_id        INT NOT NULL,
  question_text  TEXT NOT NULL,
  option_a       VARCHAR(255),                         -- NULL for subjective
  option_b       VARCHAR(255),
  option_c       VARCHAR(255),
  option_d       VARCHAR(255),
  correct_option ENUM('A','B','C','D'),                -- NULL for subjective
  marks          DECIMAL(5,2) DEFAULT 1,
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

-- ============================================================
-- 9. EXAM_ATTEMPTS
--    One record per student per exam attempt
-- ============================================================
CREATE TABLE exam_attempts (
  attempt_id          INT AUTO_INCREMENT PRIMARY KEY,
  exam_id             INT NOT NULL,
  student_id          INT NOT NULL,
  started_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at        TIMESTAMP NULL,
  score               DECIMAL(6,2) DEFAULT 0,
  is_disqualified     BOOLEAN DEFAULT FALSE,
  disqualify_reason   VARCHAR(150),                    -- "tab switch x3", "multiple faces"
  tab_warnings        TINYINT DEFAULT 0,
  face_warnings       TINYINT DEFAULT 0,
  object_warnings     TINYINT DEFAULT 0,               -- phone/book detected
  status              ENUM('in_progress','submitted','disqualified','timed_out') DEFAULT 'in_progress',
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ============================================================
-- 10. STUDENT_ANSWERS
--     Objective: selected_option filled
--     Subjective: answer_text filled, marks_awarded filled by teacher
-- ============================================================
CREATE TABLE student_answers (
  answer_id       INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id      INT NOT NULL,
  question_id     INT NOT NULL,
  selected_option ENUM('A','B','C','D'),               -- objective only
  answer_text     TEXT,                                -- subjective only
  marks_awarded   DECIMAL(5,2) DEFAULT NULL,           -- NULL until teacher grades
  FOREIGN KEY (attempt_id) REFERENCES exam_attempts(attempt_id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

-- ============================================================
-- 11. PROCTORING_LOGS
--     Suspicious events captured during exam (from allinone.py)
-- ============================================================
CREATE TABLE proctoring_logs (
  log_id        INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id    INT NOT NULL,
  student_id    INT NOT NULL,
  event_type    ENUM(
                  'multiple_faces',
                  'no_face',
                  'look_away',
                  'phone_detected',
                  'book_detected',
                  'tab_switch',
                  'other'
                ) NOT NULL,
  event_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  screenshot    VARCHAR(255),                          -- file path or drive link
  drive_link    VARCHAR(500),
  FOREIGN KEY (attempt_id) REFERENCES exam_attempts(attempt_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ============================================================
-- 12. ATTENDANCE
--     Tracks which students appeared in each exam
-- ============================================================
CREATE TABLE attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id       INT NOT NULL,
  student_id    INT NOT NULL,
  status        ENUM('present','absent') DEFAULT 'present',
  marked_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE KEY unique_attendance (exam_id, student_id)
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Institute
INSERT INTO institutes (name, domain, registration_key)
VALUES ('University of Engineering & Technology', 'uet.edu.pk', 'UET-2024-KEY');

-- Whitelist a student
INSERT INTO institute_students (institute_id, roll_number, full_name, email, program, semester)
VALUES (1, '2021-CS-45', 'Ali Hassan', 'ali@uet.edu.pk', 'BS Computer Science', 5);

-- Whitelist a teacher
INSERT INTO institute_teachers (institute_id, employee_id, full_name, email, department)
VALUES (1, 'T-2021-001', 'Dr. Sara Khan', 'sara@uet.edu.pk', 'Computer Science');
