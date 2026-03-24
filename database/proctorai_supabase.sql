-- ============================================================
--  ProctorAI - Complete Database Schema
--  PostgreSQL / Supabase Compatible
-- ============================================================

-- ============================================================
-- 1. INSTITUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS institutes (
  institute_id     SERIAL PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  domain           VARCHAR(100) UNIQUE NOT NULL,
  registration_key VARCHAR(100) UNIQUE NOT NULL,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. INSTITUTE_STUDENTS (whitelist)
-- ============================================================
CREATE TABLE IF NOT EXISTS institute_students (
  record_id    SERIAL PRIMARY KEY,
  institute_id INT NOT NULL REFERENCES institutes(institute_id),
  roll_number  VARCHAR(50) UNIQUE NOT NULL,
  full_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  program      VARCHAR(100),
  semester     SMALLINT,
  is_active    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INSTITUTE_TEACHERS (whitelist)
-- ============================================================
CREATE TABLE IF NOT EXISTS institute_teachers (
  record_id    SERIAL PRIMARY KEY,
  institute_id INT NOT NULL REFERENCES institutes(institute_id),
  employee_id  VARCHAR(50) UNIQUE NOT NULL,
  full_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  department   VARCHAR(100),
  is_active    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. STUDENTS (sign up records)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  student_id    SERIAL PRIMARY KEY,
  institute_id  INT NOT NULL REFERENCES institutes(institute_id),
  roll_number   VARCHAR(50) UNIQUE NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  program       VARCHAR(100),
  semester      SMALLINT,
  face_enrolled BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. TEACHERS (sign up records)
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
  teacher_id   SERIAL PRIMARY KEY,
  institute_id INT NOT NULL REFERENCES institutes(institute_id),
  employee_id  VARCHAR(50) UNIQUE NOT NULL,
  full_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  department   VARCHAR(100),
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. LOGIN_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS login_logs (
  log_id      SERIAL PRIMARY KEY,
  user_id     INT NOT NULL,
  role        VARCHAR(10) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  login_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address  VARCHAR(45),
  status      VARCHAR(10) NOT NULL CHECK (status IN ('success', 'failed')),
  fail_reason VARCHAR(100)
);

-- ============================================================
-- 7. EXAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  exam_id      SERIAL PRIMARY KEY,
  institute_id INT NOT NULL REFERENCES institutes(institute_id),
  teacher_id   INT NOT NULL REFERENCES teachers(teacher_id),
  title        VARCHAR(150) NOT NULL,
  subject      VARCHAR(100) NOT NULL,
  class        VARCHAR(50) NOT NULL,
  department   VARCHAR(100) NOT NULL,
  quiz_number  VARCHAR(50) NOT NULL,
  exam_type    VARCHAR(15) NOT NULL CHECK (exam_type IN ('objective', 'subjective')),
  total_marks  DECIMAL(6,2) NOT NULL,
  total_time   INT NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  question_id    SERIAL PRIMARY KEY,
  exam_id        INT NOT NULL REFERENCES exams(exam_id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  option_a       VARCHAR(255),
  option_b       VARCHAR(255),
  option_c       VARCHAR(255),
  option_d       VARCHAR(255),
  correct_option VARCHAR(1) CHECK (correct_option IN ('A','B','C','D')),
  marks          DECIMAL(5,2) DEFAULT 1
);

-- ============================================================
-- 9. EXAM_ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_attempts (
  attempt_id        SERIAL PRIMARY KEY,
  exam_id           INT NOT NULL REFERENCES exams(exam_id),
  student_id        INT NOT NULL REFERENCES students(student_id),
  started_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at      TIMESTAMP,
  score             DECIMAL(6,2) DEFAULT 0,
  is_disqualified   BOOLEAN DEFAULT FALSE,
  disqualify_reason VARCHAR(150),
  tab_warnings      SMALLINT DEFAULT 0,
  face_warnings     SMALLINT DEFAULT 0,
  object_warnings   SMALLINT DEFAULT 0,
  status            VARCHAR(15) DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','disqualified','timed_out'))
);

-- ============================================================
-- 10. STUDENT_ANSWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS student_answers (
  answer_id       SERIAL PRIMARY KEY,
  attempt_id      INT NOT NULL REFERENCES exam_attempts(attempt_id) ON DELETE CASCADE,
  question_id     INT NOT NULL REFERENCES questions(question_id),
  selected_option VARCHAR(1) CHECK (selected_option IN ('A','B','C','D')),
  answer_text     TEXT,
  marks_awarded   DECIMAL(5,2) DEFAULT NULL
);

-- ============================================================
-- 11. PROCTORING_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS proctoring_logs (
  log_id      SERIAL PRIMARY KEY,
  attempt_id  INT NOT NULL REFERENCES exam_attempts(attempt_id),
  student_id  INT NOT NULL REFERENCES students(student_id),
  event_type  VARCHAR(20) NOT NULL CHECK (event_type IN (
                'multiple_faces','no_face','look_away',
                'phone_detected','book_detected','tab_switch','other'
              )),
  event_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  screenshot  VARCHAR(255),
  drive_link  VARCHAR(500)
);

-- ============================================================
-- 12. ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id SERIAL PRIMARY KEY,
  exam_id       INT NOT NULL REFERENCES exams(exam_id),
  student_id    INT NOT NULL REFERENCES students(student_id),
  status        VARCHAR(10) DEFAULT 'present' CHECK (status IN ('present','absent')),
  marked_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (exam_id, student_id)
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================
INSERT INTO institutes (name, domain, registration_key)
VALUES ('University of Engineering & Technology', 'uet.edu.pk', 'UET-2024-KEY')
ON CONFLICT DO NOTHING;

INSERT INTO institute_students (institute_id, roll_number, full_name, email, program, semester)
VALUES (1, '2021-CS-45', 'Ali Hassan', 'ali@uet.edu.pk', 'BS Computer Science', 5)
ON CONFLICT DO NOTHING;

INSERT INTO institute_teachers (institute_id, employee_id, full_name, email, department)
VALUES (1, 'T-2021-001', 'Dr. Sara Khan', 'sara@uet.edu.pk', 'Computer Science')
ON CONFLICT DO NOTHING;
