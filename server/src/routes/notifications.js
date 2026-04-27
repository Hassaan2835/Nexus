const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllRead
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllRead);
router.put('/:id/read', markAsRead);

module.exports = router;
