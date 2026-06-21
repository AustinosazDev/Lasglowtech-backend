const db = require('../db');

/** Maps career application skill options to LMS course slug/title keywords. */
const SKILL_COURSE_KEYWORDS = {
  'UI/UX Design': ['ui-ux', 'ui/ux'],
  'Web Development': ['frontend-web', 'web development'],
  'Mobile App Development': ['mobile'],
  'Graphic Design': ['graphic'],
  'Digital Product Management': ['product'],
  'Content / Social Media Design': ['social', 'content'],
};

const resolveCourseIdForSkill = async (skillInterest) => {
  const skill = String(skillInterest || '').trim();
  if (!skill) return null;

  const [courses] = await db.query(
    'SELECT id, title, slug FROM lms_courses WHERE is_published = 1 ORDER BY id ASC'
  );
  if (!courses.length) return null;

  const skillLower = skill.toLowerCase();

  const direct = courses.find(
    (c) =>
      c.title.toLowerCase() === skillLower ||
      c.title.toLowerCase().includes(skillLower) ||
      skillLower.includes(c.title.toLowerCase())
  );
  if (direct) return direct.id;

  const keywords = SKILL_COURSE_KEYWORDS[skill] || [];
  if (keywords.length) {
    const matched = courses.find((c) => {
      const title = c.title.toLowerCase();
      const slug = c.slug.toLowerCase();
      return keywords.some((k) => title.includes(k.replace(/-/g, ' ')) || slug.includes(k));
    });
    if (matched) return matched.id;
  }

  const firstToken = skillLower.split(/[\s/]+/).filter(Boolean)[0];
  if (firstToken) {
    const tokenMatch = courses.find(
      (c) => c.title.toLowerCase().includes(firstToken) || c.slug.toLowerCase().includes(firstToken)
    );
    if (tokenMatch) return tokenMatch.id;
  }

  return null;
};

const enrollUserInCourse = async (userId, courseId) => {
  if (!userId || !courseId) return false;
  await db.query(
    `INSERT INTO lms_enrollments (user_id, course_id, status, progress_percent)
     VALUES (?, ?, 'active', 0)
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
    [userId, courseId]
  );
  return true;
};

const ensureUserEnrolledForAcceptedApplication = async (application) => {
  if (!application || application.status !== 'accepted') return null;
  const userId = application.user_id;
  if (!userId) return null;

  const courseId = await resolveCourseIdForSkill(application.skill_interest);
  if (!courseId) return null;

  await enrollUserInCourse(userId, courseId);
  return courseId;
};

/** Backfill LMS enrollment for accepted applications that are not yet enrolled. */
const syncCareerEnrollmentForUser = async (userId) => {
  if (!userId) return null;

  const [apps] = await db.query(
    `SELECT user_id, skill_interest, status
     FROM career_applications
     WHERE user_id = ? AND status = 'accepted'
     ORDER BY id DESC
     LIMIT 1`,
    [userId]
  );

  if (!apps.length) return null;
  return ensureUserEnrolledForAcceptedApplication(apps[0]);
};

module.exports = {
  resolveCourseIdForSkill,
  enrollUserInCourse,
  ensureUserEnrolledForAcceptedApplication,
  syncCareerEnrollmentForUser,
};
