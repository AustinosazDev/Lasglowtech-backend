-- Seed rich LMS module content for existing seeded courses
-- Usage:
-- mysql -u <user> -p <database> < server/sql/seed_lms_module_details.sql

START TRANSACTION;

UPDATE lms_modules m
JOIN lms_courses c ON c.id = m.course_id
SET
  m.module_content = CASE
    WHEN c.slug = 'ui-ux-design-masterclass' AND m.module_order = 1 THEN 'This module introduces the end-to-end UX process, user-centered design principles, and how to define problem statements for digital products.\n\nYou will learn how to break down user needs, business goals, and product constraints into a practical design workflow.'
    WHEN c.slug = 'ui-ux-design-masterclass' AND m.module_order = 2 THEN 'Focus on qualitative and quantitative research methods. We cover user interviews, competitor mapping, affinity grouping, and persona drafting.\n\nBy the end, you should be able to create actionable research outputs for product decisions.'
    WHEN c.slug = 'ui-ux-design-masterclass' AND m.module_order = 3 THEN 'Learn lo-fi wireframing and information architecture planning. We structure user journeys, key screens, and navigation flows.\n\nThis module helps you move from ideas into clear layout direction before visual polish.'
    WHEN c.slug = 'ui-ux-design-masterclass' AND m.module_order = 4 THEN 'Deep dive into visual hierarchy, typography systems, color strategy, and reusable components.\n\nYou will create consistent interface patterns and a scalable mini design system.'
    WHEN c.slug = 'ui-ux-design-masterclass' AND m.module_order = 5 THEN 'Build interactive prototypes and conduct usability testing. We analyze feedback, identify friction points, and iterate quickly.\n\nFinal deliverable includes a test-backed prototype and a concise findings summary.'

    WHEN c.slug = 'frontend-web-development-bootcamp' AND m.module_order = 1 THEN 'Start with semantic HTML, modern CSS layout systems, and responsive design principles.\n\nYou will produce clean page structures that adapt to mobile and desktop.'
    WHEN c.slug = 'frontend-web-development-bootcamp' AND m.module_order = 2 THEN 'Master JavaScript fundamentals including functions, arrays, objects, events, and DOM manipulation.\n\nWe focus on writing understandable, maintainable code.'
    WHEN c.slug = 'frontend-web-development-bootcamp' AND m.module_order = 3 THEN 'Build React components, handle props/state, and manage component composition.\n\nYou will structure UI into reusable units and handle dynamic rendering.'
    WHEN c.slug = 'frontend-web-development-bootcamp' AND m.module_order = 4 THEN 'Integrate APIs with async patterns, loading/error states, and robust request handling.\n\nYou will connect frontend interfaces to backend services professionally.'
    WHEN c.slug = 'frontend-web-development-bootcamp' AND m.module_order = 5 THEN 'Cover deployment workflows, quality checks, performance basics, and release readiness.\n\nYou will deploy a production-ready frontend project with confidence.'

    WHEN c.slug = 'ecommerce-website-building' AND m.module_order = 1 THEN 'Understand e-commerce business models, audience targeting, offer positioning, and product strategy.\n\nThis module aligns store setup with revenue goals.'
    WHEN c.slug = 'ecommerce-website-building' AND m.module_order = 2 THEN 'Set up store architecture, category structure, product pages, and inventory foundations.\n\nYou will create a clean, conversion-friendly catalog experience.'
    WHEN c.slug = 'ecommerce-website-building' AND m.module_order = 3 THEN 'Implement checkout logic, payment gateways, and order handling basics.\n\nThis module focuses on trust, reliability, and friction reduction.'
    WHEN c.slug = 'ecommerce-website-building' AND m.module_order = 4 THEN 'Improve store design quality with conversion patterns, social proof, and persuasive product storytelling.\n\nYou will optimize key points in the buyer journey.'
    WHEN c.slug = 'ecommerce-website-building' AND m.module_order = 5 THEN 'Prepare launch checklist, analytics tracking, and iterative optimization plan.\n\nYou will define post-launch metrics and improvement cycles.'

    WHEN c.slug = 'freelancing-and-client-acquisition' AND m.module_order = 1 THEN 'Clarify your niche, positioning, and service offer architecture.\n\nYou will define what you sell, to whom, and why it is valuable.'
    WHEN c.slug = 'freelancing-and-client-acquisition' AND m.module_order = 2 THEN 'Build lead generation systems and outreach messaging that starts quality conversations.\n\nWe cover channels, scripts, and follow-up structure.'
    WHEN c.slug = 'freelancing-and-client-acquisition' AND m.module_order = 3 THEN 'Create persuasive proposals, handle objections, and close deals with confidence.\n\nYou will structure pricing and packages for sustainable delivery.'
    WHEN c.slug = 'freelancing-and-client-acquisition' AND m.module_order = 4 THEN 'Deliver projects professionally, manage clients, and build retention/referral loops.\n\nYou will establish systems for consistent revenue growth.'
    ELSE m.module_content
  END,
  m.slide_url = CASE
    WHEN c.slug = 'ui-ux-design-masterclass' THEN CONCAT('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#ux', m.module_order)
    WHEN c.slug = 'frontend-web-development-bootcamp' THEN CONCAT('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#fe', m.module_order)
    WHEN c.slug = 'ecommerce-website-building' THEN CONCAT('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#ec', m.module_order)
    WHEN c.slug = 'freelancing-and-client-acquisition' THEN CONCAT('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#fr', m.module_order)
    ELSE m.slide_url
  END,
  m.video_url = CASE
    WHEN c.slug = 'ui-ux-design-masterclass' AND m.module_order IN (1,4) THEN 'https://www.youtube.com/watch?v=3Y6kQx5f1Jw'
    WHEN c.slug = 'frontend-web-development-bootcamp' AND m.module_order IN (2,3) THEN 'https://www.youtube.com/watch?v=jS4aFq5-91M'
    WHEN c.slug = 'ecommerce-website-building' AND m.module_order = 3 THEN 'https://www.youtube.com/watch?v=Q0Qf3M4sA4Y'
    WHEN c.slug = 'freelancing-and-client-acquisition' AND m.module_order = 2 THEN 'https://www.youtube.com/watch?v=2wA6M5W5VwA'
    ELSE m.video_url
  END,
  m.reference_links_json = CASE
    WHEN c.slug = 'ui-ux-design-masterclass' THEN '["https://www.nngroup.com/articles/","https://www.interaction-design.org/literature"]'
    WHEN c.slug = 'frontend-web-development-bootcamp' THEN '["https://developer.mozilla.org/","https://react.dev/learn"]'
    WHEN c.slug = 'ecommerce-website-building' THEN '["https://woocommerce.com/documentation/","https://help.shopify.com/en/manual"]'
    WHEN c.slug = 'freelancing-and-client-acquisition' THEN '["https://www.upwork.com/resources","https://www.indeed.com/career-advice/career-development/client-management"]'
    ELSE m.reference_links_json
  END
WHERE c.slug IN (
  'ui-ux-design-masterclass',
  'frontend-web-development-bootcamp',
  'ecommerce-website-building',
  'freelancing-and-client-acquisition'
);

COMMIT;

