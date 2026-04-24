// structure of booking
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    show: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show',
        required: [true, 'Show reference is required']
    },
    seats:{
        type: [String], // array of seat identifiers (e.g., "A1", "B2")
        required: [true, 'At least one seat must be selected']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required']
    },
    status:{
        type: String,
        enum: ['booked', 'cancelled'],
        default: 'booked'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    }
},{
    timestamps: true // adds createdAt and updatedAt fields automatically
})


const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;