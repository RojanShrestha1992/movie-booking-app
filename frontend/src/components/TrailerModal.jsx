import { useEffect } from 'react';

const getYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
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
    if (!videoId) return '';

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  } catch {
    return '';
  }
};

const TrailerModal = ({ trailerUrl, onClose, title = 'Trailer' }) => {
  const embed = getYouTubeEmbedUrl(trailerUrl);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!embed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="mx-auto w-full max-w-3xl rounded-xl bg-black/95 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">Close</button>
        </div>
        <div className="relative w-full pb-[56.25%]">
          <iframe
            src={embed}
            title={`${title} trailer`}
            className="absolute left-0 top-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
