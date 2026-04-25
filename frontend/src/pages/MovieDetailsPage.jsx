import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Languages, Ticket, Timer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { getErrorMessage, movieApi, showApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [movieRes, showsRes] = await Promise.all([movieApi.one(movieId), showApi.byMovie(movieId)]);
        setMovie(movieRes.data.movie);
        setShows(showsRes.data.shows || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [movieId]);

  const upcomingShows = useMemo(
    () => shows.filter((show) => new Date(show.showTime) > new Date() && show.isActive !== false),
    [shows]
  );

  if (loading) return <Loader label="Loading movie and showtimes..." />;

  if (error || !movie) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || 'Movie not found.'}</div>;
  }

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-card md:grid-cols-[340px_1fr] md:p-6">
        <img src={movie.poster} alt={movie.title} className="h-80 w-full rounded-2xl object-cover md:h-full" />

        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
              Now Showing
            </p>
            <h1 className="font-display text-4xl uppercase tracking-wide text-brand-ink">{movie.title}</h1>
            <p className="mt-4 text-sm leading-6 text-slate-700">{movie.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs uppercase text-slate-500">
                <Timer size={14} /> Duration
              </p>
              <p className="font-semibold">{movie.duration} min</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs uppercase text-slate-500">
                <Languages size={14} /> Language
              </p>
              <p className="font-semibold">{movie.language}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs uppercase text-slate-500">
                <CalendarDays size={14} /> Release
              </p>
              <p className="font-semibold">{new Date(movie.releaseDate).toLocaleDateString()}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs uppercase text-slate-500">
                <Clock3 size={14} /> Director
              </p>
              <p className="font-semibold">{movie.director}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-3xl uppercase tracking-wide text-brand-ink">Available Showtimes</h2>

        {upcomingShows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No upcoming shows available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {upcomingShows.map((show) => (
              <article key={show._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">{new Date(show.showTime).toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-600">Price: ${show.ticketPrice} per seat</p>

                <Link
                  to={isAuthenticated ? `/shows/${show._id}/book` : '/login'}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-slate"
                >
                  <Ticket size={16} /> {isAuthenticated ? 'Select Seats' : 'Login to Book'}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieDetailsPage;
