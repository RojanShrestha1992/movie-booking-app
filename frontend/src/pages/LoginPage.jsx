import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(form);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate(location.state?.from || '/');
  };

  return (
    <main className="grid min-h-screen place-items-center bg-hero px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-lg bg-brand-ember p-2 text-white">
            <Film size={18} />
          </span>
          <h1 className="font-display text-3xl uppercase tracking-wide">Welcome Back</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-ember focus:ring-2 focus:ring-orange-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-ember focus:ring-2 focus:ring-orange-100"
              required
            />
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-slate disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New user?{' '}
          <Link to="/register" className="font-semibold text-brand-ember hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
