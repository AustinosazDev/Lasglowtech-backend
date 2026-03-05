const express = require('express');
const {
  applyCareer,
  getMyCareerApplications,
  getCareerApplicationByToken,
  getCareerApplications,
  updateCareerApplication,
  deleteCareerApplication,
} = require('../controllers/careers');
const { verifyAdmin, verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/apply', verifyToken, applyCareer);
router.get('/me', verifyToken, getMyCareerApplications);
router.get('/application/:token', getCareerApplicationByToken);
router.get('/admin', verifyAdmin, getCareerApplications);
router.put('/admin/:id', verifyAdmin, updateCareerApplication);
router.delete('/admin/:id', verifyAdmin, deleteCareerApplication);

module.exports = router;
