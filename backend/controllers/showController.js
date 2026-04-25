// handle create show, get shows, get single show

const Show = require("../models/Show");
const Movie = require("../models/Movie");

// helper function to generate seat layout for a show
const generateSeats = (totalSeats) => {
    const seats = [];
    //define rows and columns for the theater
    const rows = ["A","B","C","D","E","F"];
    const seatsPerRow = totalSeats / rows.length;

    rows.forEach((row) => {
        for(let i=1; i<=seatsPerRow; i++){
            seats.push({
                seatNumber: `${row}${i}`,
                isBooked: false
            });
        }
    })
    return seats;
}

// @route POST /api/shows
// @desc Create a new show
// @access Private (admin only)

const createShow = async (req, res) => {
    try{
        const {movie, showTime, ticketPrice, totalSeats} = req.body;
        // validate input
        if(!movie || !showTime || !ticketPrice || !totalSeats){
            return res.status(400).json({
                success: false,
                message: "All fields are required"});
    }

// checl if movie exists
const movieExists = await Movie.findById(movie);
if(!movieExists){
    return res.status(404).json({
        success: false,
        message: "Movie not found"
    });
}
// check if move is active
if(!movieExists.isActive){
    return res.status(400).json({
        success: false,
        message: "Cannot create show for an inactive movie"
    });
}

// set total seats (default 60)
const seats_count = totalSeats || 60;
//generate seat layout
const seats = generateSeats(seats_count);
//seats = [{seatNumber: "A1", isBooked: false}, {seatNumber: "A2", isBooked: false}, ...]

//create show in the database
const show = await Show.create({
    movie,
    showTime,
    ticketPrice,
    totalSeats: seats_count,
    // availableSeats: seats_count,
    seats
})
//populate movie details in the show response
await show.populate("movie", "title duration language  poster");

res.status(201).json({
    success: true,
    message: "Show created successfully",
    show
})

    }catch (err){
        console.error("Error creating show:", err);
        res.status(500).json({
            success: false,
            message: "Server error while creating show"
        });
    }
}

// @route GET /api/shows
// @desc Get all shows
// @access Public

const getAllShows = async (req, res) => {
    try{
        const shows = await Show.find().populate("movie", "title duration language poster genre").sort({showTime: 1});
        res.status(200).json({
            success: true,
            shows
        });
    }catch (err){
        console.error("Error fetching shows:", err);
        res.status(500).json({
            success: false,
            message: "Server error while fetching shows"
        });
    }
}


//@route GET /api/shows/:id
// @desc Get a show by ID
// @access Public

const getShowsByMovie = async (req, res)=>{
    try{
        const shows = await Show.find({
            movie: req.params.movieId,
            isActive: true,
            showTime: {$gte: new Date()} // only future shows
        }).populate("movie", "title duration language poster genre").sort({showTime: 1});
        if(shows.length === 0){
            return res.status(404).json({
                success: false,
                message: "No shows found for this movie"
            });
        }
        res.status(200).json({
            success: true,
            shows
        });
    }catch (err){
        console.error("Error fetching shows by movie:", err);
        res.status(500).json({
            success: false,
            message: "Server error while fetching shows by movie"
        });
    }
}


//@route GET /api/shows/:id
// @desc Get a show by ID
// @access Public

const getShowById = async (req, res) => {
    try{
        const show = await Show.findById(req.params.id).populate("movie", "title duration language poster genre");
        if(!show || !show.isActive){
            return res.status(404).json({
                success: false,
                message: "Show not found"
            });
        }

        // count available seats
        const availableSeats = show.seats.filter(seat => !seat.isBooked).length;

        res.status(200).json({
            success: true,
            show,
            availableSeats,
        });
    }catch (err){
        console.error("Error fetching show by ID:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching show by ID"
        });
    }
}

// @route PUT /api/shows/:id
// @desc Update a show by ID
// @access Private (admin only)

const updateShow = async (req, res) => {
    try{
        const show = await Show.findById(req.params.id);
        if(!show){
            return res.status(404).json({
                success: false,
                message: "Show not found"
            });
        }

        // update show with the data from request body
        const {showTime, ticketPrice, isActive} = req.body;
        if(showTime) show.showTime = showTime;
        if(ticketPrice) show.ticketPrice = ticketPrice;
        if(isActive !== undefined) show.isActive = isActive;

        await show.save();

        res.status(200).json({
            success: true,
            message: "Show updated successfully",
            show
        });
    }catch (err){
        console.error("Error updating show:", err);
        res.status(500).json({
            success: false,
            message: "Server error while updating show"
        });
    }
}


//@route DELETE /api/shows/:id
// @desc Soft delete a show by ID
// @access Private (admin only)

const deleteShow = async (req, res) => {
    try{
        const show = await Show.findById(req.params.id);
        if(!show){
            return res.status(404).json({
                success: false,
                message: "Show not found"
            });
        }

        //soft delete by setting isActive to false
        show.isActive = false;
        await show.save();

        res.status(200).json({
            success: true,
            message: "Show deleted successfully"
        });
    }catch (err){
        console.error("Error deleting show:", err);
        res.status(500).json({
            success: false,
            message: "Server error while deleting show"
        });
    }
}

module.exports = {
    createShow,
    getAllShows,
    getShowsByMovie,
    getShowById,
    updateShow,
    deleteShow
};