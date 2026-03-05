-- Lasglowtech core tables for auth + catalogues
-- Run with:
-- mysql -u <user> -p <database_name> < server/sql/create_tables.sql

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('client','admin') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catalogues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  summary VARCHAR(400) NOT NULL,
  description TEXT,
  image_url VARCHAR(400),
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_type ENUM('full','deposit') NOT NULL DEFAULT 'full',
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  is_payment_enabled TINYINT(1) NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO catalogues
  (title, slug, summary, description, image_url, price, payment_type, currency, is_payment_enabled, is_published, sort_order)
SELECT * FROM (
  SELECT
    'Web Development',
    'web-development',
    'High-performance websites and web applications for serious growth.',
    'Custom websites, company platforms, and frontend/backend engineering delivery.',
    '',
    150000,
    'deposit',
    'NGN',
    1,
    1,
    1
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM catalogues WHERE slug = 'web-development');

INSERT INTO catalogues
  (title, slug, summary, description, image_url, price, payment_type, currency, is_payment_enabled, is_published, sort_order)
SELECT * FROM (
  SELECT
    'Mobile Development',
    'mobile-apps',
    'Cross-platform mobile apps with stable architecture and polished UI.',
    'React Native and Flutter builds for startups and enterprise teams.',
    '',
    250000,
    'deposit',
    'NGN',
    1,
    1,
    2
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM catalogues WHERE slug = 'mobile-apps');

INSERT INTO catalogues
  (title, slug, summary, description, image_url, price, payment_type, currency, is_payment_enabled, is_published, sort_order)
SELECT * FROM (
  SELECT
    'UI/UX Design',
    'ui-ux-design',
    'Research-backed interface design and product prototypes.',
    'Design systems, user flows, and high-fidelity screens with usability depth.',
    '',
    80000,
    'full',
    'NGN',
    1,
    1,
    3
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM catalogues WHERE slug = 'ui-ux-design');

INSERT INTO catalogues
  (title, slug, summary, description, image_url, price, payment_type, currency, is_payment_enabled, is_published, sort_order)
SELECT * FROM (
  SELECT
    'Graphic Design',
    'graphic-design',
    'Brand visuals and campaign assets that stand out in crowded markets.',
    'Logos, social media graphics, flyers, and publication-ready assets.',
    '',
    50000,
    'full',
    'NGN',
    1,
    1,
    4
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM catalogues WHERE slug = 'graphic-design');
