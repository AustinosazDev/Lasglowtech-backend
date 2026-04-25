ALTER TABLE lms_courses
  ADD COLUMN IF NOT EXISTS brochure_url VARCHAR(500) NULL AFTER image_url;
