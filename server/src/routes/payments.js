const express = require('express');
const {
  depositFunds,
  getWalletInfo,
  transferFunds
} = require('../controllers/paymentController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/wallet', getWalletInfo);
router.post('/deposit', depositFunds);
router.post('/transfer', transferFunds);

module.exports = router;
