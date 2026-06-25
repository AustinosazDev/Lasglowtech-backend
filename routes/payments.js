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
  getDeliveryByToken,
  downloadDeliverable,
  getMyOrderDelivery,
} = require('../controllers/payments');
const { verifyAdmin, verifyToken, optionalVerifyToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/packages', getPackages);
router.get('/packages/:serviceSlug', getPackageBySlug);
router.post('/initialize', optionalVerifyToken, initializePayment);
router.get('/verify/:reference', verifyPayment);
router.post('/webhook', webhook);
router.get('/admin/revenue', verifyAdmin, getAdminRevenueStats);
router.get('/admin/orders', verifyAdmin, getAdminPayments);
router.post('/admin/orders/:orderId/reverify', verifyAdmin, reverifyAdminOrder);
router.get('/my/orders', verifyToken, getMyOrders);
router.get('/my/orders/:orderId/invoice', verifyToken, getMyOrderInvoice);
router.get('/my/orders/:orderId/delivery', verifyToken, getMyOrderDelivery);
router.get('/delivery/:token', getDeliveryByToken);
router.get('/download/:token', downloadDeliverable);

module.exports = router;
