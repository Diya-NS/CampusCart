const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');

// @route   GET /api/colleges
// @desc    Get all colleges
// @access  Public
router.get('/', collegeController.getColleges);

module.exports = router;
