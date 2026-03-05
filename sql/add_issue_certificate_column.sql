-- Add per-course setting: issue certificate when learner completes 100%
-- Run once if your lms_courses table was created before this column existed.

ALTER TABLE lms_courses
  ADD COLUMN issue_certificate_on_completion TINYINT(1) NOT NULL DEFAULT 1;
