import { useEffect, useMemo, useState } from 'react';
import { Film, Plus, Ticket, Trash2 } from 'lucide-react';
import Loader from '../components/Loader';
import { bookingApi, getErrorMessage, movieApi, showApi } from '../lib/api';

const emptyMovie = {
  title: '',
  director: '',
  releaseDate: '',
  genre: '',
  language: '',
  description: '',
  duration: '',
  poster: null,
};

const emptyShow = {
  movie: '',
  showTime: '',
  ticketPrice: '',
  totalSeats: '60',
};

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [movieForm, setMovieForm] = useState(emptyMovie);
  const [posterPreview, setPosterPreview] = useState('');
  const [showForm, setShowForm] = useState(emptyShow);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAdminData = async () => {
    try {
      const [movieRes, showRes, bookingRes] = await Promise.all([movieApi.all(), showApi.all(), bookingApi.all()]);
      setMovies(movieRes.data.movies || []);
      setShows(showRes.data.shows || []);
      setBookings(bookingRes.data.bookings || []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    return () => {
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview);
      }
    };
  }, [posterPreview]);

  const stats = useMemo(() => {
    const activeShows = shows.filter((show) => show.isActive !== false).length;
    const activeMovies = movies.length;
    const today = new Date().toDateString();
    const todayBookings = bookings.filter((item) => new Date(item.createdAt).toDateString() === today).length;

    return {
      activeMovies,
      activeShows,
      totalBookings: bookings.length,
      todayBookings,
    };
  }, [movies, shows, bookings]);

  const handleMovieCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      if (!movieForm.poster) {
        setError('Please select a movie poster image.');
        setBusy(false);
        return;
      }

      const payload = new FormData();
      payload.append('title', movieForm.title);
      payload.append('director', movieForm.director);
      payload.append('releaseDate', movieForm.releaseDate);
      payload.append('genre', movieForm.genre);
      payload.append('language', movieForm.language);
      payload.append('description', movieForm.description);
      payload.append('duration', String(Number(movieForm.duration)));
      payload.append('poster', movieForm.poster);

      await movieApi.create(payload);
      setMovieForm(emptyMovie);
      setPosterPreview('');
      setSuccess('Movie created successfully.');
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleShowCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    const seatCount = Number(showForm.totalSeats);
    if (seatCount % 6 !== 0 || seatCount <= 0) {
      setError('Total seats must be a positive number and a multiple of 6.');
      setBusy(false);
      return;
    }

    if (new Date(showForm.showTime) <= new Date()) {
      setError('Show time must be in the future.');
      setBusy(false);
      return;
    }

    try {
      await showApi.create({
        ...showForm,
        ticketPrice: Number(showForm.ticketPrice),
        totalSeats: seatCount,
      });
      setShowForm(emptyShow);
      setSuccess('Show created successfully.');
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const softDeleteMovie = async (id) => {
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await movieApi.remove(id);
      setSuccess('Movie archived successfully.');
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const softDeleteShow = async (id) => {
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await showApi.remove(id);
      setSuccess('Show archived successfully.');
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader label="Loading admin dashboard..." />;

  return (
    <section className="space-y-8">
      <header className="rounded-3xl bg-hero p-6 text-white shadow-card">
        <h1 className="font-display text-4xl uppercase tracking-wide">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-white/80">Manage movies, shows, and monitor bookings in one place.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <article className="rounded-xl bg-white/10 p-3">
            <p className="text-xs uppercase text-white/70">Movies</p>
            <p className="font-display text-3xl">{stats.activeMovies}</p>
          </article>
          <article className="rounded-xl bg-white/10 p-3">
            <p className="text-xs uppercase text-white/70">Shows</p>
            <p className="font-display text-3xl">{stats.activeShows}</p>
          </article>
          <article className="rounded-xl bg-white/10 p-3">
            <p className="text-xs uppercase text-white/70">Bookings</p>
            <p className="font-display text-3xl">{stats.totalBookings}</p>
          </article>
          <article className="rounded-xl bg-white/10 p-3">
            <p className="text-xs uppercase text-white/70">Today</p>
            <p className="font-display text-3xl">{stats.todayBookings}</p>
          </article>
        </div>
      </header>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <form onSubmit={handleMovieCreate} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-brand-ink">
            <Film size={20} /> Add Movie
          </h2>

          <input placeholder="Title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={movieForm.title} onChange={(e) => setMovieForm((p) => ({ ...p, title: e.target.value }))} required />
          <input placeholder="Director" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={movieForm.director} onChange={(e) => setMovieForm((p) => ({ ...p, director: e.target.value }))} required />
          <input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={movieForm.releaseDate} onChange={(e) => setMovieForm((p) => ({ ...p, releaseDate: e.target.value }))} required />
          <input placeholder="Genres (comma separated)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={movieForm.genre} onChange={(e) => setMovieForm((p) => ({ ...p, genre: e.target.value }))} required />
          <input placeholder="Language" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={movieForm.language} onChange={(e) => setMovieForm((p) => ({ ...p, language: e.target.value }))} required />
          <input placeholder="Duration (minutes)" type="number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={movieForm.duration} onChange={(e) => setMovieForm((p) => ({ ...p, duration: e.target.value }))} required />
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setMovieForm((p) => ({ ...p, poster: file }));

              if (file) {
                if (posterPreview) {
                  URL.revokeObjectURL(posterPreview);
                }
                const objectUrl = URL.createObjectURL(file);
                setPosterPreview(objectUrl);
              } else {
                setPosterPreview('');
              }
            }}
            required
          />
          {posterPreview ? (
            <img
              src={posterPreview}
              alt="Poster preview"
              className="h-40 w-full rounded-lg object-cover"
            />
          ) : null}
          <textarea placeholder="Description" rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={movieForm.description} onChange={(e) => setMovieForm((p) => ({ ...p, description: e.target.value }))} required />

          <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand-ink px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> Add Movie
          </button>
        </form>

        <form onSubmit={handleShowCreate} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-brand-ink">
            <Ticket size={20} /> Add Show
          </h2>

          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={showForm.movie}
            onChange={(e) => setShowForm((p) => ({ ...p, movie: e.target.value }))}
            required
          >
            <option value="">Select Movie</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title}
              </option>
            ))}
          </select>

          <input type="datetime-local" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={showForm.showTime} onChange={(e) => setShowForm((p) => ({ ...p, showTime: e.target.value }))} required />
          <input type="number" placeholder="Ticket Price" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={showForm.ticketPrice} onChange={(e) => setShowForm((p) => ({ ...p, ticketPrice: e.target.value }))} required />
          <input type="number" placeholder="Total Seats (multiple of 6)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={showForm.totalSeats} onChange={(e) => setShowForm((p) => ({ ...p, totalSeats: e.target.value }))} required />

          <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand-ink px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> Add Show
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-2xl uppercase tracking-wide text-brand-ink">Movies</h3>
          <div className="mt-3 space-y-2">
            {movies.map((movie) => (
              <div key={movie._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{movie.title}</p>
                  <p className="text-xs text-slate-500">{movie.language} | {movie.duration} min</p>
                </div>
                <button onClick={() => softDeleteMovie(movie._id)} disabled={busy} className="rounded-md border border-red-300 p-2 text-red-700 hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-2xl uppercase tracking-wide text-brand-ink">Shows</h3>
          <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
            {shows.map((show) => (
              <div key={show._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{show.movie?.title || 'Unknown movie'}</p>
                  <p className="text-xs text-slate-500">{new Date(show.showTime).toLocaleString()} | ${show.ticketPrice}</p>
                </div>
                <button onClick={() => softDeleteShow(show._id)} disabled={busy} className="rounded-md border border-red-300 p-2 text-red-700 hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-display text-2xl uppercase tracking-wide text-brand-ink">Recent Bookings</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-2 py-2">User</th>
                <th className="px-2 py-2">Movie</th>
                <th className="px-2 py-2">Seats</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b border-slate-100">
                  <td className="px-2 py-2">{booking.user?.name || 'Unknown'}</td>
                  <td className="px-2 py-2">{booking.show?.movie?.title || 'N/A'}</td>
                  <td className="px-2 py-2">{booking.seats?.join(', ')}</td>
                  <td className="px-2 py-2">${booking.totalAmount}</td>
                  <td className="px-2 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
