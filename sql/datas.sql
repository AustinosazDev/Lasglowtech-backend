-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 05, 2026 at 03:25 PM
-- Server version: 8.0.41
-- PHP Version: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hqmrvoda_lasglowtechserver`
--

-- --------------------------------------------------------

--
-- Table structure for table `bulk_email_campaigns`
--

CREATE TABLE `bulk_email_campaigns` (
  `id` int NOT NULL,
  `subject` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `body_html` longtext COLLATE utf8mb4_general_ci,
  `total_recipients` int NOT NULL DEFAULT '0',
  `total_sent` int NOT NULL DEFAULT '0',
  `total_failed` int NOT NULL DEFAULT '0',
  `created_by` varchar(190) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bulk_email_campaigns`
--

INSERT INTO `bulk_email_campaigns` (`id`, `subject`, `body_html`, `total_recipients`, `total_sent`, `total_failed`, `created_by`, `created_at`) VALUES
(1, 'Just testing', '<p style=\"font-size:14px;line-height:1.7;\">Send updates to manual emails or CSV exported from Excel.</p>', 2, 2, 0, 'lasglowtech@gmail.com', '2026-02-28 23:25:28');

-- --------------------------------------------------------

--
-- Table structure for table `bulk_email_recipients`
--

CREATE TABLE `bulk_email_recipients` (
  `id` int NOT NULL,
  `campaign_id` int NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('sent','failed') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'sent',
  `error_message` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bulk_email_recipients`
--

INSERT INTO `bulk_email_recipients` (`id`, `campaign_id`, `email`, `status`, `error_message`, `sent_at`, `created_at`) VALUES
(1, 1, 'omozemojeau@gmial.com', 'sent', '', '2026-03-01 00:25:28', '2026-02-28 23:25:28'),
(2, 1, 'lasglowtech@gmail.com', 'sent', '', '2026-03-01 00:25:28', '2026-02-28 23:25:28');

-- --------------------------------------------------------

--
-- Table structure for table `career_applications`
--

CREATE TABLE `career_applications` (
  `id` int NOT NULL,
  `full_name` varchar(180) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `skill_interest` varchar(160) COLLATE utf8mb4_general_ci NOT NULL,
  `learning_goal` text COLLATE utf8mb4_general_ci NOT NULL,
  `experience_level` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `availability` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `portfolio_url` varchar(300) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `picture_url` varchar(400) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('new','reviewing','accepted','waitlist','rejected') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'new',
  `admin_notes` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `access_token` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fee_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('unpaid','part_paid','paid','waived') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'unpaid',
  `follow_up_date` date DEFAULT NULL,
  `cohort` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `career_applications`
--

INSERT INTO `career_applications` (`id`, `full_name`, `email`, `phone`, `skill_interest`, `learning_goal`, `experience_level`, `availability`, `city`, `country`, `portfolio_url`, `picture_url`, `status`, `admin_notes`, `created_at`, `updated_at`, `access_token`, `fee_amount`, `payment_status`, `follow_up_date`, `cohort`, `user_id`) VALUES
(4, 'TAYE', 'omozemojeau+67@gmail.com', '090318484848', 'Web Development', 'Choose from design, development, and product-focused tracks relevant to current market demand.', 'Beginner', 'Weekdays', 'Abuja', 'Kenya', 'http://localhost:5173/careers', 'http://localhost:5000/uploads/images/1772317907354-DESIGN THRES.png', 'accepted', 'You are welcome to our team', '2026-02-28 22:31:47', '2026-02-28 22:45:10', 'd491f96a98e4fdbccb5260ce382c0ec20dd2e0d0', 800000.00, 'paid', '2026-02-14', 'laser3', 5),
(5, 'Austine', 'omozemojeau+@gmail.com', '09031821590', 'Web Development', 'Learning Goal & Why I’m Applying\n\nMy learning goal is to become a highly skilled and industry-ready web developer who can build scalable, user-friendly, and performance-optimized web applications. I want to deepen my understanding of modern frontend technologies like React and Next.js, strengthen my backend development skills, and improve my knowledge of system architecture, APIs, authentication, and database design.\n\nI am applying for this program because I believe structured learning, mentorship, and real-world projects are essential for growth. While I already have foundational knowledge in HTML, CSS, JavaScript, and modern frameworks, I want to refine my problem-solving skills, write cleaner and more maintainable code, and gain exposure to industry best practices.\n\nThis opportunity will help me bridge the gap between theoretical knowledge and practical implementation, collaborate with other developers, and prepare myself for professional roles in frontend and full-stack development. My long-term goal is to build impactful digital solutions that solve real-world problems and contribute meaningfully to the tech ecosystem.', 'Beginner', 'Weekdays', 'Abuja', 'Ghana', 'https://austinosaz.vercel.app/', 'http://localhost:5000/uploads/images/1772390853506-PASSPORT.jpg', 'accepted', 'Welcome to this great milestone', '2026-03-01 18:47:33', '2026-03-03 09:48:55', '3788f62be25038d0e5d5da80a6eac19706300bd0', 600000.00, 'part_paid', '2026-02-28', '', 7);

-- --------------------------------------------------------

--
-- Table structure for table `catalogues`
--

CREATE TABLE `catalogues` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(220) COLLATE utf8mb4_general_ci NOT NULL,
  `summary` varchar(400) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `image_url` varchar(400) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_type` enum('full','deposit') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'full',
  `currency` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NGN',
  `is_payment_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `package_tier` enum('starter','standard','premium') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'standard',
  `is_popular` tinyint(1) NOT NULL DEFAULT '0',
  `features_json` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `catalogues`
--

INSERT INTO `catalogues` (`id`, `title`, `slug`, `summary`, `description`, `image_url`, `price`, `payment_type`, `currency`, `is_payment_enabled`, `is_published`, `sort_order`, `created_at`, `updated_at`, `package_tier`, `is_popular`, `features_json`) VALUES
(2, 'Mobile Development', 'mobile-apps', 'Cross-platform mobile apps with stable architecture and polished UI.', 'React Native and Flutter builds for startups and enterprise teams.', '', 250000.00, 'deposit', 'NGN', 1, 1, 2, '2026-02-28 15:49:09', '2026-02-28 15:49:09', 'standard', 0, NULL),
(3, 'UI/UX Design', 'ui-ux-design', 'Research-backed interface design and product prototypes.', 'Design systems, user flows, and high-fidelity screens with usability depth.', '', 200000.00, 'full', 'NGN', 1, 1, 0, '2026-02-28 15:49:09', '2026-03-03 10:34:24', 'starter', 0, '[]'),
(5, 'Power point', 'power-point', 'Manual and Ai assisted', 'Master how to create powerful presentation , with powerpoint and \nalso get to know Ai tools that can make your work seemeless all in one go', 'https://lasglowserver.phoenixstech.com/uploads/images/1772534000676-premium digital services.png', 50000.00, 'full', 'NGN', 1, 1, 2, '2026-02-28 16:27:09', '2026-03-03 10:33:21', 'standard', 0, '[\"Power point\",\"Ai tools for fast presentation\",\"Refrence Docs\"]'),
(7, 'Flyer Design', 'flyer-design', 'One time urgent design', 'Get a professional Flyer Design for Your Brand', 'https://lasglowserver.phoenixstech.com/uploads/images/1772533639931-FUTURE OF AI.jpg', 10000.00, 'full', 'NGN', 1, 1, 2, '2026-03-01 00:51:12', '2026-03-03 10:27:20', 'standard', 0, '[]'),
(8, 'Landing Page Package - Starter', 'landing-page-starter', 'Single high-converting landing page for campaign launches.', 'A focused landing page with responsive design, CTA optimization, analytics setup, and basic on-page SEO.', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200', 120000.00, 'deposit', 'NGN', 1, 1, 10, '2026-03-01 00:58:19', '2026-03-01 01:02:20', 'starter', 0, '[\"1 responsive page\",\"Lead capture form\",\"CTA optimization\",\"Basic SEO setup\",\"Analytics integration\"]'),
(9, 'Landing Page Package - Standard', 'landing-page-package-standard', 'Enhanced landing page with richer sections and stronger conversion structure.', 'Includes strategy call, conversion-focused layout, trust sections, optimization pass, and deployment support.', 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=1200', 250000.00, 'deposit', 'NGN', 1, 1, 11, '2026-03-01 00:58:19', '2026-03-03 10:26:25', 'standard', 1, '[\"Conversion strategy call\",\"Advanced sections\",\"Trust and testimonial blocks\",\"Performance optimization\",\"Deployment support\"]'),
(10, 'Landing Page Package - Premium', 'landing-page-premium', 'Premium campaign landing experience with full optimization stack.', 'Includes full design system approach, copy guidance, integrations, QA, and post-launch performance review.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200', 380000.00, 'deposit', 'NGN', 1, 1, 12, '2026-03-01 00:58:19', '2026-03-01 01:02:20', 'premium', 0, '[\"Premium UI/UX\",\"Copy structure support\",\"CRM integration\",\"Cross-device QA\",\"Post-launch review\"]'),
(11, 'Business Website Package - Starter', 'business-website-starter', 'Professional multi-page business website for growing brands.', 'Company profile website with key pages, contact forms, performance optimization, and CMS handover.', 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200', 250000.00, 'deposit', 'NGN', 1, 1, 20, '2026-03-01 00:58:19', '2026-03-01 01:02:20', 'starter', 0, '[\"Up to 5 pages\",\"Contact forms\",\"CMS setup\",\"Performance optimization\",\"Basic training\"]'),
(12, 'Business Website Package - Standard', 'business-website-standard', 'Conversion-focused website with stronger information architecture.', 'Includes additional pages, content structuring, improved SEO setup, and stakeholder handover.', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200', 450000.00, 'deposit', 'NGN', 1, 1, 21, '2026-03-01 00:58:19', '2026-03-01 01:02:20', 'standard', 1, '[\"Up to 10 pages\",\"Improved site architecture\",\"SEO-ready pages\",\"Enhanced contact workflow\",\"Handover support\"]'),
(13, 'Company  Website Package ', 'company-website-package', 'High-performance business platform for serious growth.', 'Comprehensive build with advanced integrations, custom modules, scalability considerations, and launch support.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200', 600000.00, 'deposit', 'NGN', 1, 1, 22, '2026-03-01 00:58:19', '2026-03-03 10:25:25', 'premium', 0, '[\"Hosting and Domain\",\"Integrations\",\"Scalable architecture\",\"Technical SEO baseline\",\"Launch support\"]'),
(14, 'E-commerce Website Package - Starter', 'e-commerce-website-package-starter', 'Launch, ready online store for small catalogues.', 'Store setup with product listing structure, checkout configuration, payment integration, and admin guide.', 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=1200', 500000.00, 'deposit', 'NGN', 1, 1, 30, '2026-03-01 00:58:19', '2026-03-03 10:20:38', 'starter', 0, '[\"Store setup\",\"Product catalogue structure\",\"Checkout flow\",\"Payment integration\"]'),
(15, 'E-commerce Website Package - Standard', 'ecommerce-standard', 'Revenue-focused e-commerce setup with stronger user journey.', 'Includes merchandising layout, sales funnel setup, discount logic, and conversion analytics.', 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200', 750000.00, 'deposit', 'NGN', 1, 1, 31, '2026-03-01 00:58:19', '2026-03-01 01:02:20', 'standard', 1, '[\"Advanced product pages\",\"Merchandising setup\",\"Discount configuration\",\"Sales funnel setup\",\"Analytics tracking\"]'),
(16, 'E-commerce Website Package - Premium', 'e-commerce-website-package-premium', 'Enterprise-grade commerce platform with deeper automation.', 'Includes advanced flows, integrations, automation opportunities, and launch growth support.', 'https://lasglowserver.phoenixstech.com/uploads/images/1772533474636-1755085200224-Image_fx (26).jpg', 1350000.00, 'deposit', 'NGN', 1, 1, 32, '2026-03-01 00:58:19', '2026-03-03 10:24:37', 'premium', 0, '[\"Advanced checkout flows\",\"Automation support\",\"Third-party integrations\",\"Performance and security hardening\",\"Growth support\"]'),
(17, 'Brand Identity Package - Starter', 'brand-identity-starter', 'Core brand identity kit for new businesses.', 'Logo suite, color palette, typography set, and quick usage guide.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200', 150000.00, 'full', 'NGN', 1, 1, 40, '2026-03-01 00:58:19', '2026-03-01 01:02:20', 'starter', 0, '[\"Primary and secondary logo\",\"Color palette\",\"Typography guidance\",\"Quick usage guide\"]'),
(18, 'Brand Identity Package - Standard', 'brand-identity-package-standard', 'Comprehensive identity package for serious positioning.', 'Includes refined identity system, social templates, and extended usage guide.', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200', 80000.00, 'full', 'NGN', 1, 1, 41, '2026-03-01 00:58:19', '2026-03-03 10:21:44', 'premium', 0, '[\"Logo variants\",\"Brand color and type system\",\"Social media templates\",\"Extended usage guide\"]'),
(19, 'Brand Identity Package - Premium', 'brand-identity-premium', 'Premium brand system for scale-ready businesses.', 'Strategic identity direction, visual language system, templates, and brand governance guide.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200', 550000.00, 'full', 'NGN', 1, 1, 42, '2026-03-01 00:58:19', '2026-03-01 01:02:20', 'premium', 1, '[\"Strategic direction\",\"Complete visual language\",\"Template system\",\"Brand governance guide\"]'),
(20, 'Website Audit Report Template', 'website-audit-report-template', 'Professional website audit document template.', 'Editable template for technical, UX, and conversion reviews.', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200', 50000.00, 'full', 'NGN', 1, 1, 50, '2026-03-01 00:58:19', '2026-03-03 10:22:11', 'starter', 0, '[\"Editable template\",\"Audit checklist\",\"Report structure\",\"Action summary format\"]'),
(21, 'Brand Strategy Workbook', 'brand-strategy-workbook', 'Practical workbook for building clear brand strategy.', 'Guided exercises for positioning, audience mapping, messaging, and brand voice.', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200', 20000.00, 'full', 'NGN', 1, 1, 51, '2026-03-01 00:58:19', '2026-03-01 01:02:20', 'standard', 0, '[\"Positioning worksheets\",\"Audience mapping\",\"Messaging framework\",\"Brand voice prompts\"]'),
(22, 'Social Media Designs', 'social-media-designs', 'Social media package monthly', 'Instagram, Facebook, LinkedIn, Twitter\nExtras: Stock images, icons, graphics, captions, or revisions ', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200', 100000.00, 'full', 'NGN', 1, 1, 47, '2026-03-01 00:58:19', '2026-03-03 10:19:34', 'premium', 0, '[\"Deliverables: 3 unique social media designs per week\",\"Frequency: 4 weeks in a month → 12 designs per month\",\"Platforms: Instagram, Facebook, LinkedIn, etc.\",\"Extras: Stock images, icons, graphics, captions, or revisions\",\"Quick brand customization\"]'),
(23, 'Proposal, Invoice and Contract Bundle', 'proposal-invoice-and-contract-bundle', 'Client operations bundle for freelancers and agencies.', 'Editable templates to streamline onboarding and billing workflows.', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200', 50000.00, 'full', 'NGN', 1, 1, 53, '2026-03-01 00:58:19', '2026-03-03 10:09:34', 'starter', 0, '[\"Proposal template\",\"Invoice template\",\"Contract template\",\"Onboarding checklist\"]'),
(24, 'Landing Page/Portfolio page Design', 'landing-page-portfolio-page-design', 'Modern portfolo design  for faster page design and delivery.', 'Reusable components, sections, and responsive variants for campaign pages.', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200', 250000.00, 'full', 'NGN', 1, 1, 54, '2026-03-01 00:58:19', '2026-03-03 10:08:35', 'standard', 0, '[\"Figma components\",\"Responsive variants\",\"Reusable sections\",\"Quick-start style guide\"]'),
(25, 'Monthly Growth Retainer ', 'monthly-growth-retainer', 'Monthly growth support across design and development execution.', 'Recurring support plan for optimization, campaign assets, website updates, and performance reporting.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200', 350000.00, 'full', 'NGN', 0, 1, 2, '2026-03-01 00:58:19', '2026-03-03 10:06:30', 'standard', 0, '[\"Monthly design/dev hours\",\"Optimization tasks\",\"Campaign support\",\"Performance reporting\"]');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int NOT NULL,
  `firstName` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lastName` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subject` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `firstName`, `lastName`, `email`, `subject`, `message`, `created_at`) VALUES
(11, 'Tare', 'Regina ', 'austinosaz@ur9group.com', 'Ty', 'Dxfr', '2025-08-12 16:18:50'),
(12, 'Tobi ', 'John', 'austinosaz@fhemfelhomes.com', 'Just inquiring about youir services', 'We’d love to hear from you! on any of our services, need support, or want to discuss a new project, our team is here to help.\n\n', '2025-08-15 11:14:46'),
(13, 'osaz', 'Omoz', 'lasglowtech@gmail.com', 'Youre welcome', 'Nebebebebebe', '2025-12-02 10:37:31'),
(14, 'Osaz', 'Austins', 'omozemojeau+2@gmail.com', 'Tesing', 'Okay it works', '2026-03-02 09:49:50');

-- --------------------------------------------------------

--
-- Table structure for table `email_subscriptions`
--

CREATE TABLE `email_subscriptions` (
  `id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('subscribed','unsubscribed') COLLATE utf8mb4_general_ci DEFAULT 'subscribed',
  `subscribed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_subscriptions`
--

INSERT INTO `email_subscriptions` (`id`, `email`, `status`, `subscribed_at`, `unsubscribed_at`) VALUES
(35, 'omozemojeau@gmail.com', 'subscribed', '2025-08-12 03:04:23', NULL),
(36, 'lasglowtech@gmail.com', 'subscribed', '2025-08-12 16:18:07', NULL),
(37, 'muhammadabubakarjamiu@gmail.com', 'subscribed', '2025-08-29 17:59:00', NULL),
(38, 'Pantherarestolounge@gmail.com', 'subscribed', '2026-01-01 07:07:14', NULL),
(39, 'gmail@gmail.com', 'subscribed', '2026-01-14 09:22:25', NULL),
(40, 'jubijoseph10@gmail.com', 'subscribed', '2026-01-15 06:10:43', NULL),
(41, 'omozemojeau+2@gmail.com', 'subscribed', '2026-03-02 09:52:31', NULL),
(42, 'lasglowtech+34@gmail.com', 'subscribed', '2026-03-05 06:25:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lms_courses`
--

CREATE TABLE `lms_courses` (
  `id` int NOT NULL,
  `title` varchar(220) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(240) COLLATE utf8mb4_general_ci NOT NULL,
  `summary` varchar(420) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `level` enum('beginner','intermediate','advanced') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'beginner',
  `duration_weeks` int NOT NULL DEFAULT '4',
  `image_url` varchar(400) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lms_courses`
--

INSERT INTO `lms_courses` (`id`, `title`, `slug`, `summary`, `description`, `level`, `duration_weeks`, `image_url`, `is_featured`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 'UI/UX Design Masterclass', 'ui-ux-design-masterclass', 'From design fundamentals to polished portfolio-ready projects.', 'Comprehensive UI/UX training covering research, wireframing, interface design, prototyping, and portfolio development.', 'beginner', 8, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200', 1, 1, '2026-02-28 21:58:19', '2026-02-28 22:02:20'),
(2, 'Frontend Web Development Bootcamp', 'frontend-web-development-bootcamp', 'Build modern frontend applications with production-ready practices.', 'Hands-on frontend training using HTML, CSS, JavaScript, React, API integration, and deployment workflows.', 'intermediate', 5, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200', 1, 1, '2026-02-28 21:58:19', '2026-03-03 09:45:35'),
(3, 'E-commerce Website Building', 'e-commerce-website-building', 'Practical e-commerce implementation for creators and business teams.', 'Learn e-commerce strategy, catalog setup, checkout flows, payment integration, and optimization basics.', 'intermediate', 6, 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200', 0, 1, '2026-02-28 21:58:19', '2026-02-28 22:43:35'),
(4, 'Freelancing and Client Acquisition', 'freelancing-and-client-acquisition', 'Win clients, structure projects, and scale service revenue.', 'Covers offer design, outreach, proposals, closing, delivery process, and retention systems.', 'beginner', 6, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200', 0, 1, '2026-02-28 21:58:19', '2026-03-03 09:56:44');

-- --------------------------------------------------------

--
-- Table structure for table `lms_enrollments`
--

CREATE TABLE `lms_enrollments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `status` enum('active','completed','paused') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `progress_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `certificate_code` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `certificate_sent_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lms_enrollments`
--

INSERT INTO `lms_enrollments` (`id`, `user_id`, `course_id`, `status`, `progress_percent`, `created_at`, `updated_at`, `certificate_code`, `certificate_sent_at`) VALUES
(1, 6, 2, 'active', 0.00, '2026-02-28 22:11:38', '2026-02-28 22:11:38', NULL, NULL),
(2, 6, 4, 'active', 0.00, '2026-02-28 22:12:23', '2026-02-28 22:12:23', NULL, NULL),
(3, 6, 1, 'active', 0.00, '2026-02-28 22:12:36', '2026-02-28 22:12:36', NULL, NULL),
(4, 6, 3, 'active', 0.00, '2026-02-28 22:43:54', '2026-02-28 22:43:54', NULL, NULL),
(5, 7, 2, 'active', 0.00, '2026-03-01 17:37:52', '2026-03-01 17:37:52', NULL, NULL),
(6, 7, 4, 'active', 0.00, '2026-03-01 20:33:34', '2026-03-01 20:33:34', NULL, NULL),
(0, 8, 2, 'active', 0.00, '2026-03-02 15:55:27', '2026-03-02 15:55:27', NULL, NULL),
(0, 8, 1, 'active', 0.00, '2026-03-02 15:55:54', '2026-03-02 15:55:54', NULL, NULL),
(0, 8, 1, 'active', 0.00, '2026-03-02 15:55:54', '2026-03-02 15:55:54', NULL, NULL),
(0, 8, 1, 'active', 0.00, '2026-03-02 15:55:54', '2026-03-02 15:55:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lms_modules`
--

CREATE TABLE `lms_modules` (
  `id` int NOT NULL,
  `course_id` int NOT NULL,
  `title` varchar(220) COLLATE utf8mb4_general_ci NOT NULL,
  `module_order` int NOT NULL DEFAULT '1',
  `duration_minutes` int NOT NULL DEFAULT '0',
  `resource_url` varchar(400) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_preview` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `slide_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `module_content` longtext COLLATE utf8mb4_general_ci,
  `reference_links_json` longtext COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lms_modules`
--

INSERT INTO `lms_modules` (`id`, `course_id`, `title`, `module_order`, `duration_minutes`, `resource_url`, `is_preview`, `created_at`, `slide_url`, `video_url`, `module_content`, `reference_links_json`) VALUES
(1, 1, 'UI/UX Foundations and Design Process', 1, 80, '', 1, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ui-ux-design-masterclass-1-ui-ux-foundations-and-design-process-slides-10pages.pdf', 'https://www.youtube.com/watch?v=3Y6kQx5f1Jw', 'This module introduces the end-to-end UX process, user-centered design principles, and how to define problem statements for digital products.\n\nYou will learn how to break down user needs, business goals, and product constraints into a practical design workflow.', '[\"https://www.nngroup.com/articles/\",\"https://www.interaction-design.org/literature\"]'),
(2, 1, 'User Research and Persona Development', 2, 95, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ui-ux-design-masterclass-2-user-research-and-persona-development-slides-10pages.pdf', NULL, 'Focus on qualitative and quantitative research methods. We cover user interviews, competitor mapping, affinity grouping, and persona drafting.\n\nBy the end, you should be able to create actionable research outputs for product decisions.', '[\"https://www.nngroup.com/articles/\",\"https://www.interaction-design.org/literature\"]'),
(3, 1, 'Wireframing and Information Architecture', 3, 90, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ui-ux-design-masterclass-3-wireframing-and-information-architecture-slides-10pages.pdf', NULL, 'Learn lo-fi wireframing and information architecture planning. We structure user journeys, key screens, and navigation flows.\n\nThis module helps you move from ideas into clear layout direction before visual polish.', '[\"https://www.nngroup.com/articles/\",\"https://www.interaction-design.org/literature\"]'),
(4, 1, 'Visual Design and Component Systems', 4, 110, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ui-ux-design-masterclass-4-visual-design-and-component-systems-slides-10pages.pdf', 'https://www.youtube.com/watch?v=3Y6kQx5f1Jw', 'Deep dive into visual hierarchy, typography systems, color strategy, and reusable components.\n\nYou will create consistent interface patterns and a scalable mini design system.', '[\"https://www.nngroup.com/articles/\",\"https://www.interaction-design.org/literature\"]'),
(5, 1, 'Interactive Prototyping and Usability Testing', 5, 100, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ui-ux-design-masterclass-5-interactive-prototyping-and-usability-testing-slides-10pages.pdf', NULL, 'Build interactive prototypes and conduct usability testing. We analyze feedback, identify friction points, and iterate quickly.\n\nFinal deliverable includes a test-backed prototype and a concise findings summary.', '[\"https://www.nngroup.com/articles/\",\"https://www.interaction-design.org/literature\"]'),
(6, 2, 'HTML, CSS and Responsive Layouts', 1, 120, '', 1, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/frontend-web-development-bootcamp-1-html-css-and-responsive-layouts-slides-10pages.pdf', NULL, 'Start with semantic HTML, modern CSS layout systems, and responsive design principles.\n\nYou will produce clean page structures that adapt to mobile and desktop.', '[\"https://developer.mozilla.org/\",\"https://react.dev/learn\"]'),
(7, 2, 'JavaScript Fundamentals and DOM', 2, 140, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/frontend-web-development-bootcamp-2-javascript-fundamentals-and-dom-slides-10pages.pdf', 'https://www.youtube.com/watch?v=jS4aFq5-91M', 'Master JavaScript fundamentals including functions, arrays, objects, events, and DOM manipulation.\n\nWe focus on writing understandable, maintainable code.', '[\"https://developer.mozilla.org/\",\"https://react.dev/learn\"]'),
(8, 2, 'React Components and State Management', 3, 150, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/frontend-web-development-bootcamp-3-react-components-and-state-management-slides-10pages.pdf', 'https://www.youtube.com/watch?v=jS4aFq5-91M', 'Build React components, handle props/state, and manage component composition.\n\nYou will structure UI into reusable units and handle dynamic rendering.', '[\"https://developer.mozilla.org/\",\"https://react.dev/learn\"]'),
(9, 2, 'API Integration and Async Patterns', 4, 120, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/frontend-web-development-bootcamp-4-api-integration-and-async-patterns-slides-10pages.pdf', NULL, 'Integrate APIs with async patterns, loading/error states, and robust request handling.\n\nYou will connect frontend interfaces to backend services professionally.', '[\"https://developer.mozilla.org/\",\"https://react.dev/learn\"]'),
(10, 2, 'Deployment, QA and Performance', 5, 90, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/frontend-web-development-bootcamp-5-deployment-qa-and-performance-slides-10pages.pdf', NULL, 'Cover deployment workflows, quality checks, performance basics, and release readiness.\n\nYou will deploy a production-ready frontend project with confidence.', '[\"https://developer.mozilla.org/\",\"https://react.dev/learn\"]'),
(11, 3, 'Commerce Fundamentals and Product Strategy', 1, 80, '', 1, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ecommerce-website-building-1-commerce-fundamentals-and-product-strategy-slides-10pages.pdf', NULL, 'Understand e-commerce business models, audience targeting, offer positioning, and product strategy.\n\nThis module aligns store setup with revenue goals.', '[\"https://woocommerce.com/documentation/\",\"https://help.shopify.com/en/manual\"]'),
(12, 3, 'Store Setup and Product Catalog Management', 2, 95, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ecommerce-website-building-2-store-setup-and-product-catalog-management-slides-10pages.pdf', NULL, 'Set up store architecture, category structure, product pages, and inventory foundations.\n\nYou will create a clean, conversion-friendly catalog experience.', '[\"https://woocommerce.com/documentation/\",\"https://help.shopify.com/en/manual\"]'),
(13, 3, 'Checkout, Payment and Order Flow', 3, 90, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ecommerce-website-building-3-checkout-payment-and-order-flow-slides-10pages.pdf', 'https://www.youtube.com/watch?v=Q0Qf3M4sA4Y', 'Implement checkout logic, payment gateways, and order handling basics.\n\nThis module focuses on trust, reliability, and friction reduction.', '[\"https://woocommerce.com/documentation/\",\"https://help.shopify.com/en/manual\"]'),
(14, 3, 'Store Design, Trust and Conversion', 4, 85, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ecommerce-website-building-4-store-design-trust-and-conversion-slides-10pages.pdf', NULL, 'Improve store design quality with conversion patterns, social proof, and persuasive product storytelling.\n\nYou will optimize key points in the buyer journey.', '[\"https://woocommerce.com/documentation/\",\"https://help.shopify.com/en/manual\"]'),
(15, 3, 'Launch Checklist and Optimization Basics', 5, 70, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/ecommerce-website-building-5-launch-checklist-and-optimization-basics-slides-10pages.pdf', NULL, 'Prepare launch checklist, analytics tracking, and iterative optimization plan.\n\nYou will define post-launch metrics and improvement cycles.', '[\"https://woocommerce.com/documentation/\",\"https://help.shopify.com/en/manual\"]'),
(16, 4, 'Positioning and Offer Design', 1, 70, '', 1, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/freelancing-and-client-acquisition-1-positioning-and-offer-design-slides-10pages.pdf', NULL, 'Clarify your niche, positioning, and service offer architecture.\n\nYou will define what you sell, to whom, and why it is valuable.', '[\"https://www.upwork.com/resources\",\"https://www.indeed.com/career-advice/career-development/client-management\"]'),
(17, 4, 'Lead Generation and Outreach Systems', 2, 80, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/freelancing-and-client-acquisition-2-lead-generation-and-outreach-systems-slides-10pages.pdf', 'https://www.youtube.com/watch?v=2wA6M5W5VwA', 'Build lead generation systems and outreach messaging that starts quality conversations.\n\nWe cover channels, scripts, and follow-up structure.', '[\"https://www.upwork.com/resources\",\"https://www.indeed.com/career-advice/career-development/client-management\"]'),
(18, 4, 'Proposal, Pricing and Closing Deals', 3, 90, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/freelancing-and-client-acquisition-3-proposal-pricing-and-closing-deals-slides-10pages.pdf', NULL, 'Create persuasive proposals, handle objections, and close deals with confidence.\n\nYou will structure pricing and packages for sustainable delivery.', '[\"https://www.upwork.com/resources\",\"https://www.indeed.com/career-advice/career-development/client-management\"]'),
(19, 4, 'Delivery, Retention and Referrals', 4, 80, '', 0, '2026-02-28 21:58:19', 'http://localhost:5000/uploads/files/freelancing-and-client-acquisition-4-delivery-retention-and-referrals-slides-10pages.pdf', NULL, 'Deliver projects professionally, manage clients, and build retention/referral loops.\n\nYou will establish systems for consistent revenue growth.', '[\"https://www.upwork.com/resources\",\"https://www.indeed.com/career-advice/career-development/client-management\"]'),
(0, 4, 'Lead Generation packaging ', 5, 20, '', 0, '2026-03-03 09:56:51', '', '', '<h1>Module Notes: Lead Generation Packaging</h1><h2>1. Introduction to Lead Generation</h2><ul><li><strong>Definition:</strong> Lead generation is the process of attracting and converting strangers and prospects into someone who has indicated interest in your company’s product or service.</li><li><strong>Purpose:</strong> The main goal is to create a list of potential customers (leads) that the sales team can nurture and convert into paying clients.</li></ul><p><br></p><h3>Key Concepts:</h3><ul><li><strong>Lead:</strong> An individual or organization showing interest in your product/service.</li><li><strong>Lead Funnel:</strong> Stages that a prospect moves through from awareness to purchase.</li><li><strong>Conversion:</strong> The process of turning a lead into a customer.</li></ul><h2>2. What is Lead Generation Packaging?</h2><ul><li><strong>Definition:</strong> Lead Generation Packaging is the strategic design and presentation of your products, services, or offers to attract potential leads effectively.</li><li><strong>Objective:</strong> To make your offer irresistible and clearly communicate the value to encourage engagement and contact.</li><li><br></li></ul><h3>Components of a Lead Generation Package:</h3><ol><li><strong>Offer/Value Proposition</strong></li></ol><ul><li>Clearly state what the prospect will gain.</li><li>Examples: Free consultation, free trial, discount, eBook, webinar.</li></ul><ol><li><strong>Lead Magnet</strong></li></ol><ul><li>A tool or incentive designed to attract potential leads.</li><li>Examples: Checklists, guides, templates, quizzes.</li></ul><ol><li><strong>Call-to-Action (CTA)</strong></li></ol><ul><li>Clear instruction on what the prospect should do next.</li><li>Examples: “Sign Up Now,” “Download Free Guide,” “Book a Call.”</li></ul><ol><li><strong>Visual Design &amp; Branding</strong></li></ol><ul><li>Consistent design that reflects the brand and grabs attention.</li></ul><ol><li><strong>Delivery Mechanism</strong></li></ol><ul><li>How the lead receives the package (email, download link, landing page).</li></ul><h2>3. Types of Lead Generation Packages</h2><ol><li><strong>Digital Packages</strong></li></ol><ul><li>eBooks, whitepapers, cheat sheets, templates, webinars.</li></ul><ol><li><strong>Service-Based Packages</strong></li></ol><ul><li>Free audits, consultations, trial services, demos.</li></ul><ol><li><strong>Physical Packages</strong></li></ol><ul><li>Promotional products, sample kits, branded merchandise.</li></ul><h2>4. Steps to Create an Effective Lead Generation Package</h2><ol><li><strong>Identify Your Target Audience</strong></li></ol><ul><li>Define who your ideal leads are and their pain points.</li></ul><ol><li><strong>Choose a Lead Magnet</strong></li></ol><ul><li>Decide the type of resource that best addresses the audience\'s needs.</li></ul><ol><li><strong>Create the Content/Offer</strong></li></ol><ul><li>Develop high-quality, actionable, and valuable content.</li></ul><ol><li><strong>Design the Package</strong></li></ol><ul><li>Ensure it is visually appealing, professional, and easy to access.</li></ul><ol><li><strong>Craft Clear CTA</strong></li></ol><ul><li>Make sure the action you want the lead to take is obvious.</li></ul><ol><li><strong>Set Up Delivery Mechanism</strong></li></ol><ul><li>Landing page, email automation, or direct download.</li></ul><ol><li><strong>Track and Optimize</strong></li></ol><ul><li>Monitor lead engagement and adjust the package for better results.</li></ul><h2>5. Best Practices in Lead Generation Packaging</h2><ul><li>Keep the package simple and focused on value.</li><li>Make it visually appealing with brand consistency.</li><li>Ensure the CTA is strong and clear.</li><li>Test different versions to see which converts best.</li><li>Personalize content where possible to improve engagement.</li><li>Use automation tools for smooth lead capture and follow-up.</li></ul><h2>6. Examples of Lead Generation Packages</h2><ul><li><strong>SaaS Company:</strong> Free 14-day trial + tutorial guide.</li><li><strong>Consulting Firm:</strong> Free industry report + consultation call.</li><li><strong>E-commerce Brand:</strong> Discount coupon + product catalog download.</li><li><br></li></ul><h2>7. Summary</h2><p>Lead Generation Packaging is all about presenting a clear, valuable, and attractive offer that motivates prospects to engage with your brand. A well-designed package can increase lead capture, improve conversion rates, and ultimately drive sales.</p>', '[\"HubSpot – The Ultimate Guide to Lead Generation\",\"https://blog.hubspot.com/marketing/lead-generation\",\"Neil Patel – What is Lead Generation & How to Do It Effectively\",\"https://neilpatel.com/what-is-lead-generation/\",\"Salesforce – Lead Generation Best Practices\",\"https://www.salesforce.com/crm/lead-generation/\",\"OptinMonster – Lead Generation Techniques and Strategies\",\"https://optinmonster.com/lead-generation-strategies/\",\"Marketo – How to Build a Lead Generation Strategy\",\"https://www.marketo.com/lead-generation/\"]');

-- --------------------------------------------------------

--
-- Table structure for table `lms_progress`
--

CREATE TABLE `lms_progress` (
  `id` int NOT NULL,
  `enrollment_id` int NOT NULL,
  `module_id` int NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `last_position_seconds` int NOT NULL DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lms_progress`
--

INSERT INTO `lms_progress` (`id`, `enrollment_id`, `module_id`, `is_completed`, `last_position_seconds`, `completed_at`, `updated_at`) VALUES
(0, 0, 7, 1, 0, '2026-03-03 12:28:21', '2026-03-03 09:28:20'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 09:28:24'),
(0, 0, 7, 1, 0, '2026-03-03 12:28:28', '2026-03-03 09:28:28'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 09:28:45'),
(0, 0, 7, 1, 0, '2026-03-03 12:28:55', '2026-03-03 09:28:55'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 09:32:52'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 09:32:52'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 09:32:58'),
(0, 0, 7, 1, 0, '2026-03-03 12:33:07', '2026-03-03 09:33:06'),
(0, 0, 8, 1, 0, '2026-03-03 12:33:12', '2026-03-03 09:33:11'),
(0, 0, 9, 1, 0, '2026-03-03 12:33:18', '2026-03-03 09:33:17'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 14:12:08'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 14:12:08'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 14:12:08'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 14:12:08'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 14:12:10'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 14:12:11'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 14:12:13'),
(0, 0, 6, 1, 0, '2026-03-03 18:10:15', '2026-03-03 15:10:14'),
(0, 0, 6, 1, 0, '2026-03-03 18:10:15', '2026-03-03 15:10:14'),
(0, 0, 6, 1, 0, '2026-03-03 18:10:15', '2026-03-03 15:10:15'),
(0, 0, 7, 1, 0, '2026-03-03 18:10:19', '2026-03-03 15:10:19'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:10:52'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:10:52'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:26:08'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:26:08'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:29:19'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:29:19'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:29:19'),
(0, 0, 7, 1, 0, '2026-03-03 18:33:52', '2026-03-03 15:33:51'),
(0, 0, 7, 1, 0, '2026-03-03 18:33:52', '2026-03-03 15:33:52'),
(0, 0, 7, 1, 0, '2026-03-03 18:33:52', '2026-03-03 15:33:52'),
(0, 0, 10, 1, 0, '2026-03-03 18:34:24', '2026-03-03 15:34:23'),
(0, 0, 10, 1, 0, '2026-03-03 18:34:24', '2026-03-03 15:34:24'),
(0, 0, 10, 1, 0, '2026-03-03 18:34:34', '2026-03-03 15:34:34'),
(0, 0, 10, 1, 0, '2026-03-03 18:34:35', '2026-03-03 15:34:34'),
(0, 0, 10, 1, 0, '2026-03-03 18:34:44', '2026-03-03 15:34:44'),
(0, 0, 10, 0, 0, NULL, '2026-03-03 15:35:19'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:35:28'),
(0, 0, 7, 0, 0, NULL, '2026-03-03 15:35:28'),
(0, 0, 7, 1, 0, '2026-03-04 17:17:01', '2026-03-04 14:17:00');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token_hash` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `token_hash`, `expires_at`, `used`, `created_at`) VALUES
(1, 1, '3f37b7d29c28f54b89a411476c934252d3c81b55a28d658277d9bec5e6fb356f', '2026-03-01 01:00:05', 1, '2026-02-28 20:00:05'),
(0, 2, '4a5fb041047cb162fb73c49c36255f6e8f9a4e16a6f8cf87fcc02faefcae41ab', '2026-03-04 12:51:44', 1, '2026-03-04 08:51:44'),
(0, 2, '97ace1ffb214c817225e74b9f997935d1576e9c902650a6a3ed39c8362359e46', '2026-03-04 12:51:54', 0, '2026-03-04 08:51:53'),
(0, 1, '00d375b9a1516850bf3651ec03fe870257760fbfe3b71a52c3221e5f1e9df226', '2026-03-04 12:52:09', 1, '2026-03-04 08:52:08'),
(0, 1, '0867890ceb0334a95386c45618d93d175af00451846877cceeadfeccd3cc98c7', '2026-03-04 12:52:42', 1, '2026-03-04 08:52:42'),
(0, 1, '2ed28014928ff536de228918ac612ee8606159b4f8a935c5a813fd6792d7810c', '2026-03-04 12:52:58', 1, '2026-03-04 08:52:57'),
(0, 1, '5a89f5ac44d78b063d95c1ec217019b3dbfc00723b95b0b3bf6e162375e53393', '2026-03-04 12:53:16', 0, '2026-03-04 08:53:15');

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `tx_ref` varchar(220) COLLATE utf8mb4_general_ci NOT NULL,
  `flutterwave_tx_id` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `flutterwave_ref` varchar(180) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gateway_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NGN',
  `payload_json` longtext COLLATE utf8mb4_general_ci,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `order_id`, `tx_ref`, `flutterwave_tx_id`, `flutterwave_ref`, `gateway_status`, `amount`, `currency`, `payload_json`, `verified_at`, `created_at`, `updated_at`) VALUES
(1, 3, 'LASGLOW-ui-ux-design-1772322995577', '1993000851', '090110260301005950913500793721', 'successful', 2000.00, 'NGN', '{\"id\":1993000851,\"tx_ref\":\"LASGLOW-ui-ux-design-1772322995577\",\"flw_ref\":\"090110260301005950913500793721\",\"device_fingerprint\":\"ceee728bee0dd5dd57b321c3872ab6e7d3270f5983441496d73ce3dde169f0f5\",\"amount\":2000,\"currency\":\"NGN\",\"charged_amount\":2000,\"app_fee\":40,\"merchant_fee\":0,\"processor_response\":\"success\",\"auth_model\":\"AUTH\",\"ip\":\"105.112.234.125\",\"narration\":\"Lasglowtech Digital Services\",\"status\":\"successful\",\"payment_type\":\"bank_transfer\",\"created_at\":\"2026-03-01T00:03:26.000Z\",\"account_id\":3412908,\"meta\":{\"__CheckoutInitAddress\":\"http://localhost:5173/\",\"__FingerprintConfidenceScore\":\"0.6\",\"orderId\":\"3\",\"userId\":\"2\",\"serviceSlug\":\"ui-ux-design\",\"serviceName\":\"UI/UX Design\",\"paymentType\":\"full\",\"originatorname\":\"SureBanker-AUGUSTINE OISASOJE OMOZEMOJE\",\"bankname\":\"VFD MFB\",\"originatoramount\":\"2000\",\"originatoraccountnumber\":\"104*******75\"},\"amount_settled\":1957,\"customer\":{\"id\":1309588681,\"name\":\"Austinosaz \",\"phone_number\":\"08012345678\",\"email\":\"lasglowtech@gmail.com\",\"created_at\":\"2026-02-28T23:57:01.000Z\"}}', '2026-03-01 01:30:38', '2026-02-28 21:14:26', '2026-02-28 21:30:38');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `cover` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `shares` int DEFAULT '0',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `slug` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `cover`, `title`, `content`, `shares`, `timestamp`, `slug`) VALUES
(52, '1772466322057-1766059577712-lasglowblog1.png', 'Design Threads  to Watch in 2025', '<p><strong>Introduction</strong></p><p>Graphic design is evolving faster than ever. In 2025, creativity isn’t just about aesthetics , it’s about merging visual storytelling with cutting-edge technology. Whether you’re a designer, business owner, or creative enthusiast, understanding these trends will help you create designs that stand out in an increasingly competitive digital space.</p><p><br></p><p><strong>1. AI-Assisted Creativity</strong></p><p>Artificial intelligence has moved from being a tool to a true creative partner. Designers now use AI to generate ideas, create layouts, and even produce high-quality illustrations in seconds. Rather than replacing human creativity, AI is helping designers work faster and explore more possibilities</p><p><br></p><p><strong>2. Bold &amp; Experimental Typography</strong></p><p>Minimalism had its moment, but 2025 is embracing bold, oversized, and experimental typography. From variable fonts to hand-drawn lettering, typefaces are becoming a focal point, not just a supporting element.</p><p><br></p><p><strong>3. Immersive 3D Elements</strong></p><p>3D graphics are no longer just for gaming. Brands are integrating interactive 3D visuals into websites, apps, and social media campaigns, creating more engaging and memorable experiences for users.</p><p><br></p><p><strong>4. Vibrant Gradients &amp; Neon Glows</strong></p><p>Gradients are getting bolder and more futuristic. Expect to see vibrant color transitions and glowing effects, often paired with dark backgrounds to create a high-contrast, eye-catching style.</p><p><br></p><p><strong>5. Sustainability-Driven Design</strong></p><p>Eco-consciousness is influencing graphic design. Expect more nature-inspired palettes, recycled textures, and visual storytelling that communicates sustainability and environmental responsibility.</p><p><br></p><p><strong>6. Maximalist Collages</strong></p><p>Layered images, bold patterns, and mixed media are making a comeback. Maximalism offers a fresh alternative to minimalism, encouraging rich, detailed visuals that grab attention.</p><p><br></p><p><strong>Conclusion</strong></p><p>Graphic design in 2025 is all about balance , combining technology with creativity, boldness with purpose, and innovation with timeless design principles. Whether you’re experimenting with AI tools, pushing typography boundaries, or creating sustainable visuals, these trends offer endless inspiration for your next project.</p>', 0, '2026-03-02 15:45:22', 'design-threads-to-watch-in-2025'),
(53, '1755086028083-23 Free Device Mockups for Phone, Laptop and Other Screen.jpeg', 'Designing for Mobile First: Why It’s No Longer Optional', '<p><br></p><p>In today’s fast-paced digital world, your website isn’t just your online business card—it’s your shopfront, salesperson, and brand ambassador all rolled into one. But here’s the reality:&nbsp;<strong>more than 70% of internet traffic now comes from mobile devices</strong>.</p><p>If your site isn’t built with mobile users in mind, you’re not just missing out on visitors—you’re losing customers. That’s why&nbsp;<strong>designing for mobile first</strong>&nbsp;is no longer an optional design choice. It’s a necessity.</p><p><br></p><h3><strong>What is Mobile-First Design?</strong></h3><p>Mobile-first design is a web design approach where you&nbsp;<strong>start designing for the smallest screens first</strong>&nbsp;and then scale up to larger devices like tablets and desktops.</p><p>Instead of creating a desktop site and then squeezing it into a phone layout, mobile-first ensures your website looks and works perfectly on smartphones from the very start.</p><p><br></p><h3><strong>Why Mobile-First Matters in 2025</strong></h3><h4>1.&nbsp;<strong>Mobile Traffic Dominates</strong></h4><p>With affordable smartphones and cheaper internet plans, mobile browsing is the default for most users—especially in fast-growing markets like Nigeria and Africa at large.</p><h4>2.&nbsp;<strong>Google Ranks Mobile-Friendly Sites Higher</strong></h4><p>Google uses&nbsp;<strong>mobile-first indexing</strong>, meaning it looks at your site’s mobile version before ranking it. If your mobile site is clunky, expect to lose SEO rankings.</p><h4>3.&nbsp;<strong>Better User Experience</strong></h4><p>Small screens require&nbsp;<strong>clear navigation, fast loading speeds, and touch-friendly buttons</strong>. A mobile-first approach ensures these are top priorities, reducing bounce rates and keeping visitors engaged.</p><h4>4.&nbsp;<strong>Faster Load Times</strong></h4><p>Mobile-first sites are typically leaner. Optimized images, fewer heavy scripts, and streamlined layouts mean pages load faster—even on slow networks.</p><p><br></p><h3><strong>Key Principles of Mobile-First Design</strong></h3><ol><li><strong>Content First</strong>&nbsp;– Show your most important information at the top. No unnecessary clutter.</li><li><strong>Responsive Layouts</strong>&nbsp;– Use flexible grids and media queries so your design adjusts seamlessly across devices.</li><li><strong>Optimized Media</strong>&nbsp;– Compress images, use modern formats (like WebP), and lazy-load where possible.</li><li><strong>Touch-Friendly Elements</strong>&nbsp;– Buttons should be big enough to tap without zooming.</li><li><strong>Readable Fonts</strong>&nbsp;– No tiny text; aim for a minimum of 16px for body copy.</li><li><strong>Performance Mindset</strong>&nbsp;– Build light and fast before adding extras.</li></ol><p><br></p><h3><strong>The Business Impact</strong></h3><p>A well-optimized mobile experience can:</p><ul><li>Increase conversions by up to&nbsp;<strong>70%</strong></li><li>Improve your search rankings</li><li>Reduce bounce rates</li><li>Strengthen brand credibility</li><li><br></li></ul><p>Think about it if a potential customer visits your site on their phone and it’s slow, messy, or hard to navigate, they’ll be gone in seconds… straight to your competitor.</p><p><br></p><h3><strong>How Lasglowtech Can Help</strong></h3><p>At Lasglowtech, we design websites with&nbsp;<strong>mobile-first principles baked in</strong>. We focus on speed, usability, and conversion—ensuring your site looks amazing on every device.</p><p>If you’re ready to&nbsp;<strong>make your business mobile-friendly</strong>&nbsp;(and future-proof your online presence), let’s talk.</p><p>📩 Contact us today to get started.</p><p><strong>Final Thought:</strong></p><p>Mobile-first design isn’t just a trend it\'s the standard. In 2025 and beyond, your website must work flawlessly on mobile if you want to stay competitive. The question is no longer&nbsp;<em>\"Should I design for mobile first?\"</em>&nbsp;but&nbsp;<em>\"How soon can I start?\"</em></p>', 0, '2025-10-28 03:23:36', 'designing-for-mobile-first:-why-it’s-no-longer-optional'),
(54, '1755086295293-The Future is your business.jpeg', 'AI Tools That Can Save Your Business Hours Every Week', '<h3><strong>1. ChatGPT: Content Creation &amp; Customer Support</strong></h3><p>If you’ve ever struggled to write social media captions, blog posts, or email responses, <strong>ChatGPT</strong> is a game-changer.</p><ul><li><strong>What it does:</strong> Generates human-like text for marketing content, customer replies, and even brainstorming ideas.</li><li><strong>Time saved:</strong> Up to 10 hours per week on writing and editing tasks.</li><li><strong>Pro Tip:</strong> Use it to draft outlines, then refine with your brand voice.</li><li><br></li></ul><h3><strong>2. Canva Magic Studio – AI-Powered Design</strong></h3><p>Not every business can hire a full-time designer—but Canva’s AI tools make it easy to create professional graphics fast.</p><ul><li><strong>What it does:</strong> Instantly generates social media posts, flyers, and presentations based on text prompts.</li><li><strong>Time saved:</strong> 3–5 hours per week on design work.</li><li><strong>Pro Tip:</strong> Keep branded templates ready so you can create marketing visuals in minutes.</li><li><br></li></ul><h3><strong>3. Trello + Butler – Automated Task Management</strong></h3><p>Project management can eat up hours if you’re constantly assigning tasks and following up manually.</p><ul><li><strong>What it does:</strong> AI-powered automation rules (via Butler) move cards, set due dates, and send reminders.</li><li><strong>Time saved:</strong> 2–4 hours per week on admin work.</li><li><strong>Pro Tip:</strong> Combine with Slack for instant task updates to your team.</li><li><br></li></ul><h3><strong>4. Grammarly – AI Writing Assistant</strong></h3><p>Typos and unclear writing can slow down communication and hurt your brand image.</p><ul><li><strong>What it does:</strong> Checks grammar, tone, clarity, and readability in real time.</li><li><strong>Time saved:</strong> 1–2 hours per week on proofreading.</li><li><strong>Pro Tip:</strong> Install the browser extension so it works across emails, documents, and social media.</li><li><br></li></ul><h3><strong>5. Zapier – AI-Driven Workflow Automation</strong></h3><p>Zapier connects over 5,000 apps, letting them “talk” to each other automatically.</p><ul><li><strong>What it does:</strong> Automates repetitive processes like saving email attachments to Google Drive or adding form responses to a spreadsheet.</li><li><strong>Time saved:</strong> 5–10 hours per week on data entry and manual workflows.</li><li><strong>Pro Tip:</strong> Start small—pick one process to automate, then expand.</li><li><br></li></ul><h3><strong>6. Otter.ai – AI Meeting Notes</strong></h3><p>Meetings are important, but note-taking can be distracting.</p><ul><li><strong>What it does:</strong> Transcribes meetings in real time and highlights key points.</li><li><strong>Time saved:</strong> 1–3 hours per week on summarizing discussions.</li><li><strong>Pro Tip:</strong> Share transcripts with team members who couldn’t attend.</li><li><br></li></ul><h3><strong>7. Jasper AI – Marketing Copywriting</strong></h3><p>If you run ads or landing pages, Jasper AI helps create persuasive marketing copy.</p><ul><li><strong>What it does:</strong> Writes ad headlines, product descriptions, and sales copy that converts.</li><li><strong>Time saved:</strong> 3–5 hours per week on campaign content.</li><li><strong>Pro Tip:</strong> Feed it examples of your best past copy for consistent tone.</li><li><br></li></ul><h2><strong>The Bottom Line</strong></h2><p>By integrating the right AI tools into your daily operations, you can easily reclaim <strong>10–20 hours every week </strong>time you can reinvest into strategy, innovation, or simply taking a well-earned break.</p><p>At Lasglowtech, we don’t just build websites and apps, we help businesses harness the latest tech, including AI, to operate more efficiently.</p><p><br></p><p> Contact us today and let’s find the perfect digital solutions for your workflow.</p>', 0, '2025-10-28 03:23:36', 'ai-tools-that-can-save-your-business-hours-every-week'),
(55, '1756205589330-download (69).jpeg', 'Dangerous Habits That Can Affect Designers & Creative People', '<p>Creativity is exciting, but being a designer or creative professional often comes with lifestyle habits that silently harm productivity, health, and even long-term creativity. Many of us push through tight deadlines, endless revisions, and late-night projects without realizing the damage we’re causing to our bodies and minds.</p><p>Here are some&nbsp;<strong>dangerous habits every creative person should avoid</strong>:</p><p>&nbsp;</p><p><strong>1. Ignoring Eye Strain</strong></p><p>Spending hours staring at screens without giving your eyes a break can cause blurred vision, headaches, and long-term eye issues.</p><p><br></p><p><strong>Tip:</strong>&nbsp;Follow the&nbsp;<strong>20-20-20 rule</strong>, every 20 minutes, look at something 20 feet away for at least 20 seconds.</p><p>&nbsp;</p><p><strong>2. Living on Caffeine</strong></p><p>Coffee and energy drinks can boost focus for a while, but relying on them long-term leads to jitters, poor sleep, and burnout.</p><p>&nbsp;<strong>Tip:</strong>&nbsp;Stay hydrated with water, and get enough rest instead of masking fatigue with caffeine.</p><p>&nbsp;</p><p><strong>3. Marathon Sitting</strong></p><p>Sitting for long hours without movement is a recipe for back pain, stiff muscles, and poor circulation.</p><p><strong>Tip:</strong>&nbsp;Stand up, stretch, or take a short walk every hour. Consider a standing desk if possible.</p><p><strong>4. Not Taking Breaks</strong></p><p>Skipping breaks makes you&nbsp;<em>feel</em>&nbsp;productive but actually reduces focus and creativity.</p><p><strong>Tip:</strong>&nbsp;Take 5–10 minute breaks between tasks. You’ll return with fresh energy and clearer ideas.</p><p><br></p><p><strong>5. Poor Posture</strong></p><p>Slouching at your desk may seem harmless, but it causes chronic pain, reduced lung capacity, and even low energy.</p><p><strong>Tip:</strong>&nbsp;Invest in an ergonomic chair and sit upright with your screen at eye level.</p><p><br></p><p><strong>6. Overworking &amp; Ignoring Work-Life Balance</strong></p><p>The “hustle mode” may bring quick results, but long-term it drains creativity and leads to burnout.</p><p><br></p><p><strong>Tip:</strong>&nbsp;Set boundaries, schedule downtime, and remember that rest is part of the creative process.</p><p><strong>7. Skipping Meals or Eating Junk</strong></p><p>Poor nutrition affects focus, mood, and energy. Many creatives grab fast food during deadlines.</p><p><strong>Tip:</strong>&nbsp;Prep healthy snacks like nuts or fruits to stay energized without sugar crashes.</p><p><br></p><p><strong>8. Neglecting Sleep</strong></p><p>Pulling all-nighters seems like dedication, but chronic sleep loss reduces memory, focus, and creative thinking.</p><p><strong>Tip:</strong>&nbsp;Aim for 6–8 hours of quality sleep. Your best ideas often come after rest.</p><p><br></p><p><strong>9. Isolation</strong></p><p>Working alone for too long reduces fresh perspectives and can harm mental health.</p><p><strong>Tip:</strong>&nbsp;Join creative communities, collaborate, or simply connect with friends for inspiration.</p><p><br></p><p><strong>10. Ignoring Physical Exercise</strong></p><p>A sedentary lifestyle makes the body sluggish and the mind less sharp.</p><p><strong>Tip:</strong>&nbsp;Include at least 20–30 minutes of physical activity daily—walks, stretches, or workouts.</p><p>&nbsp;</p><p><strong>11. Comparing Yourself Too Much</strong></p><p>Scrolling through social media and comparing your work to others kills confidence and creativity.</p><p><strong>Tip:</strong>&nbsp;Limit screen time and focus on your growth instead of comparison.</p><p><br></p><p><strong>12. Multitasking Excessively</strong></p><p>Trying to do too many things at once lowers efficiency and quality.</p><p><strong>Tip:</strong>&nbsp;Focus on one task at a time and use productivity methods like Pomodoro or time-blocking.</p><p><br></p><p><strong>13. Not Setting Boundaries with Clients</strong></p><p>Always being “available” for clients leads to stress and burnout.</p><p><strong>Tip:</strong>&nbsp;Set clear working hours and communicate them politely to clients.</p><p><br></p><p><strong>14. Neglecting Continuous Learning</strong></p><p>Design tools and trends evolve fast, ignoring updates limits growth.</p><p><br></p><p><strong>Tip:</strong>&nbsp;Dedicate time to learning new skills, tools, and design trends regularly.</p><p>&nbsp;</p><p><strong>In summary</strong></p><p>Designers and creative professionals thrive on passion, but without balance, bad habits can harm both health and creativity. By breaking these patterns and embracing healthier practices, you’ll not only produce better work but also enjoy a sustainable creative journey.</p><p>&nbsp;</p>', 0, '2025-10-28 03:23:36', 'dangerous-habits-that-can-affect-designers-&-creative-people'),
(57, '1772466396913-1756301894910-GRAPHIC DESIGN WORKFLOW.jpg', 'Graphic Design Workflow: From Idea to Execution ', '<p><br></p><p>Whether you’re just starting out in <strong>graphic design</strong> or you’ve been in the field for years, having a <strong>clear workflow</strong> is the key to creating designs that are not only beautiful but also effective and professional.</p><p>In my latest guide, I break down the <strong>step-by-step processes</strong> every designer should master:</p><p><br></p><ul><li>Creative Brief &amp; Discovery</li><li>Brainstorming &amp; Ideation</li><li>Design Execution</li><li>Review &amp; Feedback</li><li>Revisions &amp; Finalization</li><li>Delivery &amp; Handoff</li><li>Post-Project Reflection</li></ul><p>This resource is structured to help <strong>beginners build a solid foundation</strong> and for <strong>intermediate/advanced designers</strong> to refine their process, boost efficiency, and deliver consistent results.</p><p>Remember: <strong>Creativity thrives within structure </strong>a strong process doesn’t limit you, it guides you.</p>', 0, '2026-03-02 15:46:37', 'graphic-design-workflow-from-idea-to-execution'),
(59, '1772466464891-1768388804495-color cir 3.jpg', 'The Power of Color Psychology in Branding & Design', '<p>&nbsp;Color is light and the eye’s perception of visible light is nothing more, nothing less. While color relates to how an object interacts with light, how our brains interpret the information is equally (if not more) important to how we see color.</p><p>Colors are more than just visual elements,&nbsp;they carry meaning, evoke emotions, and influence decisions. For brands, the right color palette can make a lasting impression, strengthen identity, and even affect customer behavior. This is where color psychology comes in.</p><p><br></p><p>At Lasglowtech, we believe that every design choice matters, and understanding the psychology behind colors helps businesses communicate more effectively with their audience.</p><p>&nbsp;What is Color Psychology?</p><p>Color psychology is the study of how colors affect human emotions, perceptions, and behaviors. Different colors trigger different feelings , from trust and security to excitement and passion. That’s why businesses carefully select their brand colors to align with their values and target audience.</p><h3><br></h3><h3><strong>Color Formats Every Designer Should Know</strong></h3><p>Before diving into color meanings, let’s touch on formats:</p><p><br></p><p>HEX → #FF5733 (commonly used in web design)</p><p>RGBA → rgba(255, 87, 51, 1) (includes transparency)</p><p>HSLA → hsla(14, 100%, 60%, 1) (hue, saturation, lightness, alpha)</p><p><br></p><p>These formats allow flexibility when working across different platforms, ensuring brand&nbsp;</p><p>consistency.</p><p><br></p><h3><strong>&nbsp;Color Psychology in Branding</strong></h3><p>Here are some key colors and what they represent in branding:</p><p><br></p><p>Red → Energy, passion, urgency (used by Coca-Cola, YouTube)</p><p>Blue → Trust, reliability, calmness (used by Facebook, PayPal)</p><p>Yellow → Optimism, happiness, creativity (used by McDonald’s, Snapchat)</p><p>Green → Growth, health, nature (used by WhatsApp, Starbucks)</p><p>Black → Elegance, power, luxury (used by Nike, Chanel)</p><p>Purple → Royalty, creativity, imagination (used by Cadbury, Hallmark)</p><p><br></p><h3><strong>&nbsp;Why It Matters for Your Brand</strong></h3><p>Choosing the right color is not about preference; it’s about strategy. Colors should:</p><p><br></p><ul><li>&nbsp;Reflect your brand values</li><li>&nbsp;Appeal to your target audience</li><li>&nbsp;Differentiate you from competitors</li></ul><p>When used effectively, colors can influence buying decisions, build trust, and create strong emotional connections.</p><p><br></p><p>Final Thoughts</p><p>At Lasglowtech Digital Agency, we help businesses design with purpose. Whether it’s your logo, website, or social media branding, we ensure that your colors communicate the right message to your audience.</p><p>&nbsp;Need help choosing the perfect brand colors? Let’s talk!</p>', 0, '2026-03-02 15:47:45', 'the-power-of-color-psychology-in-branding-design'),
(60, '1772466284545-1758203750180-Blue and White Modern Smart Phone Blog Banner (2).jpg', ' Why You Should Submit Your Website to Google Search Console', '<p><br></p><p><br></p><p>Have you ever searched for your website on Google, but it didn’t appear in the results? Don’t panic ,this happens to many new websites. The truth is, Google may not even know your website exists yet. That’s why submitting your site to Google Search Console is one of the most important steps in Search Engine Optimization (SEO).</p><p><br></p><p>In this article, you’ll learn why Google Search Console matters, how to submit your site step by step, and common reasons why your site might not be showing on Google.</p><p><br></p><p>Google Search Console is a free tool that helps you manage and monitor your website’s presence in search results.</p><p><br></p><p>Here’s why you should submit your site:</p><p><br></p><p>1. Get Indexed Faster</p><p>&nbsp;&nbsp;&nbsp;</p><p>&nbsp;&nbsp;Submitting your site lets Google know it exists. Without it, indexing can take weeks or months.</p><p>&nbsp;&nbsp;&nbsp;</p><p>2. Understand Your SEO Performance</p><p>&nbsp;&nbsp;&nbsp;</p><p>&nbsp;&nbsp;Track keywords, impressions, clicks, and how often your site shows up in Google Search.</p><p>&nbsp;&nbsp;&nbsp;</p><p>3. Identify and Fix Issues</p><p>&nbsp;&nbsp;&nbsp;</p><p>&nbsp;&nbsp;Google notifies you if your website has errors like mobile usability problems, broken pages, or security warnings.</p><p>&nbsp;&nbsp;&nbsp;</p><p>4. Submit Your Sitemap&nbsp;</p><p>&nbsp;&nbsp;A sitemap gives Google a roadmap of your site’s pages, making crawling and indexing easier.</p><p>5. Boost Your Search Visibility**</p><p>&nbsp;&nbsp;&nbsp;</p><p>&nbsp;&nbsp;By actively monitoring Search Console, you can optimize pages and improve your chances of ranking higher.</p><p>&nbsp;&nbsp;&nbsp;</p><p><br></p><p>Step-by-Step: How to Submit Your Site to Google Search Console</p><p><br></p><p>these steps to ensure your website gets indexed properly:</p><p><br></p><p><strong> Step 1: Open Google Search Console</strong></p><p><br></p><p>Go to [Google Search Console](https://search.google.com/search-console/)</p><p><br></p><p>&nbsp;<strong>Step 2: Add Your Website (Property)</strong></p><p><br></p><p>- Click **“Add Property.”**</p><p>- Enter your full website URL (including https:// if your site has SSL).</p><p><br></p><p><strong>&nbsp;Step 3: Verify Ownership</strong></p><p><br></p><p>Google needs to confirm that you own the site. Choose one method:</p><p><br></p><p>- Add a DNS record via your hosting provider.</p><p>- Upload an **HTML verification file** to your site.</p><p>- Add a meta tag in your site’s `&lt;head&gt;` section.</p><p>- Verify via **Google Analytics** or **Google Tag Manager.**</p><p><br></p><p><strong>&nbsp;Step 4: Submit Your Sitemap</strong></p><p><br></p><p>- Find your sitemap (usually at `www.yourdomain.com/sitemap.xml`).</p><p>- Go to the **Sitemaps** section in Search Console.</p><p>- Paste the URL and click Submit.</p><p><br></p><p>&nbsp;Step 5: Request Indexing</p><p><br></p><p>- Use the URL Inspection Tool to check individual pages.</p><p>- Click Request Indexing** for faster crawling.</p><p><br></p><p><strong> Why Your Website May Not Be Showing on Google</strong></p><p><br></p><p>Even after submitting to Search Console, your website might still not appear in search results. Here are some common reasons:</p><p><br></p><p>1.New Website – Google hasn’t crawled it yet.</p><p>2. Poor SEO Optimization – no backlinks, weak keywords, or thin content.</p><p>3. Technical Issues – blocked by `robots.txt` or a `noindex` tag.</p><p>4.Mobile Usability Problems** – Google prioritizes mobile-friendly websites.</p><p>5.Slow Site Speed** – a slow website can harm your rankings.</p><p><br></p><p><br></p><p>Final Thoughts</p><p><br></p><p>If your website isn’t showing on Google, don’t worry. It’s not broken it just needs to be indexed. Submitting your site to Google Search Console** is the fastest way to:</p><p><br></p><p>- Tell Google your website exists.</p><p>- Get insights into your SEO performance.</p><p>- Fix problems that may prevent indexing.</p><p>- Improve your visibility in search results.</p><p>-&nbsp;</p><p><br></p><p>Start today: add your website, verify ownership, submit your sitemap, and monitor your performance regularly.</p><p><br></p><p>Your website deserves to be found — and Google Search Console is the key to making it happen.</p>', 0, '2026-03-02 15:44:45', 'why-you-should-submit-your-website-to-google-search-console'),
(63, '1772466429507-1765931857784-Image_fx.png', 'The Hidden Cost of DIY Websites: Why Your Business Needs a Professional Developer', '<p>In today’s digital age, having a website is no longer optional for businesses—it’s essential. Many business owners, especially startups, are tempted to save money by building their own websites using DIY platforms. While these tools promise simplicity and cost savings, there are hidden costs that often outweigh the initial benefits. Here’s why investing in a professional developer can save your business time, money, and stress in the long run.</p><p><br></p><h3><strong>1.Time Is Money</strong></h3><p>Building a website may seem simple on DIY platforms, but creating a fully functional, visually appealing, and user-friendly site takes significant time and effort. Business owners often underestimate the learning curve for these tools. The time spent troubleshooting, customizing templates, or figuring out integrations could be better spent growing your business. A professional developer can get your website up and running efficiently, freeing you to focus on your core operations.</p><p><br></p><p><br></p><h3><strong>2.Limited Customization and Scalability</strong></h3><p>DIY website builders are designed for simplicity, not uniqueness. While they offer pre-made templates, these can make your website look generic and fail to reflect your brand identity. Additionally, as your business grows, you may need advanced features like custom e-commerce solutions, booking systems, or integrations with other software. A DIY website may not scale easily, forcing you to rebuild from scratch later. Professional developers create custom solutions tailored to your specific needs and future growth.</p><p><br></p><h3>3. <strong>Hidden Technical Challenges</strong></h3><p>Even if a DIY website looks great, there are technical aspects you might overlook:</p><ul><li><strong>SEO limitations</strong>: DIY sites may not be optimized for search engines, limiting your visibility.</li><li><strong>Website speed</strong>: Slow-loading pages drive visitors away.</li><li><strong>Security risks</strong>: DIY platforms may lack robust security measures, leaving your site vulnerable to hacks.</li><li><strong>Mobile responsiveness</strong>: Templates don’t always translate well across devices.</li></ul><p>Professional developers handle these technical challenges, ensuring your website performs optimally and safely.</p><p><br></p><h4>. <strong>Poor User Experience (UX)</strong></h4><p>User experience is critical for converting visitors into customers. A DIY website might be visually appealing but may fail to guide users effectively. Poor navigation, inconsistent design, and lack of clear call-to-actions can frustrate visitors. Professional developers design intuitive websites that not only look great but also guide users seamlessly, increasing engagement and sales.</p><p><br></p><h3>5. <strong>Ongoing Maintenance Costs</strong></h3><p>Websites require regular updates, backups, and troubleshooting. DIY websites may seem cheap upfront, but the ongoing maintenance can become time-consuming and costly if issues arise. A professional developer can provide ongoing support, keeping your site updated, secure, and performing well—saving you unexpected headaches down the line.</p><p><br></p><h3>6. <strong>Brand Credibility</strong></h3><p>Your website is often the first impression potential customers have of your business. A poorly designed DIY site can make your business look unprofessional or untrustworthy. Investing in a professional developer ensures your website reflects your brand’s quality, builds trust, and positions you as a serious player in your industry.</p><p><br></p><h2><strong>Conclusion</strong></h2><p>While DIY website builders may seem like a cost-effective solution, the hidden cost in time, growth limitations, technical issues, user experience, and credibility can quickly add up. Partnering with a professional developer may require a larger initial investment, but it ensures a robust, scalable, and professional website that supports your business goals and growth.</p><p>Your website is more than just an online presence; it’s an investment in your brand’s future. Don’t let DIY shortcuts hold your business back.</p><p><br></p><p><br></p><p><br></p><p><br></p>', 0, '2026-03-02 15:47:09', 'the-hidden-cost-of-diy-websites-why-your-business-needs-a-professional-developer'),
(65, '1772466352497-1766059577712-lasglowblog1.png', 'What Is Product Design?', '<p>Product design is the process of <strong>creating digital or physical products that are useful, usable, and visually appealing</strong>. It combines <strong>user needs, business goals, and technology</strong> to design solutions that solve real problems. <span style=\"background-color: rgb(255, 255, 255); color: rgb(6, 25, 48);\">The key to successful product design is understanding the end-user customer, the person for whom the product is being created. Product designers attempt to solve real problems for real people by using empathy and knowledge of their prospective customers’ habits, behaviors, frustrations, needs, and wants.</span></p><p><br></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(6, 25, 48);\">﻿Good product design practices thread themselves throughout the entire product lifecycle. Product design is essential in creating the initial user experience and product offering, from pre-ideation user research to concept development to prototyping and usability testing.</span></p><p><br></p><p><br></p><h3><strong>Product designers focus on:</strong></h3><ul><li>Understanding users</li><li>Designing intuitive experiences</li><li>Testing and improving ideas</li><li>Collaborating with developers and stakeholders</li></ul><p><br></p><h3>Types of Product Design Roles:</h3><p><br></p><h3>1. <strong>Product Designer</strong></h3><p>The all-rounder responsible for the entire product experience.</p><p>They often combine UX, UI, research, and basic prototyping.</p><p><br></p><h3>2. <strong>UX (User Experience) Designer</strong></h3><p>Focuses on how users interact with a product.</p><p><br></p><p>Responsibilities include user flows, wireframes, usability testing, and information architecture.</p><p><br></p><h3>3. <strong>UI (User Interface) Designer</strong></h3><p>Concentrates on the visual side of the product, such as layouts, colors, typography, and design systems.</p><p><br></p><h3>4. <strong>User Researcher</strong></h3><p>Studies user behavior through interviews, surveys, and testing to inform better design decisions.</p><p><br></p><h3>5. <strong>Interaction / Motion Designer</strong></h3><p>Designs animations, transitions, and micro-interactions that improve usability and user engagement.</p><p><br></p><h3>6. <strong>Prototyper</strong></h3><p>Creates interactive prototypes to test ideas quickly before full development.</p><h2>Roles That Support Product Design (Not Design Roles)</h2><h3>• <strong>Data Analyst</strong></h3><p>Provides insights from user and product data to help designers and teams make informed decisions.</p><p><br></p><h3>• <strong>Graphic Designer</strong></h3><p>Supports branding, marketing visuals, and non-product design assets.</p><p><br></p><h3>Levels of Experience</h3><ul><li><strong>Junior/Associate Product Designer:</strong>&nbsp;Entry-level, supports senior designers.</li><li><strong>Product Designer:</strong>&nbsp;Mid-level, owns features or projects.</li><li><strong>Senior/Staff/Principal Product Designer:</strong>&nbsp;Leads complex projects, mentors others, sets design direction.&nbsp;</li></ul><p><br></p><p><br></p><h2><strong>What Does the Product Design Process Look Like?</strong></h2><p>The details of the product design process will vary from company to company, but these professionals tend to follow a similar philosophy or framework when it comes to&nbsp;<a href=\"https://www.productplan.com/glossary/design-thinking/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(34, 88, 164); background-color: transparent;\">design thinking</a>. As Cam Sackett explains,&nbsp;<a href=\"https://blog.prototypr.io/cam-sackett-product-designer-ea94eefc6000\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(34, 88, 164); background-color: transparent;\">the design-thinking process involves several steps</a>:</p><ol><li>Empathize with people</li><li>Define the problem</li><li>Ideate a solution</li><li>Build a prototype</li><li>Test the solution</li></ol><p><br></p><p>For more info check this</p><p>https://uxdesign.cc/the-13-roles-of-a-product-designer-be303fd85505</p><p><br></p><p>Conclusion:</p><p>Building successful products requires <strong>many disciplines</strong>, and product designers work <strong>within this ecosystem</strong>, not in isolation.</p><p>However, the key clarification is this</p><blockquote><strong>Product designers are not expected to be experts in all these roles.</strong></blockquote><blockquote>They are expected to <strong>collaborate</strong>, understand enough to work effectively, and specialize in design.</blockquote><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p>', 0, '2026-03-02 15:45:52', 'what-is-product-design'),
(66, '1772466177334-1755050145271-a901e502691cbe7dcadeaccccee62d46.jpg', 'Real-World Case Study: Revitalizing a Failing Brand with Strategic Design', '<p class=\"ql-align-justify\">When a brand starts losing relevance, customers, or trust, the problem is rarely just the logo. More often, it’s a disconnect between the brand’s <strong>identity, experience, and audience expectations</strong>.</p><p class=\"ql-align-justify\">This case study explores how strategic design—not just aesthetics—can revive a failing brand and reposition it for long-term growth.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>The Problem: A Brand Losing Its Footing</strong></p><p class=\"ql-align-justify\">The brand (a mid-sized service-based business) was struggling with:</p><p class=\"ql-align-justify\"><br></p><ul><li class=\"ql-align-justify\">Declining customer engagement</li><li class=\"ql-align-justify\">Inconsistent brand visuals</li><li class=\"ql-align-justify\">Poor digital presence</li><li class=\"ql-align-justify\">Low trust and brand recall</li></ul><p class=\"ql-align-justify\">Despite offering quality services, the brand <em>looked outdated and unreliable</em>. Customers didn’t feel confident engaging with it.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Step 1: Brand Audit &amp; Discovery</strong></p><p class=\"ql-align-justify\">The first phase focused on <strong>understanding the real problem</strong>.</p><p class=\"ql-align-justify\">This included:</p><ul><li class=\"ql-align-justify\">Reviewing existing brand assets</li><li class=\"ql-align-justify\">Analyzing customer feedback</li><li class=\"ql-align-justify\">Studying competitors</li><li class=\"ql-align-justify\">Identifying gaps in visual consistency and messaging</li><li class=\"ql-align-justify\"><br></li></ul><p class=\"ql-align-justify\"><strong>Key Insight:</strong></p><p class=\"ql-align-justify\">The brand’s visuals didn’t reflect its values, quality, or modern audience.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Step 2: Clarifying Brand Strategy</strong></p><p class=\"ql-align-justify\">Before any design work began, the brand’s foundation was redefined:</p><ul><li class=\"ql-align-justify\">Brand purpose and values</li><li class=\"ql-align-justify\">Target audience and emotional triggers</li><li class=\"ql-align-justify\">Brand personality (tone, voice, attitude)</li></ul><p class=\"ql-align-justify\">This step ensured that design decisions were <strong>intentional, not decorative</strong>.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Step 3: Visual Identity Redesign</strong></p><p class=\"ql-align-justify\">With strategy in place, the visual system was rebuilt:</p><ul><li class=\"ql-align-justify\">A simplified, modern logo</li><li class=\"ql-align-justify\">A refined color palette aligned with trust and clarity</li><li class=\"ql-align-justify\">Consistent typography for digital and print</li><li class=\"ql-align-justify\">A flexible design system</li></ul><p class=\"ql-align-justify\">The goal wasn’t to look trendy—but to look <strong>reliable, relevant, and recognizable</strong>.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Step 4: Digital Experience Upgrade</strong></p><p class=\"ql-align-justify\">The brand’s website and social platforms were redesigned with:</p><ul><li class=\"ql-align-justify\">Cleaner layouts</li><li class=\"ql-align-justify\">Improved readability</li><li class=\"ql-align-justify\">Stronger call-to-actions</li><li class=\"ql-align-justify\">Mobile-first usability</li></ul><p class=\"ql-align-justify\">Design focused on <strong>guiding users</strong>, not overwhelming them.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Step 5: Consistency Across Touchpoints</strong></p><p class=\"ql-align-justify\">From social media to marketing materials, every brand touchpoint was aligned:</p><ul><li class=\"ql-align-justify\">Unified visuals</li><li class=\"ql-align-justify\">Clear messaging</li><li class=\"ql-align-justify\">Consistent tone</li></ul><p class=\"ql-align-justify\">This consistency rebuilt trust and strengthened brand recall.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>The Results</strong></p><p class=\"ql-align-justify\">After the redesign:</p><ul><li class=\"ql-align-justify\">Customer engagement increased</li><li class=\"ql-align-justify\">Brand perception improved</li><li class=\"ql-align-justify\">Digital conversions grew</li><li class=\"ql-align-justify\">The brand regained relevance and confidence</li></ul><p class=\"ql-align-justify\">The transformation proved one thing</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Strategic design is a business tool, not a visual luxury.</strong></p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Key Takeaways</strong></p><ul><li class=\"ql-align-justify\">Design without strategy is decoration</li><li class=\"ql-align-justify\">Branding is about perception, not just visuals</li><li class=\"ql-align-justify\">Consistency builds trust</li><li class=\"ql-align-justify\">Good design solves real business problems</li></ul><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Final Thoughts</strong></p><p class=\"ql-align-justify\">A failing brand doesn’t always need a new product, it often needs a <strong>clearer identity and better experience</strong>.</p><p class=\"ql-align-justify\">When design is driven by strategy, it has the power to transform how people see, trust, and connect with a brand.</p><p class=\"ql-align-justify\">&nbsp;</p>', 0, '2026-03-02 15:42:58', 'real-world-case-study-revitalizing-a-failing-brand-with-strategic-design'),
(67, '1772466110135-1770282598123-cover2.jpg', 'Color Psychology in Branding: Modern Interpretations for 2026', '<p class=\"ql-align-justify\">In branding, color is never just decoration. It is a silent communicator that shapes perception, builds emotional connection, and influences decision-making. Color psychology in branding is evolving to reflect changes in technology, culture, and consumer behavior.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Modern brands are no longer asking <em>“What does this color traditionally mean?”</em> Instead, they are asking <em>“How does this color feel in today’s digital and emotional landscape?”</em></p><p class=\"ql-align-justify\">This shift is redefining how designers and businesses approach color strategy.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>The Evolution of Color Psychology in Branding</strong></p><p class=\"ql-align-justify\">Traditional color psychology focused on fixed meanings:</p><ul><li class=\"ql-align-justify\">Blue represented trust and reliability</li><li class=\"ql-align-justify\">Red symbolized passion or urgency</li><li class=\"ql-align-justify\">Green stood for growth and sustainability</li></ul><p class=\"ql-align-justify\">While these associations still exist, they are no longer enough. Today’s audiences are visually sophisticated and emotionally selective. In 2026, color meaning is shaped by <strong>context, application, and experience</strong>, not theory alone.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\">A single color can communicate multiple emotions depending on:</p><ul><li class=\"ql-align-justify\">Tone and saturation</li><li class=\"ql-align-justify\">Supporting typography</li><li class=\"ql-align-justify\">Motion and interaction</li><li class=\"ql-align-justify\">Cultural background</li><li class=\"ql-align-justify\">Digital environment</li></ul><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Context Over Convention</strong></p><p class=\"ql-align-justify\">One of the biggest shifts in modern branding is the move from rigid color rules to <strong>context-driven design</strong>.</p><p class=\"ql-align-justify\">For example:</p><ul><li class=\"ql-align-justify\">Blue can feel corporate, calming, futuristic, or distant depending on how it’s used.</li><li class=\"ql-align-justify\">Green can represent eco-consciousness, wealth, wellness, or technology.</li><li class=\"ql-align-justify\">Black may signal luxury, minimalism, or rebellion.</li></ul><p class=\"ql-align-justify\">In 2026, brands define color meaning through <strong>use-case and storytelling</strong>, not outdated assumptions.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>The Rise of Soft Neutrals and Human-Centered Palettes</strong></p><p class=\"ql-align-justify\">Minimalism isn’t disappearing—but it’s evolving.</p><p class=\"ql-align-justify\">Harsh black-and-white palettes are giving way to:</p><ul><li class=\"ql-align-justify\">Warm grays</li><li class=\"ql-align-justify\">Off-whites</li><li class=\"ql-align-justify\">Earth tones</li><li class=\"ql-align-justify\">Muted pastels</li></ul><p class=\"ql-align-justify\">These colors help brands feel more <strong>approachable, calm, and human</strong>, especially in industries like tech, fintech, wellness, and SaaS.</p><p class=\"ql-align-justify\">This shift reflects a growing desire for emotional safety and authenticity in digital experiences.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Strategic Use of Bold Accent Colors</strong></p><p class=\"ql-align-justify\">While base palettes are becoming softer, accent colors are becoming more expressive.</p><p class=\"ql-align-justify\">Brands are using bold colors intentionally for:</p><ul><li class=\"ql-align-justify\">Call-to-action buttons</li><li class=\"ql-align-justify\">Progress indicators</li><li class=\"ql-align-justify\">Notifications</li><li class=\"ql-align-justify\">Micro-interactions</li></ul><p class=\"ql-align-justify\">Instead of overwhelming users, these colors guide attention and improve usability.</p><p class=\"ql-align-justify\"><strong>Modern branding in 2026 is about balance , </strong>calm foundations paired with confident highlights.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Technology’s Influence on Color Psychology</strong></p><p class=\"ql-align-justify\">Color today must function across multiple platforms and environments:</p><ul><li class=\"ql-align-justify\">Light and dark mode</li><li class=\"ql-align-justify\">OLED and high-contrast screens</li><li class=\"ql-align-justify\">Motion interfaces</li><li class=\"ql-align-justify\">AR and immersive experiences</li></ul><p class=\"ql-align-justify\">This has pushed designers to consider:</p><ul><li class=\"ql-align-justify\">Accessibility and contrast</li><li class=\"ql-align-justify\">Visual comfort</li><li class=\"ql-align-justify\">Emotional response during interaction</li><li class=\"ql-align-justify\">Consistency across devices</li></ul><p class=\"ql-align-justify\">Color psychology is now deeply connected to <strong>user experience (UX)</strong>, not just visual appeal.</p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-justify\"><strong>Cultural Awareness in Global Branding</strong></p><p class=\"ql-align-justify\">As brands become increasingly global, cultural interpretation of color is more important than ever.</p><p class=\"ql-align-justify\">A color that feels positive in one region may carry a completely different meaning in another. Successful brands in 2026 invest in:</p><ul><li class=\"ql-align-justify\">Cultural research</li><li class=\"ql-align-justify\">Market testing</li><li class=\"ql-align-justify\">Flexible brand color systems</li></ul><p class=\"ql-align-justify\">This ensures inclusivity, relevance, and emotional resonance across diverse audiences.</p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-justify\"><strong>Purpose-Driven Color Choices</strong></p><p class=\"ql-align-justify\">Modern consumers support brands that stand for something. Color is now a tool for expressing values such as:</p><ul><li class=\"ql-align-justify\">Sustainability</li><li class=\"ql-align-justify\">Transparency</li><li class=\"ql-align-justify\">Innovation</li><li class=\"ql-align-justify\">Inclusivity</li></ul><p class=\"ql-align-justify\">Earth tones, soft gradients, and clean digital hues are often used to reinforce trust and purpose. Color has become a key part of <strong>brand storytelling</strong>.</p><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Conclusion: Designing with Color in 2026</strong></p><p class=\"ql-align-justify\">Color psychology in branding is no longer about memorizing rules, it’s about understanding people.</p><p class=\"ql-align-justify\">In 2026, successful brands will:</p><ul><li class=\"ql-align-justify\">Design with emotional intelligence</li><li class=\"ql-align-justify\">Use color intentionally, not habitually</li><li class=\"ql-align-justify\">Adapt palettes to digital experiences</li><li class=\"ql-align-justify\">Align color with brand values</li></ul><p class=\"ql-align-justify\">Whether you’re building a visual identity, designing a UI, or rebranding a business, remember:</p><p class=\"ql-align-justify\"><strong>Color doesn’t just attract attention it creates connection.</strong></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Subscribe to get daily tips on your email daily</strong></p><p class=\"ql-align-justify\">&nbsp;</p>', 0, '2026-03-02 15:41:50', 'color-psychology-in-branding-modern-interpretations-for-2026');
INSERT INTO `posts` (`id`, `cover`, `title`, `content`, `shares`, `timestamp`, `slug`) VALUES
(70, '1772465782055-1768209793397-REVITALIZE A FAILING BRAND.jpg', 'Designing for Accessibility: Making Your Graphics Inclusive for Everyone', '<p class=\"ql-align-justify\">When you design a graphic, who are you designing it for? If your answer is \"everyone,\" then accessibility isn\'t optional it\'s fundamental.</p><p class=\"ql-align-justify\">Accessible design means creating visuals that work for people who are colorblind, those using screen readers, users with cognitive differences, and everyone in between. It\'s the difference between a graphic that merely looks good and one that genuinely communicates.</p><p class=\"ql-align-justify\">This guide breaks down the core principles you need: color contrast that actually works, typography people can read, alternative text that adds value, and motion graphics that enhance rather than exclude. We\'re going beyond the minimum requirements to help you create graphics that deliver a better experience for all your users.</p><p class=\"ql-align-justify\">Ready to make your designs more inclusive? Let’s get started.</p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-justify\"><strong>Why Accessibility in Design Matters</strong></p><p class=\"ql-align-justify\">Accessibility is not just about compliance or ticking boxes. It’s about empathy, usability, and impact. Over a billion people worldwide live with some form of disability, and many more experience temporary or situational limitations poor lighting, a cracked screen, slow internet, or one-handed use.</p><p class=\"ql-align-justify\">When your designs are accessible:</p><p class=\"ql-align-justify\"><br></p><ul><li class=\"ql-align-justify\">More people can understand and engage with your content</li><li class=\"ql-align-justify\">Your message is clearer and more effective</li><li class=\"ql-align-justify\">Your brand appears thoughtful, professional, and inclusive</li><li class=\"ql-align-justify\">You improve usability for&nbsp;<em>everyone</em>, not just people with disabilities</li></ul><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Good accessibility is good design.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>1. Use Color With Intention (Not as the Only Signal)</strong></p><p class=\"ql-align-justify\">Color is powerful, but it can also be limiting. Many users experience color vision deficiencies, making it difficult to distinguish certain combinations like red/green or blue/purple.</p><p class=\"ql-align-justify\"><strong>Best practices:</strong></p><ul><li class=\"ql-align-justify\">Maintain strong contrast between text and background</li><li class=\"ql-align-justify\">Avoid using color alone to communicate meaning (e.g., “errors in red only”)</li><li class=\"ql-align-justify\">Pair color with icons, labels, or patterns</li><li class=\"ql-align-justify\">Test your designs in grayscale to ensure clarity</li></ul><p class=\"ql-align-justify\">If the message disappears when the color does, the design needs work.</p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-justify\"><strong>2. Typography That’s Actually Readable</strong></p><p class=\"ql-align-justify\">Beautiful fonts mean nothing if users struggle to read them. Typography plays a huge role in accessibility, especially for users with visual impairments or dyslexia.</p><p class=\"ql-align-justify\"><strong>Accessibility-friendly typography tips:</strong></p><ul><li class=\"ql-align-justify\">Use clear, legible fonts over decorative ones</li><li class=\"ql-align-justify\">Maintain adequate font size and line spacing</li><li class=\"ql-align-justify\">Avoid long blocks of uppercase text</li><li class=\"ql-align-justify\">Keep line lengths comfortable to reduce eye strain</li></ul><p class=\"ql-align-justify\">Your goal is not to impress with fancy type it’s to communicate clearly.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>3. Design for Screen Readers and Assistive Tools</strong></p><p class=\"ql-align-justify\">Not everyone experiences visuals visually. Screen readers interpret content through structure and text alternatives.</p><p class=\"ql-align-justify\"><strong>Key considerations:</strong></p><ul><li class=\"ql-align-justify\">Provide meaningful alternative (alt) text for images</li><li class=\"ql-align-justify\">Avoid embedding critical information inside images alone</li><li class=\"ql-align-justify\">Ensure visual hierarchy matches logical reading order</li></ul><p class=\"ql-align-justify\">Alt text should describe&nbsp;<em>purpose</em>, not just appearance. Ask yourself: what should the user understand from this image?</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>4. Motion and Animation: Less Flash, More Purpose</strong></p><p class=\"ql-align-justify\">Motion can enhance storytelling, but excessive or uncontrolled animation can overwhelm or even harm some users.</p><p class=\"ql-align-justify\"><strong>Inclusive motion design tips:</strong></p><ul><li class=\"ql-align-justify\">Avoid rapid flashing or intense transitions</li><li class=\"ql-align-justify\">Keep animations purposeful, not decorative</li><li class=\"ql-align-justify\">Respect reduced-motion preferences</li><li class=\"ql-align-justify\">Ensure content remains usable without animation</li></ul><p class=\"ql-align-justify\">If motion distracts from the message, it’s not serving the design.</p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-justify\"><strong>5. Simplify Layouts and Reduce Cognitive Load</strong></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Accessibility also means mental accessibility. Overcrowded layouts, inconsistent patterns, and unclear navigation increase cognitive effort.</p><p class=\"ql-align-justify\"><strong>Design for clarity:</strong></p><ul><li class=\"ql-align-justify\">Use consistent layouts and spacing</li><li class=\"ql-align-justify\">Group related elements clearly</li><li class=\"ql-align-justify\">Prioritize information hierarchy</li><li class=\"ql-align-justify\">Remove unnecessary visual noise</li></ul><p class=\"ql-align-justify\">Clear design helps users focus on what matters most.</p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-justify\"><strong>6. Test With Real Users (and Real Scenarios)</strong></p><p class=\"ql-align-justify\">No checklist can replace real-world testing. Accessibility improves when you test designs under different conditions.</p><p class=\"ql-align-justify\">Try:</p><ul><li class=\"ql-align-justify\">Viewing designs on small screens</li><li class=\"ql-align-justify\">Testing with keyboard-only navigation</li><li class=\"ql-align-justify\">Using contrast and accessibility checkers</li><li class=\"ql-align-justify\">Getting feedback from diverse users</li></ul><p class=\"ql-align-justify\">Accessibility is an ongoing process, not a one-time task.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Final Thoughts</strong></p><p class=\"ql-align-justify\">Designing for accessibility isn’t about limitation ,it’s about expansion. It pushes you to think more clearly, design more intentionally, and communicate more effectively.</p><p class=\"ql-align-justify\">When you design with inclusion in mind, you don’t just reach more people you respect them.</p><p class=\"ql-align-justify\">And that’s what great design is all about.</p>', 0, '2026-03-02 15:36:24', 'designing-for-accessibility-making-your-graphics-inclusive-for-everyone');

-- --------------------------------------------------------

--
-- Table structure for table `service_orders`
--

CREATE TABLE `service_orders` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `catalogue_id` int DEFAULT NULL,
  `service_slug` varchar(220) COLLATE utf8mb4_general_ci NOT NULL,
  `service_name` varchar(220) COLLATE utf8mb4_general_ci NOT NULL,
  `customer_name` varchar(180) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NGN',
  `payment_type` enum('full','deposit') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'full',
  `status` enum('initiated','pending','paid','failed','cancelled') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'initiated',
  `tx_ref` varchar(220) COLLATE utf8mb4_general_ci NOT NULL,
  `flutterwave_tx_id` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `flutterwave_ref` varchar(180) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_link` varchar(400) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `invoice_number` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `invoice_sent_at` datetime DEFAULT NULL,
  `email_notification_status` enum('pending','sent','failed','skipped') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `email_notification_error` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `invoice_email_status` enum('pending','sent','failed','skipped') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `invoice_email_error` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_orders`
--

INSERT INTO `service_orders` (`id`, `user_id`, `catalogue_id`, `service_slug`, `service_name`, `customer_name`, `email`, `amount`, `currency`, `payment_type`, `status`, `tx_ref`, `flutterwave_tx_id`, `flutterwave_ref`, `payment_link`, `paid_at`, `created_at`, `updated_at`, `invoice_number`, `invoice_sent_at`, `email_notification_status`, `email_notification_error`, `invoice_email_status`, `invoice_email_error`) VALUES
(1, 1, 5, 'graphic-designs', 'Graphic Designs', 'Austinosaz', 'omozemojeau@gmail.com', 200000.00, 'NGN', 'full', 'pending', 'LASGLOW-graphic-designs-1772322323582', NULL, NULL, 'https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01kjka92exm9f69z7yp72z7g2g', NULL, '2026-02-28 20:45:23', '2026-02-28 20:45:25', NULL, NULL, 'pending', NULL, 'pending', NULL),
(2, 1, 5, 'graphic-designs', 'Graphic Designs', 'Austinosaz', 'omozemojeau@gmail.com', 200000.00, 'NGN', 'full', 'pending', 'LASGLOW-graphic-designs-1772322662616', NULL, NULL, 'https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01kjkakcsk5skwg8bhxw8y4fcj', NULL, '2026-02-28 20:51:02', '2026-02-28 20:51:04', NULL, NULL, 'pending', NULL, 'pending', NULL),
(3, 2, 3, 'ui-ux-design', 'UI/UX Design', 'Austinosaz', 'lasglowtech@gmail.com', 2000.00, 'NGN', 'full', 'paid', 'LASGLOW-ui-ux-design-1772322995577', '1993000851', '090110260301005950913500793721', 'https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01kjkaxjsvb434xkcz1jhk08az', '2026-03-01 01:30:38', '2026-02-28 20:56:35', '2026-02-28 21:30:38', 'LGT-INV-20260301-3', '2026-03-01 01:14:36', 'pending', NULL, 'pending', NULL),
(4, 2, 1, 'web-development', 'Web Development', 'OMONO', 'lasglowtech@gmail.com', 150000.00, 'NGN', 'deposit', 'pending', 'LASGLOW-web-development-1772389776266', NULL, NULL, 'https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01kjnakgd2ywcnpvp9swj933rv', NULL, '2026-03-01 15:29:36', '2026-03-01 15:29:37', NULL, NULL, 'pending', NULL, 'pending', NULL),
(5, 2, 1, 'web-development', 'Web Development', 'OMONO', 'lasglowtech@gmail.com', 150000.00, 'NGN', 'deposit', 'pending', 'LASGLOW-web-development-1772390206181', NULL, NULL, 'https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01kjnb0kyx8yrgbk5rs59b7297', NULL, '2026-03-01 15:36:46', '2026-03-01 15:36:47', NULL, NULL, 'pending', NULL, 'pending', NULL),
(6, 2, 4, 'graphic-design', 'Graphic Design', 'OMONO', 'lasglowtech@gmail.com', 50000.00, 'NGN', 'full', 'pending', 'LASGLOW-graphic-design-1772411985035', NULL, NULL, 'https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01kjnzs98fb02m6xeevmgbhz10', NULL, '2026-03-01 21:39:45', '2026-03-01 21:39:46', NULL, NULL, 'pending', NULL, 'pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('client','talent','student','learner','admin') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'client',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Austinosaz', 'omozemojeau@gmail.com', '$2b$10$w1b.93yUH2axjSHMoPga5u4yHTb07cDhiiiTNnvSq7PxqnfO9AN3G', 'admin', '2026-02-28 12:41:34'),
(2, 'OMONO', 'lasglowtech@gmail.com', '$2b$10$lHW8SwepqxcBmenT5Uu9huBqU3Mg8pIt2PUI179cx1T0hzOss9RiW', 'client', '2026-02-28 14:22:55'),
(3, 'Osaz', 'lasglowtech+32@gmail.com', '$2b$10$HHiZ1ILITXENNb5j2FxfZuP0.GEm61M80PCrxGAlVAWcyY1fjV.AK', 'client', '2026-02-28 19:23:10'),
(4, 'Mike', 'omozemojeau+34@gmail.com', '$2b$10$fjKiAloBlRi6vohKFG8hWOLoJ5NPh7l4dFGmyNCeefE9Cp.Mv4iAi', 'client', '2026-02-28 19:28:06'),
(5, 'TAYE', 'omozemojeau+67@gmail.com', '$2b$10$UptfqCrK0opPsQeMt4W5Kubo3VFjmpqmQvWCSbNJnW/ut1Iwspoly', 'student', '2026-02-28 19:29:46'),
(6, 'Isaac', 'omozemojeau+1@gmail.com', '$2b$10$4.ubrmLR7suBad/6k0fA0OiCv.xWKFYSLIANJreYbUdmC3Flu2lZO', 'learner', '2026-02-28 22:11:30'),
(7, 'Austine', 'omozemojeau+@gmail.com', '$2b$10$3RdHBTdxSnOIRxfKrlrEieoVoljG4BX..ra0BJdze4wSzTLMZCu5K', 'learner', '2026-03-01 15:43:38'),
(8, 'Blaize', 'lasglowech+1@gmail.com', '$2b$10$BHiCUn1F9aWnw3sgaclvSuLff/A/NPqynuFy9rZ26zEbF5y5cI72y', 'talent', '2026-03-02 09:57:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bulk_email_campaigns`
--
ALTER TABLE `bulk_email_campaigns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bulk_email_recipients`
--
ALTER TABLE `bulk_email_recipients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `career_applications`
--
ALTER TABLE `career_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `catalogues`
--
ALTER TABLE `catalogues`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `email_subscriptions`
--
ALTER TABLE `email_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_orders`
--
ALTER TABLE `service_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tx_ref` (`tx_ref`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bulk_email_campaigns`
--
ALTER TABLE `bulk_email_campaigns`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bulk_email_recipients`
--
ALTER TABLE `bulk_email_recipients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `career_applications`
--
ALTER TABLE `career_applications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `catalogues`
--
ALTER TABLE `catalogues`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `email_subscriptions`
--
ALTER TABLE `email_subscriptions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
