import { useEffect, useMemo, useState } from 'react';
import { Ticket, TriangleAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { bookingApi, getErrorMessage, showApi } from '../lib/api';

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadShow = async () => {
      try {
        const { data } = await showApi.one(showId);
        setShow(data.show);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadShow();
  }, [showId]);

  const groupedSeats = useMemo(() => {
    if (!show?.seats?.length) return {};
    return show.seats.reduce((acc, seat) => {
      const row = seat.seatNumber[0];
      if (!acc[row]) {
        acc[row] = [];
      }
      acc[row].push(seat);
      return acc;
    }, {});
  }, [show]);

  const totalAmount = useMemo(() => (show ? selectedSeats.length * show.ticketPrice : 0), [selectedSeats.length, show]);

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seat.seatNumber)) {
        return prev.filter((item) => item !== seat.seatNumber);
      }
      return [...prev, seat.seatNumber];
    });
  };

  const bookNow = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await bookingApi.create({ showId, seats: selectedSeats });
      setSuccess('Booking confirmed. Redirecting to your bookings...');
      setTimeout(() => navigate('/my-bookings'), 900);
    } catch (err) {
      setError(getErrorMessage(err));
      try {
        const fresh = await showApi.one(showId);
        setShow(fresh.data.show);
        setSelectedSeats([]);
      } catch {
        // Keep current state if refresh fails.
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading seat map..." />;

  if (!show || error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || 'Show unavailable'}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <h1 className="font-display text-3xl uppercase tracking-wide text-brand-ink">Seat Selection</h1>
        <p className="mt-2 text-sm text-slate-600">
          {show.movie?.title} | {new Date(show.showTime).toLocaleString()} | ${show.ticketPrice} per seat
        </p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 sm:text-sm">
          <p className="font-semibold uppercase tracking-wide text-slate-700">Screen This Way</p>
          <div className="mt-2 h-2 rounded-full bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />
        </div>

        <div className="mt-6 space-y-4">
          {Object.entries(groupedSeats).map(([row, seats]) => (
            <div key={row} className="flex flex-wrap items-center gap-2">
              <span className="w-6 text-sm font-bold text-slate-700">{row}</span>
              {seats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatNumber);
                const base =
                  'min-w-11 rounded-lg border px-2 py-2 text-center text-xs font-semibold transition sm:text-sm';
                const stateClass = seat.isBooked
                  ? 'cursor-not-allowed border-slate-300 bg-slate-300 text-slate-500'
                  : isSelected
                    ? 'border-brand-ink bg-brand-ink text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-ember hover:text-brand-ember';

                return (
                  <button
                    type="button"
                    key={seat.seatNumber}
                    className={`${base} ${stateClass}`}
                    onClick={() => toggleSeat(seat)}
                    disabled={seat.isBooked || saving}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Selected Seats</p>
            <p className="text-sm font-semibold text-slate-800">{selectedSeats.join(', ') || 'None selected'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Amount</p>
            <p className="font-display text-3xl text-brand-ink">${totalAmount}</p>
          </div>
        </div>

        {error ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <TriangleAlert size={16} /> {error}
          </p>
        ) : null}

        {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

        <button
          type="button"
          onClick={bookNow}
          disabled={saving}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-slate disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Ticket size={16} /> {saving ? 'Confirming Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </section>
  );
};

export default SeatBookingPage;
