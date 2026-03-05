-- Assign unique images to catalogue offers and LMS courses
-- Usage:
-- mysql -u <user> -p <database> < server/sql/update_offer_images.sql

START TRANSACTION;

UPDATE catalogues
SET image_url = CASE slug
  WHEN 'landing-page-starter' THEN 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200'
  WHEN 'landing-page-standard' THEN 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=1200'
  WHEN 'landing-page-premium' THEN 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200'
  WHEN 'business-website-starter' THEN 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200'
  WHEN 'business-website-standard' THEN 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200'
  WHEN 'business-website-premium' THEN 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200'
  WHEN 'ecommerce-starter' THEN 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=1200'
  WHEN 'ecommerce-standard' THEN 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200'
  WHEN 'ecommerce-premium' THEN 'https://images.unsplash.com/photo-1551281044-8b4a36f4f429?w=1200'
  WHEN 'brand-identity-starter' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
  WHEN 'brand-identity-standard' THEN 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200'
  WHEN 'brand-identity-premium' THEN 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200'
  WHEN 'website-audit-report-template' THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200'
  WHEN 'brand-strategy-workbook' THEN 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200'
  WHEN 'social-media-content-pack-90' THEN 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200'
  WHEN 'proposal-invoice-contract-bundle' THEN 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200'
  WHEN 'landing-page-figma-kit' THEN 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200'
  WHEN 'monthly-growth-retainer-standard' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
  ELSE image_url
END
WHERE slug IN (
  'landing-page-starter',
  'landing-page-standard',
  'landing-page-premium',
  'business-website-starter',
  'business-website-standard',
  'business-website-premium',
  'ecommerce-starter',
  'ecommerce-standard',
  'ecommerce-premium',
  'brand-identity-starter',
  'brand-identity-standard',
  'brand-identity-premium',
  'website-audit-report-template',
  'brand-strategy-workbook',
  'social-media-content-pack-90',
  'proposal-invoice-contract-bundle',
  'landing-page-figma-kit',
  'monthly-growth-retainer-standard'
);

UPDATE lms_courses
SET image_url = CASE slug
  WHEN 'ui-ux-design-masterclass' THEN 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200'
  WHEN 'frontend-web-development-bootcamp' THEN 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200'
  WHEN 'ecommerce-website-building' THEN 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200'
  WHEN 'freelancing-and-client-acquisition' THEN 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200'
  ELSE image_url
END
WHERE slug IN (
  'ui-ux-design-masterclass',
  'frontend-web-development-bootcamp',
  'ecommerce-website-building',
  'freelancing-and-client-acquisition'
);

COMMIT;

