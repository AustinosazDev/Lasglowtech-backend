-- LMS course/module schedule columns.
-- Run once if tables were created before scheduling fields were added.

ALTER TABLE lms_courses ADD COLUMN schedule_start_date DATE NULL;
ALTER TABLE lms_modules ADD COLUMN scheduled_date DATE NULL;
ALTER TABLE lms_modules ADD COLUMN scheduled_time VARCHAR(20) NULL;
