// define url endpoints for show related operations

const express = require('express');
const router = express.Router();

const {
    createShow,
    getAllShows,
    getUpcomingShows,
    getShowsByMovie,
    getShowById,
    updateShow,
    deleteShow
} = require('../controllers/showController');

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
// get all shows
router.get('/', getAllShows);
// get upcoming shows
router.get('/upcoming', getUpcomingShows);
// get shows by movie ID
router.get('/movie/:movieId', getShowsByMovie);
// get show by ID
router.get('/:id', getShowById);
// create a new show (admin only)
router.post('/', verifyToken, verifyAdmin, createShow);
// update a show by ID (admin only)
router.put('/:id', verifyToken, verifyAdmin, updateShow);
// delete a show by ID (admin only)
router.delete('/:id', verifyToken, verifyAdmin, deleteShow);

module.exports = router;