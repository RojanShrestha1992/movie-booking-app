import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Languages, Ticket, Timer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { getErrorMessage, movieApi, showApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const getYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace('www.', '');
    let videoId = '';

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoId = parsed.searchParams.get('v') || '';
      if (!videoId && parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1] || '';
      }
      if (!videoId && parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1] || '';
      }
    }

    if (host === 'youtu.be') {
      videoId = parsed.pathname.replace('/', '');
    }

    videoId = videoId.split('?')[0].split('&')[0];
    if (!videoId) {
      return '';
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return '';
  }
};

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('all');
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

  const showsByTheater = useMemo(() => {
    const grouped = new Map();

    upcomingShows.forEach((show) => {
      const theaterId = show.theater?._id || 'unknown-theater';
      const theaterName = show.theater?.name || 'Main Hall';
      const theaterLocation = show.theater?.location || '';

      if (!grouped.has(theaterId)) {
        grouped.set(theaterId, {
          theaterId,
          theaterName,
          theaterLocation,
          dates: new Map(),
        });
      }

      const showDate = new Date(show.showTime);
      const dateKey = `${showDate.getFullYear()}-${showDate.getMonth()}-${showDate.getDate()}`;

      const theaterGroup = grouped.get(theaterId);
      if (!theaterGroup.dates.has(dateKey)) {
        theaterGroup.dates.set(dateKey, {
          label: showDate.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          shows: [],
        });
      }

      theaterGroup.dates.get(dateKey).shows.push(show);
    });

    return Array.from(grouped.values()).map((theaterGroup) => ({
      ...theaterGroup,
      dates: Array.from(theaterGroup.dates.values()).map((dateGroup) => ({
        ...dateGroup,
        shows: dateGroup.shows.sort((a, b) => new Date(a.showTime) - new Date(b.showTime)),
      })),
    }));
  }, [upcomingShows]);

  const theaterFilterOptions = useMemo(
    () =>
      showsByTheater.map((group) => ({
        id: group.theaterId,
        name: group.theaterName,
      })),
    [showsByTheater]
  );

  const filteredTheaterShows = useMemo(() => {
    if (selectedTheater === 'all') {
      return showsByTheater;
    }

    return showsByTheater.filter((group) => group.theaterId === selectedTheater);
  }, [selectedTheater, showsByTheater]);

  const trailerEmbedUrl = useMemo(() => getYouTubeEmbedUrl(movie?.trailerUrl), [movie?.trailerUrl]);

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

        {showsByTheater.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No upcoming shows available right now.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  selectedTheater === 'all'
                    ? 'bg-brand-ink text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
                onClick={() => setSelectedTheater('all')}
              >
                All Theaters
              </button>
              {theaterFilterOptions.map((theater) => (
                <button
                  type="button"
                  key={theater.id}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    selectedTheater === theater.id
                      ? 'bg-brand-ink text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                  onClick={() => setSelectedTheater(theater.id)}
                >
                  {theater.name}
                </button>
              ))}
            </div>

            {filteredTheaterShows.map((theaterGroup) => (
              <article
                key={theaterGroup.theaterId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-base font-semibold text-slate-900">{theaterGroup.theaterName}</p>
                <p className="text-sm text-slate-600">{theaterGroup.theaterLocation || 'Location unavailable'}</p>

                <div className="mt-4 space-y-3">
                  {theaterGroup.dates.map((dateGroup) => (
                    <div key={`${theaterGroup.theaterName}-${dateGroup.label}`} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dateGroup.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {dateGroup.shows.map((show) => (
                          <Link
                            key={show._id}
                            to={isAuthenticated ? `/shows/${show._id}/book` : '/login'}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-brand-ink hover:bg-slate-50"
                          >
                            <Clock3 size={14} />
                            {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-xs text-slate-500">${show.ticketPrice}</span>
                            <Ticket size={14} className="text-brand-ember" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-3xl uppercase tracking-wide text-brand-ink">Trailer</h2>

        {trailerEmbedUrl ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
            <div className="relative w-full pb-[56.25%]">
              <iframe
                src={trailerEmbedUrl}
                title={`${movie.title} trailer`}
                className="absolute left-0 top-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Trailer not available for this movie yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieDetailsPage;
