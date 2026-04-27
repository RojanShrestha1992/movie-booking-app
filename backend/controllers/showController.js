const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

const generateSeats = (totalSeats) => {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = Math.floor(totalSeats / rows.length);

  rows.forEach((row) => {
    for (let i = 1; i <= seatsPerRow; i += 1) {
      seats.push({
        seatNumber: `${row}${i}`,
        isBooked: false,
      });
    }
  });

  return seats;
};

const parseShowTimes = (showTime, showTimes) => {
  if (Array.isArray(showTimes) && showTimes.length > 0) {
    return showTimes;
  }

  if (showTime) {
    return [showTime];
  }

  return [];
};

const parseScheduleEntries = (schedules) => {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return [];
  }

  const combined = [];

  schedules.forEach((entry) => {
    const dateValue = entry?.date;
    const times = Array.isArray(entry?.times) ? entry.times : [];

    if (!dateValue || times.length === 0) {
      return;
    }

    times.forEach((timeValue) => {
      if (typeof timeValue !== 'string' || !timeValue.trim()) {
        return;
      }

      combined.push(`${dateValue}T${timeValue.trim()}:00`);
    });
  });

  return combined;
};

const normalizeShowTimes = (showTime, showTimes, schedules) => {
  const baseTimes = parseShowTimes(showTime, showTimes);
  const scheduleTimes = parseScheduleEntries(schedules);
  const merged = [...baseTimes, ...scheduleTimes].filter(Boolean);

  return [...new Set(merged)];
};

const isFutureDate = (value) => {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed > new Date();
};

const createShow = async (req, res) => {
  try {
    const { movie, theater, showTime, showTimes, schedules, ticketPrice, totalSeats } = req.body;

    const normalizedShowTimes = normalizeShowTimes(showTime, showTimes, schedules);
    const seatsCount = Number(totalSeats) || 60;

    if (!movie || !theater || !ticketPrice || normalizedShowTimes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Movie, theater, ticket price, and at least one show time are required',
      });
    }

    if (seatsCount <= 0 || seatsCount % 6 !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Total seats must be a positive number and a multiple of 6',
      });
    }

    const hasPastOrInvalidTime = normalizedShowTimes.some((item) => !isFutureDate(item));
    if (hasPastOrInvalidTime) {
      return res.status(400).json({
        success: false,
        message: 'All show times must be valid future dates',
      });
    }

    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    if (!movieExists.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot create show for an inactive movie' });
    }

    const theaterExists = await Theater.findById(theater);
    if (!theaterExists || !theaterExists.isActive) {
      return res.status(404).json({ success: false, message: 'Theater not found or inactive' });
    }

    const showsToCreate = [];

    for (const time of normalizedShowTimes) {
      const parsedTime = new Date(time);
      const duplicate = await Show.findOne({
        movie,
        theater,
        showTime: parsedTime,
        isActive: true,
      });

      if (!duplicate) {
        showsToCreate.push({
          movie,
          theater,
          showTime: parsedTime,
          ticketPrice: Number(ticketPrice),
          totalSeats: seatsCount,
          seats: generateSeats(seatsCount),
        });
      }
    }

    if (showsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All provided show times already exist for this movie and theater',
      });
    }

    const createdShows = await Show.insertMany(showsToCreate);
    const createdIds = createdShows.map((show) => show._id);

    const populatedShows = await Show.find({ _id: { $in: createdIds } })
      .populate('movie', 'title duration language poster genre')
      .populate('theater', 'name location totalScreens')
      .sort({ showTime: 1 });

    return res.status(201).json({
      success: true,
      message: `Created ${populatedShows.length} show${populatedShows.length > 1 ? 's' : ''} successfully`,
      shows: populatedShows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error while creating show',
    });
  }
};

const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate('movie', 'title duration language poster genre')
      .populate('theater', 'name location totalScreens')
      .sort({ showTime: 1 });

    return res.status(200).json({ success: true, shows });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching shows',
    });
  }
};

const getUpcomingShows = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const now = new Date();

    const shows = await Show.find({
      isActive: true,
      showTime: { $gte: now },
    })
      .populate('movie', 'title duration language poster genre')
      .populate('theater', 'name location totalScreens')
      .sort({ showTime: 1 })
      .limit(limit);

    return res.status(200).json({ success: true, shows });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming shows',
    });
  }
};

const getShowsByMovie = async (req, res) => {
  try {
    const shows = await Show.find({
      movie: req.params.movieId,
      isActive: true,
      showTime: { $gte: new Date() },
    })
      .populate('movie', 'title duration language poster genre')
      .populate('theater', 'name location totalScreens')
      .sort({ showTime: 1 });

    if (shows.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No shows found for this movie',
        shows: [],
      });
    }

    return res.status(200).json({ success: true, shows });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching shows by movie',
    });
  }
};

const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title duration language poster genre')
      .populate('theater', 'name location totalScreens');

    if (!show || !show.isActive) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const availableSeats = show.seats.filter((seat) => !seat.isBooked).length;

    return res.status(200).json({ success: true, show, availableSeats });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching show by ID',
    });
  }
};

const updateShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const { showTime, ticketPrice, isActive, theater } = req.body;

    if (showTime) {
      const parsedTime = new Date(showTime);
      if (!Number.isFinite(parsedTime.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid show time' });
      }
      show.showTime = parsedTime;
    }

    if (ticketPrice !== undefined) {
      show.ticketPrice = Number(ticketPrice);
    }

    if (theater) {
      const theaterExists = await Theater.findById(theater);
      if (!theaterExists || !theaterExists.isActive) {
        return res.status(404).json({ success: false, message: 'Theater not found or inactive' });
      }
      show.theater = theater;
    }

    if (isActive !== undefined) {
      show.isActive = isActive;
    }

    await show.save();
    await show.populate('movie', 'title duration language poster genre');
    await show.populate('theater', 'name location totalScreens');

    return res.status(200).json({
      success: true,
      message: 'Show updated successfully',
      show,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating show',
    });
  }
};

const deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    show.isActive = false;
    await show.save();

    return res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting show',
    });
  }
};

module.exports = {
  createShow,
  getAllShows,
  getUpcomingShows,
  getShowsByMovie,
  getShowById,
  updateShow,
  deleteShow,
};
