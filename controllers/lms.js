const path = require('path');
const fs = require('fs');
const db = require('../db');
const { buildCertificateHtml } = require('../utils/documents');
const { sendCourseCertificateEmail } = require('../utils/notifications');

/** Base URL for certificate assets (uploads). Prefer API_URL so the server that has the files is used. */
const getUploadsBaseUrl = () => {
  const base = (process.env.API_URL || process.env.SITE_URL || '').replace(/\/$/, '');
  return base || '';
};

const getCertificateLogoUrl = () => {
  const baseUrl = getUploadsBaseUrl();
  if (!baseUrl) return '';
  const logoPath = path.join(__dirname, '..', 'uploads', 'certificate-logo.png');
  return fs.existsSync(logoPath) ? `${baseUrl}/uploads/certificate-logo.png` : '';
};

const getCertificateBackgroundUrl = () => {
  if (process.env.CERTIFICATE_BACKGROUND_URL) return process.env.CERTIFICATE_BACKGROUND_URL.replace(/\/$/, '');
  const baseUrl = getUploadsBaseUrl();
  if (!baseUrl) return '';
  const bgPath = path.join(__dirname, '..', 'uploads', 'certificate-bg.png');
  if (!fs.existsSync(bgPath)) return '';
  try {
    const stat = fs.statSync(bgPath);
    const t = stat.mtime ? stat.mtime.getTime() : Date.now();
    return `${baseUrl}/uploads/certificate-bg.png?t=${t}`;
  } catch {
    return `${baseUrl}/uploads/certificate-bg.png`;
  }
};

