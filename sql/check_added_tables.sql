-- Verify that required tables and careers columns exist
-- Usage:
-- mysql -u <user> -p <database_name> < server/sql/check_added_tables.sql

SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('users', 'catalogues', 'career_applications', 'service_orders', 'payment_transactions', 'lms_courses', 'lms_modules', 'lms_enrollments', 'lms_progress', 'password_resets', 'bulk_email_campaigns', 'bulk_email_recipients')
ORDER BY table_name;

SELECT
  column_name,
  column_type
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'career_applications'
  AND column_name IN (
    'user_id',
    'access_token',
    'fee_amount',
    'payment_status',
    'follow_up_date',
    'cohort'
  )
ORDER BY column_name;

SELECT
  column_name,
  column_type
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'catalogues'
  AND column_name IN (
    'package_tier',
    'is_popular',
    'features_json'
  )
ORDER BY column_name;

SELECT
  column_name,
  column_type
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'service_orders'
  AND column_name IN (
    'invoice_number',
    'invoice_sent_at',
    'email_notification_status',
    'email_notification_error',
    'invoice_email_status',
    'invoice_email_error'
  )
ORDER BY column_name;

SELECT
  column_name,
  column_type
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'lms_enrollments'
  AND column_name IN (
    'certificate_code',
    'certificate_sent_at'
  )
ORDER BY column_name;

SELECT
  column_name,
  column_type
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'lms_modules'
  AND column_name IN (
    'slide_url',
    'video_url',
    'module_content',
    'reference_links_json'
  )
ORDER BY column_name;
