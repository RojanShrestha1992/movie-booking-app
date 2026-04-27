const express = require('express');
const router = express.Router();

const {
  createTheater,
  getAllTheaters,
  updateTheater,
  deleteTheater,
} = require('../controllers/theaterController');

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllTheaters);
router.post('/', verifyToken, verifyAdmin, createTheater);
router.put('/:id', verifyToken, verifyAdmin, updateTheater);
router.delete('/:id', verifyToken, verifyAdmin, deleteTheater);

module.exports = router;
