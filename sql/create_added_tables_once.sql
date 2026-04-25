-- One-time SQL migration for newly added tables
-- Run once:
-- mysql -u <user> -p <database_name> < server/sql/create_added_tables_once.sql

START TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('client','talent','student','learner','admin') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
  MODIFY COLUMN role ENUM('client','talent','student','learner','admin') NOT NULL DEFAULT 'client';

CREATE TABLE IF NOT EXISTS catalogues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  summary VARCHAR(400) NOT NULL,
  description TEXT,
  image_url VARCHAR(400),
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  package_tier ENUM('starter','standard','premium') NOT NULL DEFAULT 'standard',
  is_popular TINYINT(1) NOT NULL DEFAULT 0,
  features_json TEXT,
  payment_type ENUM('full','deposit') NOT NULL DEFAULT 'full',
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  is_payment_enabled TINYINT(1) NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE catalogues
  ADD COLUMN IF NOT EXISTS package_tier ENUM('starter','standard','premium') NOT NULL DEFAULT 'standard';

ALTER TABLE catalogues
  ADD COLUMN IF NOT EXISTS is_popular TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE catalogues
  ADD COLUMN IF NOT EXISTS features_json TEXT NULL;

CREATE TABLE IF NOT EXISTS service_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  catalogue_id INT NULL,
  service_slug VARCHAR(220) NOT NULL,
  service_name VARCHAR(220) NOT NULL,
  customer_name VARCHAR(180) NOT NULL,
  email VARCHAR(190) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  payment_type ENUM('full','deposit') NOT NULL DEFAULT 'full',
  status ENUM('initiated','pending','paid','failed','cancelled') NOT NULL DEFAULT 'initiated',
  tx_ref VARCHAR(220) NOT NULL UNIQUE,
  flutterwave_tx_id VARCHAR(120),
  flutterwave_ref VARCHAR(180),
  payment_link VARCHAR(400),
  invoice_number VARCHAR(120),
  invoice_sent_at DATETIME NULL,
  email_notification_status ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending',
  email_notification_error VARCHAR(500),
  invoice_email_status ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending',
  invoice_email_error VARCHAR(500),
  paid_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(120) NULL;

ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS invoice_sent_at DATETIME NULL;

ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS email_notification_status ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending';

ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS email_notification_error VARCHAR(500) NULL;

ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS invoice_email_status ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending';

ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS invoice_email_error VARCHAR(500) NULL;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NULL,
  tx_ref VARCHAR(220) NOT NULL UNIQUE,
  flutterwave_tx_id VARCHAR(120),
  flutterwave_ref VARCHAR(180),
  gateway_status VARCHAR(50),
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  payload_json LONGTEXT,
  verified_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lms_courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  summary VARCHAR(420) NOT NULL,
  description TEXT,
  level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  duration_weeks INT NOT NULL DEFAULT 4,
  image_url VARCHAR(400),
  brochure_url VARCHAR(500),
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE lms_courses
  ADD COLUMN IF NOT EXISTS brochure_url VARCHAR(500) NULL AFTER image_url;

CREATE TABLE IF NOT EXISTS lms_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(220) NOT NULL,
  module_order INT NOT NULL DEFAULT 1,
  duration_minutes INT NOT NULL DEFAULT 0,
  resource_url VARCHAR(400),
  slide_url VARCHAR(500),
  video_url VARCHAR(500),
  module_content LONGTEXT,
  reference_links_json LONGTEXT,
  is_preview TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE lms_modules
  ADD COLUMN IF NOT EXISTS slide_url VARCHAR(500) NULL;

ALTER TABLE lms_modules
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) NULL;

ALTER TABLE lms_modules
  ADD COLUMN IF NOT EXISTS module_content LONGTEXT NULL;

ALTER TABLE lms_modules
  ADD COLUMN IF NOT EXISTS reference_links_json LONGTEXT NULL;

CREATE TABLE IF NOT EXISTS lms_enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  status ENUM('active','completed','paused') NOT NULL DEFAULT 'active',
  progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  certificate_code VARCHAR(120),
  certificate_sent_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_course (user_id, course_id)
);

ALTER TABLE lms_enrollments
  ADD COLUMN IF NOT EXISTS certificate_code VARCHAR(120) NULL;

ALTER TABLE lms_enrollments
  ADD COLUMN IF NOT EXISTS certificate_sent_at DATETIME NULL;

CREATE TABLE IF NOT EXISTS lms_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  module_id INT NOT NULL,
  is_completed TINYINT(1) NOT NULL DEFAULT 0,
  last_position_seconds INT NOT NULL DEFAULT 0,
  completed_at DATETIME NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_enrollment_module (enrollment_id, module_id)
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bulk_email_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(250) NOT NULL,
  body_html LONGTEXT,
  total_recipients INT NOT NULL DEFAULT 0,
  total_sent INT NOT NULL DEFAULT 0,
  total_failed INT NOT NULL DEFAULT 0,
  created_by VARCHAR(190),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bulk_email_recipients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  email VARCHAR(190) NOT NULL,
  status ENUM('sent','failed') NOT NULL DEFAULT 'sent',
  error_message VARCHAR(500),
  sent_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  full_name VARCHAR(180) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  skill_interest VARCHAR(160) NOT NULL,
  learning_goal TEXT NOT NULL,
  experience_level VARCHAR(80),
  availability VARCHAR(80),
  city VARCHAR(120),
  country VARCHAR(120),
  portfolio_url VARCHAR(300),
  picture_url VARCHAR(400),
  status ENUM('new','reviewing','accepted','waitlist','rejected') NOT NULL DEFAULT 'new',
  access_token VARCHAR(120),
  fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_status ENUM('unpaid','part_paid','paid','waived') NOT NULL DEFAULT 'unpaid',
  follow_up_date DATE,
  cohort VARCHAR(120),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE career_applications
  ADD COLUMN IF NOT EXISTS user_id INT NULL;

ALTER TABLE career_applications
  ADD COLUMN IF NOT EXISTS access_token VARCHAR(120) NULL;

ALTER TABLE career_applications
  ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0;

ALTER TABLE career_applications
  ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid','part_paid','paid','waived') NOT NULL DEFAULT 'unpaid';

ALTER TABLE career_applications
  ADD COLUMN IF NOT EXISTS follow_up_date DATE NULL;

ALTER TABLE career_applications
  ADD COLUMN IF NOT EXISTS cohort VARCHAR(120) NULL;

ALTER TABLE career_applications
  ADD COLUMN IF NOT EXISTS admin_notes TEXT NULL;

COMMIT;
