const express = require('express');
const auth = require('../middlewares/authMiddleware');
const {
  sendEmailMailgun,
  sendNotificationControllerForTesting,
} = require('../controllers/communicationController');

const router = express.Router();

router.post('/send-email-mailgun', auth, sendEmailMailgun);

router.post('/send-notification', auth, sendNotificationControllerForTesting);

module.exports = router;
