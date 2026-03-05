-- Admin-filled certificate details (message, signed date, signature label).
-- Run once if your lms_enrollments table was created before these columns existed.

ALTER TABLE lms_enrollments ADD COLUMN certificate_message TEXT NULL;
ALTER TABLE lms_enrollments ADD COLUMN certificate_signed_at DATETIME NULL;
ALTER TABLE lms_enrollments ADD COLUMN certificate_signature_label VARCHAR(120) NULL;
