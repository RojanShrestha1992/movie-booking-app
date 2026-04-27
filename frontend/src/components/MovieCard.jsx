import { Link } from 'react-router-dom';

const MovieCard = ({ movie, badgeLabel = 'Now Playing' }) => {
  return (
    <article className="group relative mx-auto w-full max-w-[220px] overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-[235px] overflow-hidden rounded-b-xl">
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-white">
          {badgeLabel}
        </span>
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 font-display text-xl uppercase tracking-wide text-white">{movie.title}</h3>
        <p className="text-xs text-slate-300">{(movie.genre || []).slice(0, 2).join(', ') || 'Drama'} • {movie.duration}m</p>
        <Link
          to={`/movies/${movie._id}`}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-brand-ember px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-black transition hover:bg-yellow-400"
        >
          Book Now
        </Link>
      </div>
    </article>
  );
};

export default MovieCard;
