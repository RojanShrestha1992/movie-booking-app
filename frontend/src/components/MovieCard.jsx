import { CalendarClock, Clapperboard, Languages, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-64 overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <h3 className="absolute bottom-4 left-4 right-4 font-display text-2xl uppercase tracking-wide text-white">
          {movie.title}
        </h3>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          {movie.genre?.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700"
            >
              {item}
            </span>
          ))}
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">{movie.description}</p>

        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Timer size={16} className="text-brand-ember" />
            {movie.duration} min
          </div>
          <div className="flex items-center gap-1.5">
            <Languages size={16} className="text-brand-ember" />
            {movie.language}
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock size={16} className="text-brand-ember" />
            {new Date(movie.releaseDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1.5">
            <Clapperboard size={16} className="text-brand-ember" />
            {movie.director}
          </div>
        </div>

        <Link
          to={`/movies/${movie._id}`}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-slate"
        >
          View Showtimes
        </Link>
      </div>
    </article>
  );
};

export default MovieCard;
