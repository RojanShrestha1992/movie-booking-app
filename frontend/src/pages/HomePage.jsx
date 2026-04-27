import { useEffect, useMemo, useState } from 'react';
import MovieCard from '../components/MovieCard';
import NowPlayingSlider from '../components/NowPlayingSlider';
import Loader from '../components/Loader';
import { getErrorMessage, movieApi, showApi } from '../lib/api';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [upcomingShowMovies, setUpcomingShowMovies] = useState([]);
  const [activeTab, setActiveTab] = useState('now-playing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const [movieRes, upcomingRes] = await Promise.all([movieApi.all(), showApi.upcoming(30)]);

        setMovies(movieRes.data.movies || []);

        const uniqueMovies = new Map();
        (upcomingRes.data.shows || []).forEach((show) => {
          if (show?.movie?._id) {
            uniqueMovies.set(show.movie._id, show.movie);
          }
        });
        setUpcomingShowMovies(Array.from(uniqueMovies.values()));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const nowPlayingMovies = useMemo(() => {
    const today = new Date();
    const released = movies.filter((movie) => new Date(movie.releaseDate) <= today);
    return released;
  }, [movies]);

  const upcomingMovies = useMemo(() => {
    const today = new Date();
    const releaseDateUpcoming = movies.filter((movie) => new Date(movie.releaseDate) > today);

    const merged = new Map();
    releaseDateUpcoming.forEach((movie) => merged.set(movie._id, movie));
    upcomingShowMovies.forEach((movie) => merged.set(movie._id, movie));

    return Array.from(merged.values());
  }, [movies, upcomingShowMovies]);

  const gridMovies = activeTab === 'upcoming' ? upcomingMovies : nowPlayingMovies;

  const tabClass = (tab) =>
    `rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition sm:text-sm ${
      activeTab === tab
        ? 'bg-brand-ember text-black shadow-md'
        : 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15'
    }`;

  return (
    <section className="space-y-5 bg-brand-ink pb-10 pt-4">
      {!loading && !error && nowPlayingMovies.length > 0 ? <NowPlayingSlider movies={nowPlayingMovies.slice(0, 5)} /> : null}

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {loading ? <Loader label="Loading movies..." /> : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {!loading && !error && movies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No movies available right now.
          </div>
        ) : null}

        {!loading && !error && movies.length > 0 ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={tabClass('now-playing')} onClick={() => setActiveTab('now-playing')}>
                Now Showing
              </button>
              <button type="button" className={tabClass('upcoming')} onClick={() => setActiveTab('upcoming')}>
                Upcoming Releases
              </button>
            </div>

            {gridMovies.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                {activeTab === 'upcoming' ? 'No upcoming movies found.' : 'No now playing movies found.'}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5">
                {gridMovies.map((movie) => (
                  <MovieCard
                    key={movie._id}
                    movie={movie}
                    badgeLabel={activeTab === 'upcoming' ? 'Upcoming' : 'Now Playing'}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HomePage;
