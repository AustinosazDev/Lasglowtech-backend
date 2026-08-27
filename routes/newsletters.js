const express = require('express');
const multer = require('multer');
const { verifyAdmin } = require('../middlewares/auth');
const {
  listNewsletters, createNewsletter, getOneNewsletter, updateNewsletter, deleteNewsletter,
  sendNow, scheduleNewsletter, sendTest, listSubscribers, addSubscriber, removeSubscriber,
  unsubscribe,
} = require('../controllers/newsletters');

const router = express.Router();
const attachmentUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/admin/newsletters', verifyAdmin, listNewsletters);
router.post('/admin/newsletters', verifyAdmin, createNewsletter);
router.get('/admin/newsletters/:id', verifyAdmin, getOneNewsletter);
router.put('/admin/newsletters/:id', verifyAdmin, updateNewsletter);
router.delete('/admin/newsletters/:id', verifyAdmin, deleteNewsletter);
router.post('/admin/newsletters/:id/send', verifyAdmin, attachmentUpload.array('attachments', 5), sendNow);
router.post('/admin/newsletters/:id/schedule', verifyAdmin, scheduleNewsletter);
router.post('/admin/newsletters/:id/test', verifyAdmin, attachmentUpload.array('attachments', 5), sendTest);
router.get('/admin/subscribers', verifyAdmin, listSubscribers);
router.post('/admin/subscribers', verifyAdmin, addSubscriber);
router.delete('/admin/subscribers/:id', verifyAdmin, removeSubscriber);
router.get('/unsubscribe/:token', unsubscribe);

module.exports = router;
