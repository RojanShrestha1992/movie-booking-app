import { useEffect, useMemo, useState } from 'react';
import { Armchair, MonitorPlay, Ticket, TriangleAlert } from 'lucide-react';
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
    const grouped = show.seats.reduce((acc, seat) => {
      const row = seat.seatNumber[0];
      if (!acc[row]) {
        acc[row] = [];
      }
      acc[row].push(seat);
      return acc;
    }, {});

    Object.keys(grouped).forEach((row) => {
      grouped[row].sort((a, b) => {
        const seatA = Number(a.seatNumber.slice(1));
        const seatB = Number(b.seatNumber.slice(1));
        return seatA - seatB;
      });
    });

    return grouped;
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

  const getSeatClassName = (seat) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);

    if (seat.isBooked) {
      return 'cursor-not-allowed border-slate-300 bg-slate-300 text-slate-500';
    }

    if (isSelected) {
      return 'border-brand-ink bg-brand-ink text-white shadow-lg shadow-brand-ink/25';
    }

    return 'border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-brand-ember hover:text-brand-ember hover:shadow-md';
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-8">
        <div className="text-center">
          <h1 className="font-display text-3xl uppercase tracking-wide text-brand-ink sm:text-4xl">Seat Selection</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {show.movie?.title} | {new Date(show.showTime).toLocaleString()} | ${show.ticketPrice} per seat
          </p>
        </div>

        <div className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-100 to-white p-4 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 sm:text-sm">
            <MonitorPlay size={16} className="text-brand-ember" /> Screen This Way
          </p>
          <div className="mx-auto mt-3 h-3 w-[85%] rounded-full bg-gradient-to-r from-orange-200 via-orange-500 to-orange-200 shadow-[0_0_40px_rgba(249,115,22,0.35)]" />
        </div>

        <div className="mx-auto mt-5 flex w-full max-w-3xl flex-wrap items-center justify-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <Armchair size={14} className="text-slate-500" /> Available
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <Armchair size={14} className="text-brand-ink" /> Selected
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <Armchair size={14} className="text-slate-400" /> Booked
          </span>
        </div>

        <div className="mt-8 space-y-4">
          {Object.entries(groupedSeats).map(([row, seats]) => (
            <div key={row} className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="w-8 text-center text-xs font-bold text-slate-600 sm:text-sm">{row}</span>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {seats.map((seat) => {
                  const stateClass = getSeatClassName(seat);

                  return (
                    <button
                      type="button"
                      key={seat.seatNumber}
                      className={`group flex h-14 w-14 flex-col items-center justify-center rounded-xl border text-[10px] font-semibold transition sm:h-16 sm:w-16 sm:text-xs ${stateClass}`}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.isBooked || saving}
                      aria-label={`Seat ${seat.seatNumber}`}
                    >
                      <Armchair size={16} className="mb-0.5 sm:mb-1" />
                      <span>{seat.seatNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
