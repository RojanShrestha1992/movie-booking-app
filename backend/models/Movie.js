// structure of movie 
const mongoose = require('mongoose');
//schema for movie document
const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
    },
    genre: {
        type: [String],
        required: [true, 'Genre is required']
    },
    language: {
        type: String,
        required: [true, 'Language is required'],
        trim: true
    },
    releaseDate: {
        type: Date,
        required: [true, 'Release date is required']
    },
    poster: {
        type: String,
        required: [true, 'Poster URL is required'],
    },
    trailerUrl: {
        type: String,
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
},{
    timestamps: true // adds createdAt and updatedAt fields automatically
})


//create model from schema and export it
const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;