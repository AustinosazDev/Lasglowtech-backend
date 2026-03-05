const express = require('express');
const {
  getCatalogues,
  getCataloguePreview,
  getCatalogueBySlug,
  getAdminCatalogues,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
} = require('../controllers/catalogues');
const { verifyAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getCatalogues);
router.get('/preview', getCataloguePreview);

router.get('/admin/all', verifyAdmin, getAdminCatalogues);
router.post('/admin', verifyAdmin, createCatalogue);
router.put('/admin/:id', verifyAdmin, updateCatalogue);
router.delete('/admin/:id', verifyAdmin, deleteCatalogue);
router.get('/:slug', getCatalogueBySlug);

module.exports = router;