const slugify = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const parseReferenceLinks = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || '').trim()).filter(Boolean);
    }
  } catch (_) {
    // ignore
  }
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getMyCertificatePayload = async ({ userId, enrollmentId }) => {
  const [[row]] = await db.query(
    `SELECT e.id, e.status, e.progress_percent, e.certificate_code, e.certificate_sent_at,
            e.certificate_message, e.certificate_signed_at, e.certificate_signature_label,
            u.username AS learner_name, c.title AS course_title
     FROM lms_enrollments e
     INNER JOIN users u ON u.id = e.user_id
     INNER JOIN lms_courses c ON c.id = e.course_id
     WHERE e.id = ? AND e.user_id = ?
     LIMIT 1`,
    [enrollmentId, userId]
  );

  if (!row) {
    const error = new Error('Enrollment not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!row.certificate_sent_at) {
    const error = new Error(
      'Certificate is available only after admin verification. Programme completion and payment must be acknowledged by Lasglowtech before download.'
    );
    error.statusCode = 400;
    throw error;
  }

  const [[paymentRow]] = await db.query(
    `SELECT id FROM career_applications WHERE user_id = ? AND payment_status IN ('paid', 'waived') LIMIT 1`,
    [userId]
  );
  if (!paymentRow) {
    const error = new Error(
      'Payment must be verified before you can download your certificate. Please ensure your programme fee is marked as paid.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (Number(row.progress_percent || 0) < 100 && row.status !== 'completed') {
    const error = new Error('Certificate is available after full completion.');
    error.statusCode = 400;
    throw error;
  }

  return {
    certificateCode: row.certificate_code || `LGT-CERT-${enrollmentId}`,
    recipientName: row.learner_name || 'Learner',
    courseName: row.course_title || 'Course',
    date: row.certificate_sent_at || new Date(),
    bodyMessage: (row.certificate_message != null ? row.certificate_message : '') || '',
    signedDate: row.certificate_signed_at || null,
    signatureLabel: row.certificate_signature_label || 'Authorized Signatory',
  };
};

const mapCourse = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  summary: row.summary,
  description: row.description,
  level: row.level,
  durationWeeks: row.duration_weeks,
  imageUrl: row.image_url || '',
  isFeatured: Boolean(row.is_featured),
  isPublished: Boolean(row.is_published),
  issueCertificateOnCompletion: row.issue_certificate_on_completion === undefined ? true : Boolean(row.issue_certificate_on_completion),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getPublishedCourses = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM lms_courses
       WHERE is_published = 1
       ORDER BY is_featured DESC, id DESC`
    );
    return res.status(200).json(rows.map(mapCourse));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM lms_courses WHERE slug = ? AND is_published = 1 LIMIT 1`,
      [slug]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    return res.status(200).json(mapCourse(rows[0]));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const enrollCourse = async (req, res) => {
  const userId = req.user?.id;
  const { courseId } = req.params;

  if (!userId || !courseId) {
    return res.status(400).json({ error: 'user and course are required.' });
  }

  try {
    const [exists] = await db.query('SELECT id FROM lms_courses WHERE id = ? AND is_published = 1 LIMIT 1', [courseId]);
    if (!exists.length) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    await db.query(
      `INSERT INTO lms_enrollments (user_id, course_id, status, progress_percent)
       VALUES (?, ?, 'active', 0)
       ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
      [userId, courseId]
    );

    return res.status(200).json({ message: 'Enrollment successful.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyLearningDashboard = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [enrollments] = await db.query(
      `SELECT e.id AS enrollment_id, e.status, e.progress_percent, e.created_at AS enrolled_at,
              c.id AS course_id, c.title, c.slug, c.summary, c.level, c.duration_weeks, c.image_url
       FROM lms_enrollments e
       INNER JOIN lms_courses c ON c.id = e.course_id
       WHERE e.user_id = ?
       ORDER BY e.id DESC`,
      [userId]
    );

    const enrollmentIds = enrollments.map((e) => e.enrollment_id);
    const [moduleStats] = enrollmentIds.length
      ? await db.query(
          `SELECT e.id AS enrollment_id,
                  COUNT(m.id) AS total_modules,
                  SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) AS completed_modules
           FROM lms_enrollments e
           LEFT JOIN lms_modules m ON m.course_id = e.course_id
           LEFT JOIN lms_progress p ON p.enrollment_id = e.id AND p.module_id = m.id
           WHERE e.id IN (?)
           GROUP BY e.id`,
          [enrollmentIds]
        )
      : [[]];

    const statsByEnrollment = Object.fromEntries(
      moduleStats.map((s) => [
        s.enrollment_id,
        {
          totalModules: Number(s.total_modules || 0),
          completedModules: Number(s.completed_modules || 0),
        },
      ])
    );

    const data = enrollments.map((e) => ({
      enrollmentId: e.enrollment_id,
      status: e.status,
      progressPercent: Number(e.progress_percent || 0),
      enrolledAt: e.enrolled_at,
      course: {
        id: e.course_id,
        title: e.title,
        slug: e.slug,
        summary: e.summary,
        level: e.level,
        durationWeeks: e.duration_weeks,
        imageUrl: e.image_url || '',
      },
      totalModules: statsByEnrollment[e.enrollment_id]?.totalModules || 0,
      completedModules: statsByEnrollment[e.enrollment_id]?.completedModules || 0,
    }));

    return res.status(200).json({ enrollments: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyCourseModules = async (req, res) => {
  const userId = req.user?.id;
  const { enrollmentId } = req.params;
  if (!userId || !enrollmentId) {
    return res.status(400).json({ error: 'Invalid request.' });
  }

  try {
    const [enRows] = await db.query('SELECT id, course_id FROM lms_enrollments WHERE id = ? AND user_id = ? LIMIT 1', [
      enrollmentId,
      userId,
    ]);
    if (!enRows.length) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    const enrollment = enRows[0];
    const [rows] = await db.query(
      `SELECT m.id, m.title, m.module_order, m.week_num, m.duration_minutes, m.resource_url, m.slide_url, m.video_url, m.module_content, m.reference_links_json,
              COALESCE(p.is_completed, 0) AS is_completed,
              p.last_position_seconds, p.completed_at
       FROM lms_modules m
       LEFT JOIN lms_progress p ON p.module_id = m.id AND p.enrollment_id = ?
       WHERE m.course_id = ?
       ORDER BY COALESCE(m.week_num, 99), m.module_order ASC, m.id ASC`,
      [enrollment.id, enrollment.course_id]
    );

    return res.status(200).json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        moduleOrder: r.module_order,
        week: r.week_num != null ? Number(r.week_num) : null,
        durationMinutes: r.duration_minutes,
        resourceUrl: r.resource_url || '',
        slideUrl: r.slide_url || '',
        videoUrl: r.video_url || '',
        moduleContent: r.module_content || '',
        referenceLinks: parseReferenceLinks(r.reference_links_json),
        isCompleted: Boolean(r.is_completed),
        lastPositionSeconds: Number(r.last_position_seconds || 0),
        completedAt: r.completed_at,
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateModuleProgress = async (req, res) => {
  const userId = req.user?.id;
  const { enrollmentId, moduleId } = req.params;
  const { isCompleted, lastPositionSeconds } = req.body;

  if (!userId || !enrollmentId || !moduleId) {
    return res.status(400).json({ error: 'Invalid request.' });
  }

  try {
    const [enRows] = await db.query(
      `SELECT e.id, e.course_id, e.status, e.certificate_code, e.certificate_sent_at,
              u.email AS learner_email, u.username AS learner_name, c.title AS course_title,
              COALESCE(c.issue_certificate_on_completion, 1) AS issue_certificate_on_completion
       FROM lms_enrollments e
       INNER JOIN users u ON u.id = e.user_id
       INNER JOIN lms_courses c ON c.id = e.course_id
       WHERE e.id = ? AND e.user_id = ?
       LIMIT 1`,
      [
      enrollmentId,
      userId,
      ]
    );
    if (!enRows.length) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    await db.query(
      `INSERT INTO lms_progress (enrollment_id, module_id, is_completed, last_position_seconds, completed_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_completed = VALUES(is_completed),
         last_position_seconds = VALUES(last_position_seconds),
         completed_at = VALUES(completed_at)`,
      [
        enrollmentId,
        moduleId,
        isCompleted ? 1 : 0,
        Number(lastPositionSeconds || 0),
        isCompleted ? new Date() : null,
      ]
    );

    const [[totals]] = await db.query(
      `SELECT COUNT(m.id) AS total_modules,
              SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) AS completed_modules
       FROM lms_modules m
       LEFT JOIN lms_progress p ON p.module_id = m.id AND p.enrollment_id = ?
       WHERE m.course_id = ?`,
      [enrollmentId, enRows[0].course_id]
    );

    const total = Number(totals?.total_modules || 0);
    const completed = Number(totals?.completed_modules || 0);
    const progressPercent = total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0;
    const status = progressPercent >= 100 ? 'completed' : 'active';

    await db.query('UPDATE lms_enrollments SET progress_percent = ?, status = ? WHERE id = ?', [
      progressPercent,
      status,
      enrollmentId,
    ]);

    const enrollment = enRows[0];
    const issueCert = Boolean(enrollment.issue_certificate_on_completion !== 0);
    if (status === 'completed' && !enrollment.certificate_sent_at && issueCert) {
      const certificateCode = enrollment.certificate_code || `LGT-CERT-${enrollment.course_id}-${enrollment.id}`;
      const certificateHtml = buildCertificateHtml({
        certificateCode,
        learnerName: enrollment.learner_name || 'Learner',
        courseTitle: enrollment.course_title || 'Course',
        completionDate: new Date(),
        certificateBackgroundUrl: getCertificateBackgroundUrl(),
        certificateLogoUrl: getCertificateLogoUrl(),
      });
      try {
        await sendCourseCertificateEmail({
          to: enrollment.learner_email,
          learnerName: enrollment.learner_name,
          courseTitle: enrollment.course_title,
          certificateCode,
          certificateHtml,
        });
        await db.query(
          `UPDATE lms_enrollments
           SET certificate_code = ?, certificate_sent_at = ?
           WHERE id = ?`,
          [certificateCode, new Date(), enrollment.id]
        );
      } catch (mailError) {
        console.error('Course certificate email error:', mailError.message);
      }
    }

    return res.status(200).json({ message: 'Progress updated.', progressPercent, status });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyCertificate = async (req, res) => {
  const userId = req.user?.id;
  const { enrollmentId } = req.params;
  if (!userId || !enrollmentId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = await getMyCertificatePayload({ userId, enrollmentId });
    const html = buildCertificateHtml({
      certificateCode: payload.certificateCode,
      learnerName: payload.recipientName,
      courseTitle: payload.courseName,
      completionDate: payload.date,
      bodyMessage: payload.bodyMessage,
      signedDate: payload.signedDate,
      signatureLabel: payload.signatureLabel,
      logoUrl: process.env.SITE_URL || process.env.FRONTEND_URL || '',
      certificateBackgroundUrl: getCertificateBackgroundUrl(),
      certificateLogoUrl: getCertificateLogoUrl(),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${payload.certificateCode}.html"`);
    return res.status(200).send(html);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getMyCertificateData = async (req, res) => {
  const userId = req.user?.id;
  const { enrollmentId } = req.params;
  if (!userId || !enrollmentId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = await getMyCertificatePayload({ userId, enrollmentId });
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getAdminCourses = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM lms_modules m WHERE m.course_id = c.id) AS modules_count,
              (SELECT COUNT(*) FROM lms_enrollments e WHERE e.course_id = c.id) AS enrollments_count
       FROM lms_courses c
       ORDER BY c.id DESC`
    );
    return res.status(200).json(
      rows.map((r) => ({
        ...mapCourse(r),
        modulesCount: Number(r.modules_count || 0),
        enrollmentsCount: Number(r.enrollments_count || 0),
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createCourse = async (req, res) => {
  const { title, summary, description, level, durationWeeks, imageUrl, isFeatured, isPublished, issueCertificateOnCompletion } = req.body;
  if (!title || !summary) {
    return res.status(400).json({ error: 'title and summary are required.' });
  }

  const slug = slugify(title);
  try {
    const [exists] = await db.query('SELECT id FROM lms_courses WHERE slug = ? LIMIT 1', [slug]);
    if (exists.length) {
      return res.status(409).json({ error: 'Course title already exists.' });
    }

    const issueCert = issueCertificateOnCompletion !== false;
    const [result] = await db.query(
      `INSERT INTO lms_courses
      (title, slug, summary, description, level, duration_weeks, image_url, is_featured, is_published, issue_certificate_on_completion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        summary,
        description || '',
        ['beginner', 'intermediate', 'advanced'].includes(level) ? level : 'beginner',
        Number(durationWeeks || 4),
        imageUrl || '',
        isFeatured ? 1 : 0,
        isPublished === false ? 0 : 1,
        issueCert ? 1 : 0,
      ]
    );

    return res.status(201).json({ id: result.insertId, slug, message: 'Course created.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, summary, description, level, durationWeeks, imageUrl, isFeatured, isPublished, issueCertificateOnCompletion } = req.body;
  if (!title || !summary) {
    return res.status(400).json({ error: 'title and summary are required.' });
  }
  const slug = slugify(title);
  const issueCert = issueCertificateOnCompletion !== false;

  try {
    const [exists] = await db.query('SELECT id FROM lms_courses WHERE slug = ? AND id != ? LIMIT 1', [slug, id]);
    if (exists.length) {
      return res.status(409).json({ error: 'Another course with this title exists.' });
    }

    await db.query(
      `UPDATE lms_courses
       SET title = ?, slug = ?, summary = ?, description = ?, level = ?, duration_weeks = ?, image_url = ?, is_featured = ?, is_published = ?, issue_certificate_on_completion = ?
       WHERE id = ?`,
      [
        title,
        slug,
        summary,
        description || '',
        ['beginner', 'intermediate', 'advanced'].includes(level) ? level : 'beginner',
        Number(durationWeeks || 4),
        imageUrl || '',
        isFeatured ? 1 : 0,
        isPublished === false ? 0 : 1,
        issueCert ? 1 : 0,
        id,
      ]
    );
    return res.status(200).json({ message: 'Course updated.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM lms_progress WHERE enrollment_id IN (SELECT id FROM lms_enrollments WHERE course_id = ?)', [id]);
    await db.query('DELETE FROM lms_enrollments WHERE course_id = ?', [id]);
    await db.query('DELETE FROM lms_modules WHERE course_id = ?', [id]);
    await db.query('DELETE FROM lms_courses WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Course deleted.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCourseModulesForAdmin = async (req, res) => {
  const { courseId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM lms_modules WHERE course_id = ? ORDER BY module_order ASC, id ASC', [courseId]);
    return res.status(200).json(
      rows.map((row) => ({
        ...row,
        reference_links: parseReferenceLinks(row.reference_links_json),
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createModule = async (req, res) => {
  const { courseId } = req.params;
  const { title, moduleOrder, weekNum, durationMinutes, resourceUrl, slideUrl, videoUrl, moduleContent, referenceLinks, isPreview } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }
  try {
    const [exists] = await db.query('SELECT id FROM lms_courses WHERE id = ? LIMIT 1', [courseId]);
    if (!exists.length) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    const week = weekNum != null && weekNum !== '' ? Number(weekNum) : null;
    const [result] = await db.query(
      `INSERT INTO lms_modules (course_id, title, module_order, week_num, duration_minutes, resource_url, slide_url, video_url, module_content, reference_links_json, is_preview)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        title,
        Number(moduleOrder || 1),
        week,
        Number(durationMinutes || 0),
        resourceUrl || '',
        slideUrl || '',
        videoUrl || '',
        moduleContent || '',
        JSON.stringify(parseReferenceLinks(referenceLinks)),
        isPreview ? 1 : 0,
      ]
    );
    return res.status(201).json({ id: result.insertId, message: 'Module created.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateModule = async (req, res) => {
  const { courseId, moduleId } = req.params;
  const { title, moduleOrder, weekNum, durationMinutes, resourceUrl, slideUrl, videoUrl, moduleContent, referenceLinks, isPreview } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  try {
    const [exists] = await db.query('SELECT id FROM lms_modules WHERE id = ? AND course_id = ? LIMIT 1', [moduleId, courseId]);
    if (!exists.length) {
      return res.status(404).json({ error: 'Module not found.' });
    }
    const week = weekNum != null && weekNum !== '' ? Number(weekNum) : null;
    await db.query(
      `UPDATE lms_modules
       SET title = ?, module_order = ?, week_num = ?, duration_minutes = ?, resource_url = ?, slide_url = ?, video_url = ?, module_content = ?, reference_links_json = ?, is_preview = ?
       WHERE id = ? AND course_id = ?`,
      [
        title,
        Number(moduleOrder || 1),
        week,
        Number(durationMinutes || 0),
        resourceUrl || '',
        slideUrl || '',
        videoUrl || '',
        moduleContent || '',
        JSON.stringify(parseReferenceLinks(referenceLinks)),
        isPreview ? 1 : 0,
        moduleId,
        courseId,
      ]
    );

    return res.status(200).json({ message: 'Module updated.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteModule = async (req, res) => {
  const { courseId, moduleId } = req.params;
  try {
    const [exists] = await db.query('SELECT id FROM lms_modules WHERE id = ? AND course_id = ? LIMIT 1', [moduleId, courseId]);
    if (!exists.length) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    await db.query('DELETE FROM lms_progress WHERE module_id = ?', [moduleId]);
    await db.query('DELETE FROM lms_modules WHERE id = ? AND course_id = ?', [moduleId, courseId]);
    return res.status(200).json({ message: 'Module deleted.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAdminEnrollments = async (req, res) => {
  const { courseId } = req.query;
  try {
    let sql = `
      SELECT e.id AS enrollment_id, e.user_id, e.course_id, e.status, e.progress_percent,
             e.certificate_code, e.certificate_sent_at, e.created_at AS enrolled_at,
             u.email AS learner_email, u.username AS learner_name,
             c.title AS course_title, c.slug AS course_slug
      FROM lms_enrollments e
      INNER JOIN users u ON u.id = e.user_id
      INNER JOIN lms_courses c ON c.id = e.course_id
    `;
    const params = [];
    if (courseId) {
      sql += ' WHERE e.course_id = ?';
      params.push(courseId);
    }
    sql += ' ORDER BY e.id DESC';
    const [rows] = await db.query(sql, params);
    return res.status(200).json(
      rows.map((r) => ({
        enrollmentId: r.enrollment_id,
        userId: r.user_id,
        courseId: r.course_id,
        courseTitle: r.course_title,
        courseSlug: r.course_slug,
        learnerEmail: r.learner_email,
        learnerName: r.learner_name || r.learner_email,
        status: r.status,
        progressPercent: Number(r.progress_percent || 0),
        certificateCode: r.certificate_code || null,
        certificateSentAt: r.certificate_sent_at || null,
        enrolledAt: r.enrolled_at,
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const adminPreviewCertificate = async (req, res) => {
  const { enrollmentId } = req.params;
  try {
    const [[row]] = await db.query(
      `SELECT e.id, e.certificate_code, e.certificate_sent_at, e.certificate_message,
              e.certificate_signed_at, e.certificate_signature_label,
              u.username AS learner_name, c.title AS course_title
       FROM lms_enrollments e
       INNER JOIN users u ON u.id = e.user_id
       INNER JOIN lms_courses c ON c.id = e.course_id
       WHERE e.id = ?
       LIMIT 1`,
      [enrollmentId]
    );
    if (!row) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    const certificateCode = row.certificate_code || `LGT-CERT-${enrollmentId}`;
    const html = buildCertificateHtml({
      certificateCode,
      learnerName: row.learner_name || 'Learner',
      courseTitle: row.course_title || 'Course',
      completionDate: row.certificate_sent_at || new Date(),
      bodyMessage: row.certificate_message != null ? row.certificate_message : '',
      signedDate: row.certificate_signed_at || null,
      signatureLabel: row.certificate_signature_label || 'Authorized Signatory',
      logoUrl: process.env.SITE_URL || process.env.FRONTEND_URL || '',
      certificateBackgroundUrl: getCertificateBackgroundUrl(),
      certificateLogoUrl: getCertificateLogoUrl(),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="certificate-preview.html"');
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const issueCertificateForEnrollment = async ({
  enrollmentId,
  recipientFullName,
  bodyMessage,
  signedDate,
  signatureLabel,
}) => {
  const [[row]] = await db.query(
    `SELECT e.id, e.course_id, e.status, e.certificate_code, e.certificate_sent_at,
            u.email AS learner_email, u.username AS learner_name, c.title AS course_title
     FROM lms_enrollments e
     INNER JOIN users u ON u.id = e.user_id
     INNER JOIN lms_courses c ON c.id = e.course_id
     WHERE e.id = ?
     LIMIT 1`,
    [enrollmentId]
  );

  if (!row) {
    const error = new Error('Enrollment not found.');
    error.statusCode = 404;
    throw error;
  }

  if (row.certificate_sent_at) {
    const error = new Error('Certificate already issued for this enrollment.');
    error.statusCode = 400;
    throw error;
  }

  const certificateCode = row.certificate_code || `LGT-CERT-${row.course_id}-${row.id}`;
  const issuedAt = new Date();
  const learnerName = (recipientFullName && String(recipientFullName).trim()) || row.learner_name || 'Learner';
  const certSignedAt = signedDate ? new Date(signedDate) : issuedAt;
  const certMessage = bodyMessage != null ? String(bodyMessage).trim() : null;
  const certSigLabel = (signatureLabel && String(signatureLabel).trim()) || null;
  const certificateHtml = buildCertificateHtml({
    certificateCode,
    learnerName,
    courseTitle: row.course_title || 'Course',
    completionDate: issuedAt,
    bodyMessage: certMessage || '',
    signedDate: certSignedAt,
    signatureLabel: certSigLabel || 'Authorized Signatory',
    logoUrl: process.env.SITE_URL || process.env.FRONTEND_URL || '',
    certificateBackgroundUrl: getCertificateBackgroundUrl(),
    certificateLogoUrl: getCertificateLogoUrl(),
  });

  try {
    await sendCourseCertificateEmail({
      to: row.learner_email,
      learnerName,
      courseTitle: row.course_title,
      certificateCode,
      certificateHtml,
    });
  } catch (mailError) {
    console.error('Admin issue certificate email error:', mailError.message);
  }

  await db.query(
    `UPDATE lms_enrollments
     SET status = 'completed', progress_percent = 100, certificate_code = ?, certificate_sent_at = ?,
         certificate_message = ?, certificate_signed_at = ?, certificate_signature_label = ?
     WHERE id = ?`,
    [certificateCode, issuedAt, certMessage, certSignedAt, certSigLabel, enrollmentId]
  );

  return {
    enrollmentId,
    learnerName,
    courseTitle: row.course_title,
    certificateCode,
    certificateSentAt: issuedAt.toISOString(),
  };
};

const adminIssueCertificate = async (req, res) => {
  const { enrollmentId } = req.params;
  const { bodyMessage, signedDate, signatureLabel, recipientFullName } = req.body || {};
  try {
    const result = await issueCertificateForEnrollment({
      enrollmentId,
      recipientFullName,
      bodyMessage,
      signedDate,
      signatureLabel,
    });
    return res.status(200).json({
      message: 'Certificate issued.',
      certificateCode: result.certificateCode,
      certificateSentAt: result.certificateSentAt,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const adminBatchIssueCertificates = async (req, res) => {
  const { enrollmentIds, bodyMessage, signedDate, signatureLabel } = req.body || {};
  const ids = Array.isArray(enrollmentIds)
    ? [...new Set(enrollmentIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]
    : [];

  if (!ids.length) {
    return res.status(400).json({ error: 'Select at least one enrollment.' });
  }

  const results = [];
  for (const enrollmentId of ids) {
    try {
      const result = await issueCertificateForEnrollment({
        enrollmentId,
        bodyMessage,
        signedDate,
        signatureLabel,
      });
      results.push({ enrollmentId, status: 'issued', ...result });
    } catch (error) {
      results.push({
        enrollmentId,
        status: 'failed',
        error: error.message,
      });
    }
  }

  const issuedCount = results.filter((item) => item.status === 'issued').length;
  const failedCount = results.length - issuedCount;
  return res.status(200).json({
    message: `Batch certificate processing completed. ${issuedCount} issued, ${failedCount} failed.`,
    issuedCount,
    failedCount,
    results,
  });
};

module.exports = {
  getPublishedCourses,
  getCourseBySlug,
  enrollCourse,
  getMyLearningDashboard,
  getMyCourseModules,
  updateModuleProgress,
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseModulesForAdmin,
  createModule,
  updateModule,
  deleteModule,
  getMyCertificateData,
  getMyCertificate,
  getAdminEnrollments,
  adminPreviewCertificate,
  adminIssueCertificate,
  adminBatchIssueCertificates,
};
