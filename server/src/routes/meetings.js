const express = require('express');
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeetingStatus,
  deleteMeeting
} = require('../controllers/meetingController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect); // All meeting routes are protected

router.route('/')
  .post(createMeeting)
  .get(getMeetings);

router.route('/:id')
  .get(getMeetingById)
  .delete(deleteMeeting);

router.put('/:id/status', updateMeetingStatus);

module.exports = router;
