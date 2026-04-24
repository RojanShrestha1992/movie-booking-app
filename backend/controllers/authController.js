// handles: register login profile get
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1d" // token expires in 1 day
    });
}

// @route POST /api/auth/register
// @desc Register a new user
// @access Public
const register = async (req, res) => {
    try{
        //1. get user details from request body
        const {name,email,password, role} = req.body;
        //2. validate input
        if(!name || !email || !password){
            return res.status(400).json({message: "Please provide name, email and password"});
        }
        //3. check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists with this email"});
        }
        //4. hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //5. create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user" // default role is user
        });
        //6. generate jwt token
        const token = generateToken(user._id);
        //7. save user and return success response with token
        await user.save();
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err){
        console.error("Error in register:", err);
        res.status(500).json({message: "Server error", error: err.message});
    }
    
}


// @route POST /api/auth/login
// @desc Login user and return token
// @access Public
const login = async (req, res) => {
    try{
        //1. get email and password from request body
        const {email, password} = req.body;
        //2. validate input
        if(!email || !password){
            return res.status(400).json({message: "Please provide email and password"});
        }
        //3. find user by email
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }
        //4. compare provided password with hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"});
        }
        //5. generate jwt token
        const token = generateToken(user._id);
        //6. return success response with token
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err){
        console.error("Error in login:", err);
        res.status(500).json({message: "Server error", error: err.message});
    }
}

// @route GET /api/auth/profile
// @desc Get user profile
// @access Private

const getProfile = async (req, res) => {
    try{
        //1. user is attached to req object by auth middleware
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (err){
        console.error("Error in getProfile:", err);
        res.status(500).json({message: "Server error", error: err.message});
    }
}

module.exports = {
    register,
    login,
    getProfile
}