import { useEffect, useState } from 'react';
import { CalendarClock, CircleDollarSign, TicketX } from 'lucide-react';
import Loader from '../components/Loader';
import { bookingApi, getErrorMessage } from '../lib/api';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadBookings = async () => {
    try {
      const { data } = await bookingApi.mine();
      setBookings(data.bookings || []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    setBusyId(bookingId);
    try {
      await bookingApi.cancel(bookingId);
      await loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  };

  if (loading) return <Loader label="Loading your bookings..." />;

  return (
    <section className="space-y-5">
      <h1 className="font-display text-4xl uppercase tracking-wide text-brand-ink">My Bookings</h1>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No bookings found yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <article key={booking._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{booking.show?.movie?.title || 'Movie'}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Seats: <span className="font-semibold">{booking.seats.join(', ')}</span>
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                <p className="flex items-center gap-2">
                  <CalendarClock size={16} className="text-brand-ember" />
                  {booking.show?.showTime ? new Date(booking.show.showTime).toLocaleString() : 'N/A'}
                </p>
                <p className="flex items-center gap-2">
                  <CircleDollarSign size={16} className="text-brand-ember" />${booking.totalAmount}
                </p>
              </div>

              {booking.status !== 'cancelled' ? (
                <button
                  type="button"
                  onClick={() => cancelBooking(booking._id)}
                  disabled={busyId === booking._id}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TicketX size={16} /> {busyId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default BookingsPage;
