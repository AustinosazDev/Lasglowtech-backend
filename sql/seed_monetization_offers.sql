-- Seed catalogue offers and LMS courses/modules for monetization
-- Safe to run multiple times (uses slug uniqueness + conditional module insert)
-- Usage:
-- mysql -u <user> -p <database> < server/sql/seed_monetization_offers.sql

START TRANSACTION;

INSERT INTO catalogues
  (title, slug, summary, description, image_url, price, package_tier, is_popular, features_json, payment_type, currency, is_payment_enabled, is_published, sort_order)
VALUES
  (
    'Landing Page Package - Starter',
    'landing-page-starter',
    'Single high-converting landing page for campaign launches.',
    'A focused landing page with responsive design, CTA optimization, analytics setup, and basic on-page SEO.',
    '',
    120000,
    'starter',
    0,
    '["1 responsive page","Lead capture form","CTA optimization","Basic SEO setup","Analytics integration"]',
    'deposit',
    'NGN',
    1,
    1,
    10
  ),
  (
    'Landing Page Package - Standard',
    'landing-page-standard',
    'Enhanced landing page with richer sections and stronger conversion structure.',
    'Includes strategy call, conversion-focused layout, trust sections, optimization pass, and deployment support.',
    '',
    220000,
    'standard',
    1,
    '["Conversion strategy call","Advanced sections","Trust and testimonial blocks","Performance optimization","Deployment support"]',
    'deposit',
    'NGN',
    1,
    1,
    11
  ),
  (
    'Landing Page Package - Premium',
    'landing-page-premium',
    'Premium campaign landing experience with full optimization stack.',
    'Includes full design system approach, copy guidance, integrations, QA, and post-launch performance review.',
    '',
    380000,
    'premium',
    0,
    '["Premium UI/UX","Copy structure support","CRM integration","Cross-device QA","Post-launch review"]',
    'deposit',
    'NGN',
    1,
    1,
    12
  ),
  (
    'Business Website Package - Starter',
    'business-website-starter',
    'Professional multi-page business website for growing brands.',
    'Company profile website with key pages, contact forms, performance optimization, and CMS handover.',
    '',
    250000,
    'starter',
    0,
    '["Up to 5 pages","Contact forms","CMS setup","Performance optimization","Basic training"]',
    'deposit',
    'NGN',
    1,
    1,
    20
  ),
  (
    'Business Website Package - Standard',
    'business-website-standard',
    'Conversion-focused website with stronger information architecture.',
    'Includes additional pages, content structuring, improved SEO setup, and stakeholder handover.',
    '',
    450000,
    'standard',
    1,
    '["Up to 10 pages","Improved site architecture","SEO-ready pages","Enhanced contact workflow","Handover support"]',
    'deposit',
    'NGN',
    1,
    1,
    21
  ),
  (
    'Business Website Package - Premium',
    'business-website-premium',
    'High-performance business platform for serious growth.',
    'Comprehensive build with advanced integrations, custom modules, scalability considerations, and launch support.',
    '',
    850000,
    'premium',
    0,
    '["Custom modules","Integrations","Scalable architecture","Technical SEO baseline","Launch support"]',
    'deposit',
    'NGN',
    1,
    1,
    22
  ),
  (
    'E-commerce Website Package - Starter',
    'ecommerce-starter',
    'Launch-ready online store for small catalogues.',
    'Store setup with product listing structure, checkout configuration, payment integration, and admin guide.',
    '',
    400000,
    'starter',
    0,
    '["Store setup","Product catalogue structure","Checkout flow","Payment integration","Admin training"]',
    'deposit',
    'NGN',
    1,
    1,
    30
  ),
  (
    'E-commerce Website Package - Standard',
    'ecommerce-standard',
    'Revenue-focused e-commerce setup with stronger user journey.',
    'Includes merchandising layout, sales funnel setup, discount logic, and conversion analytics.',
    '',
    750000,
    'standard',
    1,
    '["Advanced product pages","Merchandising setup","Discount configuration","Sales funnel setup","Analytics tracking"]',
    'deposit',
    'NGN',
    1,
    1,
    31
  ),
  (
    'E-commerce Website Package - Premium',
    'ecommerce-premium',
    'Enterprise-grade commerce platform with deeper automation.',
    'Includes advanced flows, integrations, automation opportunities, and launch growth support.',
    '',
    1350000,
    'premium',
    0,
    '["Advanced checkout flows","Automation support","Third-party integrations","Performance and security hardening","Growth support"]',
    'deposit',
    'NGN',
    1,
    1,
    32
  ),
  (
    'Brand Identity Package - Starter',
    'brand-identity-starter',
    'Core brand identity kit for new businesses.',
    'Logo suite, color palette, typography set, and quick usage guide.',
    '',
    150000,
    'starter',
    0,
    '["Primary and secondary logo","Color palette","Typography guidance","Quick usage guide"]',
    'full',
    'NGN',
    1,
    1,
    40
  ),
  (
    'Brand Identity Package - Standard',
    'brand-identity-standard',
    'Comprehensive identity package for serious positioning.',
    'Includes refined identity system, social templates, and extended usage guide.',
    '',
    300000,
    'standard',
    0,
    '["Logo variants","Brand color and type system","Social media templates","Extended usage guide"]',
    'full',
    'NGN',
    1,
    1,
    41
  ),
  (
    'Brand Identity Package - Premium',
    'brand-identity-premium',
    'Premium brand system for scale-ready businesses.',
    'Strategic identity direction, visual language system, templates, and brand governance guide.',
    '',
    550000,
    'premium',
    1,
    '["Strategic direction","Complete visual language","Template system","Brand governance guide"]',
    'full',
    'NGN',
    1,
    1,
    42
  ),
  (
    'Website Audit Report Template',
    'website-audit-report-template',
    'Professional website audit document template.',
    'Editable template for technical, UX, and conversion reviews.',
    '',
    15000,
    'starter',
    0,
    '["Editable template","Audit checklist","Report structure","Action summary format"]',
    'full',
    'NGN',
    1,
    1,
    50
  ),
  (
    'Brand Strategy Workbook',
    'brand-strategy-workbook',
    'Practical workbook for building clear brand strategy.',
    'Guided exercises for positioning, audience mapping, messaging, and brand voice.',
    '',
    20000,
    'standard',
    0,
    '["Positioning worksheets","Audience mapping","Messaging framework","Brand voice prompts"]',
    'full',
    'NGN',
    1,
    1,
    51
  ),
  (
    'Social Media Content Pack (90 Designs)',
    'social-media-content-pack-90',
    'Ready-to-edit social design pack for marketing teams.',
    '90 editable social design layouts across key marketing scenarios.',
    '',
    25000,
    'standard',
    0,
    '["90 design templates","Editable source files","Campaign-ready formats","Quick brand customization"]',
    'full',
    'NGN',
    1,
    1,
    52
  ),
  (
    'Proposal, Invoice and Contract Bundle',
    'proposal-invoice-contract-bundle',
    'Client operations bundle for freelancers and agencies.',
    'Editable templates to streamline onboarding and billing workflows.',
    '',
    18000,
    'starter',
    0,
    '["Proposal template","Invoice template","Contract template","Onboarding checklist"]',
    'full',
    'NGN',
    1,
    1,
    53
  ),
  (
    'Landing Page Figma UI Kit',
    'landing-page-figma-kit',
    'Modern Figma kit for faster page design and delivery.',
    'Reusable components, sections, and responsive variants for campaign pages.',
    '',
    30000,
    'premium',
    0,
    '["Figma components","Responsive variants","Reusable sections","Quick-start style guide"]',
    'full',
    'NGN',
    1,
    1,
    54
  ),
  (
    'Monthly Growth Retainer - Standard',
    'monthly-growth-retainer-standard',
    'Monthly growth support across design and development execution.',
    'Recurring support plan for optimization, campaign assets, website updates, and performance reporting.',
    '',
    350000,
    'standard',
    1,
    '["Monthly design/dev hours","Optimization tasks","Campaign support","Performance reporting"]',
    'full',
    'NGN',
    1,
    1,
    60
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  summary = VALUES(summary),
  description = VALUES(description),
  price = VALUES(price),
  package_tier = VALUES(package_tier),
  is_popular = VALUES(is_popular),
  features_json = VALUES(features_json),
  payment_type = VALUES(payment_type),
  currency = VALUES(currency),
  is_payment_enabled = VALUES(is_payment_enabled),
  is_published = VALUES(is_published),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO lms_courses
  (title, slug, summary, description, level, duration_weeks, image_url, is_featured, is_published)
VALUES
  (
    'UI/UX Design Masterclass',
    'ui-ux-design-masterclass',
    'From design fundamentals to polished portfolio-ready projects.',
    'Comprehensive UI/UX training covering research, wireframing, interface design, prototyping, and portfolio development.',
    'beginner',
    8,
    '',
    1,
    1
  ),
  (
    'Frontend Web Development Bootcamp',
    'frontend-web-development-bootcamp',
    'Build modern frontend applications with production-ready practices.',
    'Hands-on frontend training using HTML, CSS, JavaScript, React, API integration, and deployment workflows.',
    'intermediate',
    10,
    '',
    1,
    1
  ),
  (
    'E-commerce Website Building',
    'ecommerce-website-building',
    'Practical e-commerce implementation for creators and business teams.',
    'Learn e-commerce strategy, catalog setup, checkout flows, payment integration, and optimization basics.',
    'beginner',
    6,
    '',
    0,
    1
  ),
  (
    'Freelancing and Client Acquisition',
    'freelancing-and-client-acquisition',
    'Win clients, structure projects, and scale service revenue.',
    'Covers offer design, outreach, proposals, closing, delivery process, and retention systems.',
    'beginner',
    4,
    '',
    0,
    1
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  summary = VALUES(summary),
  description = VALUES(description),
  level = VALUES(level),
  duration_weeks = VALUES(duration_weeks),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  is_published = VALUES(is_published),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO lms_modules (course_id, title, module_order, duration_minutes, resource_url, is_preview)
SELECT c.id, m.title, m.module_order, m.duration_minutes, m.resource_url, m.is_preview
FROM lms_courses c
JOIN (
  SELECT 'ui-ux-design-masterclass' AS course_slug, 'UI/UX Foundations and Design Process' AS title, 1 AS module_order, 80 AS duration_minutes, '' AS resource_url, 1 AS is_preview
  UNION ALL SELECT 'ui-ux-design-masterclass', 'User Research and Persona Development', 2, 95, '', 0
  UNION ALL SELECT 'ui-ux-design-masterclass', 'Wireframing and Information Architecture', 3, 90, '', 0
  UNION ALL SELECT 'ui-ux-design-masterclass', 'Visual Design and Component Systems', 4, 110, '', 0
  UNION ALL SELECT 'ui-ux-design-masterclass', 'Interactive Prototyping and Usability Testing', 5, 100, '', 0

  UNION ALL SELECT 'frontend-web-development-bootcamp', 'HTML, CSS and Responsive Layouts', 1, 120, '', 1
  UNION ALL SELECT 'frontend-web-development-bootcamp', 'JavaScript Fundamentals and DOM', 2, 140, '', 0
  UNION ALL SELECT 'frontend-web-development-bootcamp', 'React Components and State Management', 3, 150, '', 0
  UNION ALL SELECT 'frontend-web-development-bootcamp', 'API Integration and Async Patterns', 4, 120, '', 0
  UNION ALL SELECT 'frontend-web-development-bootcamp', 'Deployment, QA and Performance', 5, 90, '', 0

  UNION ALL SELECT 'ecommerce-website-building', 'Commerce Fundamentals and Product Strategy', 1, 80, '', 1
  UNION ALL SELECT 'ecommerce-website-building', 'Store Setup and Product Catalog Management', 2, 95, '', 0
  UNION ALL SELECT 'ecommerce-website-building', 'Checkout, Payment and Order Flow', 3, 90, '', 0
  UNION ALL SELECT 'ecommerce-website-building', 'Store Design, Trust and Conversion', 4, 85, '', 0
  UNION ALL SELECT 'ecommerce-website-building', 'Launch Checklist and Optimization Basics', 5, 70, '', 0

  UNION ALL SELECT 'freelancing-and-client-acquisition', 'Positioning and Offer Design', 1, 70, '', 1
  UNION ALL SELECT 'freelancing-and-client-acquisition', 'Lead Generation and Outreach Systems', 2, 80, '', 0
  UNION ALL SELECT 'freelancing-and-client-acquisition', 'Proposal, Pricing and Closing Deals', 3, 90, '', 0
  UNION ALL SELECT 'freelancing-and-client-acquisition', 'Delivery, Retention and Referrals', 4, 80, '', 0
) AS m ON m.course_slug = c.slug
LEFT JOIN lms_modules lm ON lm.course_id = c.id AND lm.module_order = m.module_order AND lm.title = m.title
WHERE lm.id IS NULL;

COMMIT;

