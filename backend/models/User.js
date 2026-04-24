// structure of user document in MongoDB
const mongoose = require('mongoose');

//schema for user document
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
},{
    timestamps: true // adds createdAt and updatedAt fields automatically
});


//create model from schema and export it
const User = mongoose.model('User', userSchema);
module.exports = User;