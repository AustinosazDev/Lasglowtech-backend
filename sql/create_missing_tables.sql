-- Create tables that may be missing if the main dump was not fully imported.
-- Run once: mysql -u YOUR_USER -p lasglowdb < sql/create_missing_tables.sql

USE lasglowdb;

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cover VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  shares INT DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  slug VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) DEFAULT NULL,
  lastName VARCHAR(100) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  subject VARCHAR(200) DEFAULT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  status ENUM('subscribed','unsubscribed') DEFAULT 'subscribed',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL DEFAULT NULL
);
