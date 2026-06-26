const express = require('express');
const {
  getProjects,
  getCaseStudies,
  getCategories,
  getPublicCategories,
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projects');
const { verifyAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getProjects);
router.get('/categories', getPublicCategories);
router.get('/case-studies', getCaseStudies);

router.get('/admin/categories', verifyAdmin, getCategories);

router.get('/admin/all', verifyAdmin, getAdminProjects);
router.post('/admin', verifyAdmin, createProject);
router.put('/admin/:id', verifyAdmin, updateProject);
router.delete('/admin/:id', verifyAdmin, deleteProject);

module.exports = router;
