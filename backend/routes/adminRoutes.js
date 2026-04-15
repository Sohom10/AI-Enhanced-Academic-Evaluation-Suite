const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// All routes here require both auth and admin privileges
router.use(auth);
router.use(admin);

// @route   GET api/admin/users
// @desc    Get all students and teachers
router.get('/users', adminController.getAllUsers);

// @route   POST api/admin/users
// @desc    Create a new user
router.post('/users', adminController.createUser);

// @route   DELETE api/admin/users/:identifier
// @desc    Delete a user
router.delete('/users/:identifier', adminController.deleteUser);

// @route   GET api/admin/stats
// @desc    Get dashboard stats
router.get('/stats', adminController.getDashboardStats);

module.exports = router;
