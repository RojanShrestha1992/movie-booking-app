import { Clock3, Mail, MapPin, Phone, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <section className="space-y-3">
          <h3 className="inline-flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-white">
            <Ticket size={18} className="text-brand-ember" /> MovieHub
          </h3>
          <p className="max-w-xs text-sm leading-6 text-slate-300">
            Your destination for smooth movie booking, real-time seat selection, and theater-wise show schedules.
          </p>
        </section>

        <section className="space-y-3">
          <h4 className="font-semibold uppercase tracking-wide text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/" className="transition hover:text-brand-ember">
                Browse Movies
              </Link>
            </li>
            <li>
              <Link to="/my-bookings" className="transition hover:text-brand-ember">
                My Bookings
              </Link>
            </li>
            <li>
              <Link to="/admin" className="transition hover:text-brand-ember">
                Admin Dashboard
              </Link>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h4 className="font-semibold uppercase tracking-wide text-white">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="inline-flex items-center gap-2">
              <MapPin size={14} className="text-brand-ember" /> Kathmandu, Nepal
            </li>
            <li>
              <a href="tel:+9779800000000" className="inline-flex items-center gap-2 transition hover:text-brand-ember">
                <Phone size={14} className="text-brand-ember" /> +977 9800000000
              </a>
            </li>
            <li>
              <a href="mailto:support@moviehub.app" className="inline-flex items-center gap-2 transition hover:text-brand-ember">
                <Mail size={14} className="text-brand-ember" /> support@moviehub.app
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h4 className="font-semibold uppercase tracking-wide text-white">Support Hours</h4>
          <p className="inline-flex items-center gap-2 text-sm text-slate-300">
            <Clock3 size={14} className="text-brand-ember" /> Daily: 9:00 AM to 10:00 PM
          </p>
          <p className="text-sm text-slate-400">
            Need help with refunds or booking issues? Reach out to our support team.
          </p>
        </section>
      </div>

      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs uppercase tracking-wide text-slate-400 sm:px-6 lg:px-8">
        Copyright {year} MovieHub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
