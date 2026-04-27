import { Film, LayoutDashboard, LogOut, Ticket, UserCircle2 } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-white text-brand-ink' : 'text-white/80 hover:bg-white/10 hover:text-white'
  }`;

const Layout = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-brand-ink/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="rounded-lg bg-brand-ember p-2">
              <Film size={18} />
            </span>
            <span className="font-display text-2xl uppercase tracking-wide">Cinema Hub</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={navClass}>
              Movies
            </NavLink>
            <Link to="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
              Theaters
            </Link>
            <Link to="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
              Showtimes
            </Link>
            <Link to="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
              Offers
            </Link>
            {isAuthenticated && !isAdmin && (
              <NavLink to="/my-bookings" className={navClass}>
                My Bookings
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden w-full max-w-xs items-center rounded-full border border-white/15 bg-white/10 px-3 py-2 md:flex">
            <input
              type="text"
              placeholder="Search Bar"
              className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/45 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white sm:flex">
                  <UserCircle2 size={16} className="text-brand-gold" />
                  {user?.name}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-gold transition hover:bg-brand-gold/15"
                  >
                    <LayoutDashboard size={14} /> Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-ember px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-orange-600"
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <div className="hidden items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white md:flex">
                <Link to="/login" className="transition hover:text-brand-ember">
                  Log In
                </Link>
                <span className="text-white/40">|</span>
                <Link to="/register" className="transition hover:text-brand-ember">
                  Sign Up
                </Link>
              </div>
            )}

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-ember px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-orange-600 md:hidden"
              >
                <Ticket size={14} /> Join
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
          <NavLink to="/" className={navClass}>
            Movies
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <NavLink to="/my-bookings" className={navClass}>
              Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
        </div>
      </header>

      <main className={`flex-1 ${isHomeRoute ? 'w-full' : 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
