const express = require('express');
const {
  createRequest,
  getRequests,
  updateRequestStatus
} = require('../controllers/collaborationController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/request', createRequest);
router.get('/requests', getRequests);
router.put('/requests/:id', updateRequestStatus);

module.exports = router;
