import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const NowPlayingSlider = ({ movies = [] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: movies.length > 1,
    duration: 32,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || movies.length <= 1 || isHovered) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4200);

    return () => clearInterval(autoplay);
  }, [emblaApi, movies.length, isHovered]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section
      className="relative mx-auto w-full max-w-[92rem] overflow-hidden rounded-2xl border border-white/10 bg-brand-ink shadow-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {movies.map((movie) => (
            <article key={movie._id} className="min-w-0 flex-[0_0_100%]">
              <div className="group relative h-[220px] overflow-hidden sm:h-[280px] lg:h-[320px]">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/35 to-black/65" />

                <div className="absolute inset-y-0 right-0 flex w-[52%] flex-col justify-center p-4 text-white sm:p-6 lg:p-8">
                  <h3 className="line-clamp-2 font-display text-2xl uppercase tracking-wide sm:text-4xl lg:text-5xl">
                    {movie.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-1 text-xs text-white/85 sm:text-sm">
                    <span className="inline-flex items-center gap-1">
                      4.9/5 <Star size={13} className="fill-brand-gold text-brand-gold" />
                    </span>
                    <span>|</span>
                    <span>{movie.genre?.[0] || 'Drama'}</span>
                    <span>|</span>
                    <span>{movie.language || 'English'}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/movies/${movie._id}`}
                      className="inline-flex rounded-full bg-brand-ember px-4 py-2 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-yellow-400"
                    >
                      Book Tickets
                    </Link>
                    <button
                      type="button"
                      className="inline-flex rounded-full border border-white/40 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-black/35"
                    >
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between px-3 sm:px-4">
        <button
          type="button"
          onClick={scrollPrev}
          className="pointer-events-auto rounded-full border border-white/50 bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50"
          aria-label="Previous movie"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="pointer-events-auto rounded-full border border-white/50 bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50"
          aria-label="Next movie"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm sm:bottom-3">
        {movies.map((movie, index) => (
          <button
            key={movie._id}
            type="button"
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2.5 rounded-full transition ${
              index === selectedIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/55 hover:bg-white/75'
            }`}
            aria-label={`Go to ${movie.title}`}
          />
        ))}
      </div>
    </section>
  );
};

export default NowPlayingSlider;
