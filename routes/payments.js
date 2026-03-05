const express = require('express');
const {
  getPackages,
  getPackageBySlug,
  initializePayment,
  verifyPayment,
  webhook,
  getAdminRevenueStats,
  getAdminPayments,
  getMyOrders,
  getMyOrderInvoice,
  reverifyAdminOrder,
} = require('../controllers/payments');
const { verifyAdmin, verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/packages', getPackages);
router.get('/packages/:serviceSlug', getPackageBySlug);
router.post('/initialize', verifyToken, initializePayment);
router.get('/verify/:reference', verifyPayment);
router.post('/webhook', webhook);
router.get('/admin/revenue', verifyAdmin, getAdminRevenueStats);
router.get('/admin/orders', verifyAdmin, getAdminPayments);
router.post('/admin/orders/:orderId/reverify', verifyAdmin, reverifyAdminOrder);
router.get('/my/orders', verifyToken, getMyOrders);
router.get('/my/orders/:orderId/invoice', verifyToken, getMyOrderInvoice);

module.exports = router;
