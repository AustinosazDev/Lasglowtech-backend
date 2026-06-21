const express = require('express');
const {
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
  getAdminModuleQuiz,
  saveAdminModuleQuiz,
  deleteAdminModuleQuiz,
  getMyModuleQuiz,
  submitMyModuleQuiz,
  getMyCertificateData,
  getMyCertificate,
  getAdminEnrollments,
  adminPreviewCertificate,
  adminIssueCertificate,
  adminBatchIssueCertificates,
  adminDeleteEnrollment,
  verifyCertificatePublic,
} = require('../controllers/lms');
const { verifyAdmin, verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/certificates/verify', verifyCertificatePublic);

router.get('/courses', getPublishedCourses);
router.get('/courses/by-slug/:slug', getCourseBySlug);
router.post('/enroll/:courseId', verifyToken, enrollCourse);
router.get('/my/dashboard', verifyToken, getMyLearningDashboard);
router.get('/my/enrollments/:enrollmentId/modules', verifyToken, getMyCourseModules);
router.put('/my/enrollments/:enrollmentId/modules/:moduleId/progress', verifyToken, updateModuleProgress);
router.get('/my/enrollments/:enrollmentId/modules/:moduleId/quiz', verifyToken, getMyModuleQuiz);
router.post('/my/enrollments/:enrollmentId/modules/:moduleId/quiz/submit', verifyToken, submitMyModuleQuiz);
router.get('/my/enrollments/:enrollmentId/certificate-data', verifyToken, getMyCertificateData);
router.get('/my/enrollments/:enrollmentId/certificate', verifyToken, getMyCertificate);

router.get('/admin/courses', verifyAdmin, getAdminCourses);
router.post('/admin/courses', verifyAdmin, createCourse);
router.put('/admin/courses/:id', verifyAdmin, updateCourse);
router.delete('/admin/courses/:id', verifyAdmin, deleteCourse);
router.get('/admin/courses/:courseId/modules', verifyAdmin, getCourseModulesForAdmin);
router.post('/admin/courses/:courseId/modules', verifyAdmin, createModule);
router.put('/admin/courses/:courseId/modules/:moduleId', verifyAdmin, updateModule);
router.delete('/admin/courses/:courseId/modules/:moduleId', verifyAdmin, deleteModule);
router.get('/admin/courses/:courseId/modules/:moduleId/quiz', verifyAdmin, getAdminModuleQuiz);
router.put('/admin/courses/:courseId/modules/:moduleId/quiz', verifyAdmin, saveAdminModuleQuiz);
router.delete('/admin/courses/:courseId/modules/:moduleId/quiz', verifyAdmin, deleteAdminModuleQuiz);

router.get('/admin/enrollments', verifyAdmin, getAdminEnrollments);
router.get('/admin/enrollments/:enrollmentId/certificate', verifyAdmin, adminPreviewCertificate);
router.post('/admin/enrollments/:enrollmentId/issue-certificate', verifyAdmin, adminIssueCertificate);
router.post('/admin/enrollments/issue-certificates/batch', verifyAdmin, adminBatchIssueCertificates);
router.delete('/admin/enrollments/:enrollmentId', verifyAdmin, adminDeleteEnrollment);

module.exports = router;
