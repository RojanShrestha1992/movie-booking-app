// structure of show document in MongoDB
// show represents a specific screening of a movie at a particular time and location
const mongoose = require('mongoose');


const seatSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
})

//schema for show document
const showSchema = new mongoose.Schema({
    movie:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Movie reference is required']
    },
    theater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
    },
    showTime: {
        type: Date,
        required: [true, 'Show time is required']
    },
    totalSeats: {
        type: Number,
        required: [true, 'Total seats is required'],
        default: 60
    },
    seats:{
        type: [seatSchema], // array of seat objects
        default: []
    },
    ticketPrice: {
        type: Number,
        required: [true, 'Ticket price is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },

},{
    timestamps: true // adds createdAt and updatedAt fields automatically
})

const Show = mongoose.model('Show', showSchema);
module.exports = Show;