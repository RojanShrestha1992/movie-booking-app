const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Movie = require('../models/Movie');
const Show = require('../models/Show');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const generateSeats = (totalSeats) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = Math.floor(totalSeats / rows.length);
  const seats = [];

  for (const row of rows) {
    for (let i = 1; i <= seatsPerRow; i += 1) {
      seats.push({
        seatNumber: `${row}${i}`,
        isBooked: false,
      });
    }
  }

  return seats;
};

const makeShowDate = (daysFromNow, hour, minute) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const seedMoviesAndShows = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const movieSeeds = [
    {
      title: 'The Last Orbit',
      description: 'A team of astronauts races against time to save a failing orbital station.',
      duration: 132,
      genre: ['Sci-Fi', 'Thriller'],
      language: 'English',
      releaseDate: new Date('2025-09-10'),
      poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
    },
    {
      title: 'Monsoon Letters',
      description: 'A heartfelt drama about two strangers connected through old letters in Kathmandu.',
      duration: 118,
      genre: ['Drama', 'Romance'],
      language: 'Nepali',
      releaseDate: new Date('2024-12-05'),
      poster: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
    },
    {
      title: 'Code Red: Valley',
      description: 'An ex-detective uncovers a cybercrime ring hiding in a mountain town.',
      duration: 124,
      genre: ['Action', 'Crime'],
      language: 'Hindi',
      releaseDate: new Date('2026-01-19'),
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
    },
    {
      title: 'Laugh Track Live',
      description: 'A stand-up comic gets one last chance to headline the biggest stage of his life.',
      duration: 102,
      genre: ['Comedy'],
      language: 'English',
      releaseDate: new Date('2025-06-21'),
      poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
    },
  ];

  const moviesByTitle = new Map();

  for (const movieData of movieSeeds) {
    const movie = await Movie.findOneAndUpdate(
      { title: movieData.title },
      { $set: movieData },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    moviesByTitle.set(movie.title, movie);
  }

  const showSeeds = [
    { title: 'The Last Orbit', showTime: makeShowDate(1, 13, 0), ticketPrice: 14, totalSeats: 60 },
    { title: 'The Last Orbit', showTime: makeShowDate(1, 19, 30), ticketPrice: 16, totalSeats: 60 },
    { title: 'Monsoon Letters', showTime: makeShowDate(2, 12, 15), ticketPrice: 10, totalSeats: 60 },
    { title: 'Monsoon Letters', showTime: makeShowDate(2, 17, 45), ticketPrice: 12, totalSeats: 60 },
    { title: 'Code Red: Valley', showTime: makeShowDate(3, 15, 0), ticketPrice: 13, totalSeats: 60 },
    { title: 'Code Red: Valley', showTime: makeShowDate(3, 21, 0), ticketPrice: 15, totalSeats: 60 },
    { title: 'Laugh Track Live', showTime: makeShowDate(4, 11, 30), ticketPrice: 9, totalSeats: 60 },
    { title: 'Laugh Track Live', showTime: makeShowDate(4, 20, 0), ticketPrice: 11, totalSeats: 60 },
  ];

  let createdShows = 0;

  for (const showData of showSeeds) {
    const movie = moviesByTitle.get(showData.title);
    if (!movie) continue;

    const existing = await Show.findOne({
      movie: movie._id,
      showTime: showData.showTime,
    });

    if (!existing) {
      await Show.create({
        movie: movie._id,
        showTime: showData.showTime,
        ticketPrice: showData.ticketPrice,
        totalSeats: showData.totalSeats,
        seats: generateSeats(showData.totalSeats),
        isActive: true,
      });
      createdShows += 1;
    }
  }

  const movieCount = await Movie.countDocuments({ isActive: true });
  const showCount = await Show.countDocuments({ isActive: true });

  console.log(`Seed complete. Active movies: ${movieCount}, active shows: ${showCount}, new shows inserted: ${createdShows}.`);

  await mongoose.disconnect();
};

seedMoviesAndShows()
  .then(() => {
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Seeding failed:', err.message);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect errors
    }
    process.exit(1);
  });
