// create booking, get booking
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const mongoose = require('mongoose');

// @route POST /api/bookings
// @desc Create a new booking
// @access Private
const createBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { showId, seats } = req.body;
        const userId = req.user.id;

        if (!showId || !Array.isArray(seats) || seats.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Show ID and seats are required'
            });
        }

        const show = await Show.findById(showId).session(session);
        if (!show) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        if (!show.isActive) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Cannot book tickets for an inactive show'
            });
        }

        if (new Date(show.showTime) < new Date()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Cannot book tickets for a show that has already started'
            });
        }

        const unavailableSeats = [];
        for (const seatNumber of seats) {
            const seat = show.seats.find((item) => item.seatNumber === seatNumber);
            if (!seat) {
                unavailableSeats.push(`${seatNumber} does not exist`);
                continue;
            }

            if (seat.isBooked) {
                unavailableSeats.push(`${seatNumber} is already booked`);
            }
        }

        if (unavailableSeats.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Some seats are unavailable',
                unavailableSeats
            });
        }

        for (const seat of show.seats) {
            if (seats.includes(seat.seatNumber)) {
                seat.isBooked = true;
            }
        }

        await show.save({ session });

        const totalAmount = seats.length * show.ticketPrice;

        const booking = await Booking.create(
            [
                {
                    user: userId,
                    show: showId,
                    seats,
                    totalAmount
                }
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        const populatedBooking = await Booking.findById(booking[0]._id)
            .populate({
                path: 'show',
                populate: {
                    path: 'movie',
                    select: 'title duration language poster'
                },
                select: 'showTime ticketPrice'
            })
            .populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: populatedBooking
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error creating booking:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking',
            error: err.message
        });
    }
};



//@route GET /api/bookings/my-bookings
// @desc Get bookings of the logged in user
// @access Private

const getMyBookings = async (req, res) => {
    try{
        const bookings = await Booking.find({user: req.user._id})
        .populate({
            path: 'show',
            populate: {
                path:'movie',
                select: 'title poster duration genre',
            },
            select: 'showTime ticketPrice movie'
        })
        .sort({createdAt: -1});

        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            bookings
        });
    } catch (err) {
        console.error('Error fetching my bookings:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings',
            error: err.message
        });

    }
}



// @route GET /api/bookings/:id
// @desc Get a booking by ID (only if it belongs to the logged in user)
// @access Private
const getBookingById = async (req, res) => {
    try{
        const booking = await Booking.findById(req.params.id)
        .populate({
            path: 'show',
            populate: {
                path:'movie',
                select: 'title poster duration genre',
            },
            select: 'showTime ticketPrice totalSeats movie'
        })
        .populate('user', 'name email');
        if(!booking){
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if(booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin'){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this booking"
            });
        }
        res.status(200).json({
            success: true,
            message: "Booking retrieved successfully",
            booking
        });
    }catch (err){
        console.error('Error fetching booking by ID:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking',
            error: err.message
        });
    }
}

// @route put /api/bookings/:id/cancel
// @desc Cancel a booking by ID (only if it belongs to the logged in user and show has not started)
// @access Private

const cancelBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const booking = await Booking.findById(req.params.id).session(session);
        if(!booking){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }
        //only booking owner can cancel
        if(booking.user.toString() !== req.user._id.toString()){
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this booking"
            });
        }
        //cannot cancel if already cancelled
        if(booking.status === 'cancelled'){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        //mark seats as available again
        await Show.findOneAndUpdate(
            {_id: booking.show},
            {$set: {'seats.$[elem].isBooked': false}},
            {arrayFilters: [{'elem.seatNumber': {$in: booking.seats}}], session}
        );

        // update booking status
        booking.status = 'cancelled';
        await booking.save({session});

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            booking
        });
    }catch (err){
        await session.abortTransaction();
        session.endSession();
        console.error('Error cancelling booking:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling booking',
            error: err.message
        });
    }

}


    //@route GET /api/bookings/all
    // @desc Get all bookings (admin only)
    // @access Private (admin only)

    const getAllBookings = async (req, res) => {
        try{
            const bookings = await Booking.find()
            .populate({
                path: 'show',
                populate: {
                    path:'movie',
                    select: 'title',
                },
                select: 'showTime ticketPrice movie'
            })
            .populate('user', 'name email')
            .sort({createdAt: -1});

            res.status(200).json({
                success: true,
                message: "All bookings retrieved successfully",
                bookings
            });
        } catch (err) {
            console.error('Error fetching all bookings:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching all bookings',
                error: err.message
            });
        }
    }


module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings
};
