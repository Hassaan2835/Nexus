const express = require('express');
const {
  getEntrepreneurs,
  getInvestors,
  getUserById,
  updateProfile
} = require('../controllers/userController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect); // All user routes are protected

router.get('/entrepreneurs', getEntrepreneurs);
router.get('/investors', getInvestors);
router.get('/:id', getUserById);
router.put('/:id', updateProfile);

module.exports = router;
