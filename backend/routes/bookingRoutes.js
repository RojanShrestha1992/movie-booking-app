const express = require('express');
const   router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings
} = require('../controllers/bookingController');

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// create a new booking
router.post('/', verifyToken, createBooking);
// get bookings for the logged-in user
router.get('/my', verifyToken, getMyBookings);
// get booking by ID (only for the user who made the booking or admin)
router.get('/:id', verifyToken, getBookingById);
// cancel a booking by ID (only for the user who made the booking and if show has not started)
router.put('/:id/cancel', verifyToken, cancelBooking);
// get all bookings (admin only)
router.get('/', verifyToken, verifyAdmin, getAllBookings);


module.exports = router;