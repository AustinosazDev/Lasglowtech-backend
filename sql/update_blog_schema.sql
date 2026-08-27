-- Update blog schema to match blog.md specifications
-- This enhances the existing posts table while preserving existing data
-- Run with: mysql -u YOUR_USER -p lasglowdb < server/sql/update_blog_schema.sql

USE lasglowdb;

-- First, let's check if the new columns already exist to avoid errors
SET @column_exists = 0;

-- Check if excerpt column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'excerpt';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN excerpt VARCHAR(200) DEFAULT NULL AFTER title',
    'SELECT "excerpt column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if category column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'category';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN category ENUM("Design", "Web & Mobile Development", "Latest Tech Trends", "Branding & Marketing", "Business & Startups", "Case Studies", "Company News") DEFAULT "Company News" AFTER excerpt',
    'SELECT "category column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if status column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'status';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN status ENUM("draft", "published") DEFAULT "draft" AFTER category',
    'SELECT "status column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if author_name column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'author_name';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN author_name VARCHAR(100) DEFAULT NULL AFTER status',
    'SELECT "author_name column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if author_avatar column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'author_avatar';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN author_avatar VARCHAR(255) DEFAULT NULL AFTER author_name',
    'SELECT "author_avatar column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if created_at column exists (if not, rename timestamp to created_at)
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'created_at';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts CHANGE COLUMN timestamp created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT "created_at column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if updated_at column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'updated_at';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
    'SELECT "updated_at column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if published_at column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'published_at';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN published_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at',
    'SELECT "published_at column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if view_count column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'view_count';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN view_count INT DEFAULT 0 AFTER published_at',
    'SELECT "view_count column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if likes_count column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'likes_count';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN likes_count INT DEFAULT 0 AFTER view_count',
    'SELECT "likes_count column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if comments_count column exists
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'comments_count';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts ADD COLUMN comments_count INT DEFAULT 0 AFTER likes_count',
    'SELECT "comments_count column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename cover column to thumbnail for consistency
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lasglowdb' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'thumbnail';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE posts CHANGE COLUMN cover thumbnail VARCHAR(255) NOT NULL',
    'SELECT "thumbnail column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make slug unique and required
ALTER TABLE posts MODIFY COLUMN slug VARCHAR(255) NOT NULL UNIQUE;

-- Set existing posts to published status if they don't have a status
UPDATE posts SET status = 'published' WHERE status IS NULL OR status = '';

-- Create blog_likes table
CREATE TABLE IF NOT EXISTS blog_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  anonymous_fingerprint VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (post_id, user_id, anonymous_fingerprint)
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create newsletter_subscribers table (enhanced version of email_subscriptions)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  active TINYINT(1) DEFAULT 1,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL DEFAULT NULL
);

-- Update existing email_subscriptions to match new structure if needed
INSERT IGNORE INTO newsletter_subscribers (email, active, subscribed_at)
SELECT email, 
       CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END,
       subscribed_at 
FROM email_subscriptions;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON blog_likes(post_id);

-- Update existing posts to have default excerpt from content (first 200 chars)
UPDATE posts 
SET excerpt = SUBSTRING(REPLACE(content, '<[^>]+>', ''), 1, 200)
WHERE excerpt IS NULL OR excerpt = '';

SELECT 'Blog schema update completed successfully!' AS message;