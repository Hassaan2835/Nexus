const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  toggleTwoFactor,
  verifyTwoFactor,
  updateDetails
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatepassword', protect, updatePassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/toggle2fa', protect, toggleTwoFactor);
router.post('/verify2fa', verifyTwoFactor);

module.exports = router;
