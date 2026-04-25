import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import { getErrorMessage, movieApi } from '../lib/api';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const { data } = await movieApi.all();
        setMovies(data.movies || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return movies;
    return movies.filter((movie) => {
      const scope = `${movie.title} ${movie.director} ${(movie.genre || []).join(' ')}`.toLowerCase();
      return scope.includes(value);
    });
  }, [movies, query]);

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-hero px-6 py-14 text-white shadow-card sm:px-10">
        <p className="mb-2 inline-flex rounded-full border border-white/25 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/85">
          Live Booking Platform
        </p>
        <h1 className="max-w-3xl font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
          Book premium movie seats in seconds.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
          Browse latest films, check real-time show seats, and reserve your ticket with a clean, instant checkout flow.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-brand-ember focus-within:ring-2 focus-within:ring-orange-200">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, director, or genre"
            className="w-full border-none bg-transparent text-sm outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {loading ? <Loader label="Loading movies..." /> : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {!loading && !error && filteredMovies.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No movies matched your search.
        </div>
      ) : null}

      {!loading && !error && filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default HomePage;
