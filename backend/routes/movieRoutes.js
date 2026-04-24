// defines the routes for movies
const express = require("express");
const router = express.Router();
const {
  addMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie
} = require("../controllers/movieController");

//middleware to protect routes
const {verifyToken, verifyAdmin} = require("../middleware/authMiddleware");

// GET all movies
router.get("/", getAllMovies);
// GET a movie by ID
router.get("/:id", getMovieById);
// POST a new movie (admin only)
router.post("/", verifyToken, verifyAdmin, addMovie);
// PUT update a movie by ID (admin only)
router.put("/:id", verifyToken, verifyAdmin, updateMovie);
// DELETE a movie by ID (admin only)
router.delete("/:id", verifyToken, verifyAdmin, deleteMovie);

module.exports = router;

// @route PUT /api/movies/:id
// @desc Update a movie by ID
// @access Private