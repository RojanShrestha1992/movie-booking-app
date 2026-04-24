// handle all the movie related operations here
const Movie = require("../models/Movie");

// @route POST /api/movies
// @desc Create a new movie
// @access Private
const addMovie = async (req, res) => {
  try {
    //1. get movie data from request body
    const { title, director, releaseDate, genre, language, description, duration, poster } = req.body;
    // 2. validate the data
    if (!title || !director || !releaseDate || !genre || !language || !description || !duration || !poster) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    // 3. create movie in the database
    const movie = await Movie.create({
      title,
      description,
      director,
      duration,
      genre,
      language,
      releaseDate,
      poster,
    });

    //4. send response
    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      movie,
    });
  } catch (error) {
    console.error("Error creating movie:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating movie",
    });
  }
};

// @route GET /api/movies
// @desc Get all movies
// @access Public

const getAllMovies = async (req, res) => {
  try {
    // find all movies in the database
    const movies = await Movie.find({ isActive: true }).sort({ createdAt: -1 });
    // send response;
    res.status(200).json({
      success: true,
      message: "Movies retrieved successfully",
      movies,
    });
  } catch (error) {
    console.error("Error retrieving movies:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving movies",
    });
  }
};

// @route GET /api/movies/:id
// @desc Get a movie by ID
// @access Public

const getMovieById = async (req, res) => {
  try {
    //req.params.id will give us the id from the url
    const movie = await Movie.findById(req.params.id);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Movie retrieved successfully",
      movie,
    });
  } catch (error) {
    console.error("Error retrieving movie:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving movie",
    });
  }
};

// @route PUT /api/movies/:id
// @desc Update a movie by ID
// @access Private

const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    // update movie with the data from request body
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie: updatedMovie,
    });
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating movie",
    });
  }
};


// @route DELETE /api/movies/:id
// @desc Soft delete a movie by ID
// @access Private

const deleteMovie = async (req, res) => {
    try{
        //1. check if the movie exists
        const movie = await Movie.findById(req.params.id);
        if(!movie || !movie.isActive){
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }
        // 2. soft delete the movie by setting isActive to false
        movie.isActive = false;
        await movie.save();

        res.status(200).json({
            success: true,
            message: "Movie deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting movie:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting movie",
        });

    }
}

module.exports = {
  addMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie
}