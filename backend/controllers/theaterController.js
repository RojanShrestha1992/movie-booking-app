const Theater = require('../models/Theater');

const createTheater = async (req, res) => {
  try {
    const { name, location, totalScreens } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'Theater name and location are required',
      });
    }

    const theater = await Theater.create({
      name,
      location,
      totalScreens: totalScreens ? Number(totalScreens) : 1,
    });

    return res.status(201).json({
      success: true,
      message: 'Theater created successfully',
      theater,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A theater with this name and location already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating theater',
    });
  }
};

const getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, theaters });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching theaters',
    });
  }
};

const updateTheater = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.totalScreens !== undefined) {
      updates.totalScreens = Number(updates.totalScreens);
    }

    const theater = await Theater.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }

    return res.status(200).json({ success: true, message: 'Theater updated successfully', theater });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating theater',
    });
  }
};

const deleteTheater = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }

    theater.isActive = false;
    await theater.save();

    return res.status(200).json({ success: true, message: 'Theater deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting theater',
    });
  }
};

module.exports = {
  createTheater,
  getAllTheaters,
  updateTheater,
  deleteTheater,
};
