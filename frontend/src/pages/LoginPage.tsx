import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // used to programmatically change the URL (jump to homepage after login)
import api from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); 
    setError('');       

    try {
      // capture response
      const res = await api.post('/login', { email, password });
      // save the token
      localStorage.setItem('token', res.data.token);
      navigate('/'); 
    } catch (err: any) {
      console.error("Login Failed:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed (Check console for details)');
      }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl px-6 py-6">
        <div className="mb-4 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Login
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Welcome back to Gossip.
          </p>
        </div>

        {error && (
          <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-sm bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-sky-600 dark:text-sky-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}