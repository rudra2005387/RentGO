const express = require('express');
const adminController = require('../controllers/admin.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Every admin route requires authentication + admin role
router.use(verifyToken, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

router.get('/listings', adminController.getAllListings);
router.put('/listings/:id/status', adminController.updateListingStatus);

router.get('/bookings', adminController.getAllBookings);

router.get('/reviews', adminController.getAllReviews);
router.post('/reviews/:id/flag', adminController.flagReview);

router.get('/revenue', adminController.getRevenueStats);

module.exports = router;
