import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { apiService } from '../../services/api';
import { useUserStore } from '../../stores/user.store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.login({ email, password });
      setCurrentUser(res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-gray-200 mb-6 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center font-black text-white">
            ND
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sign In to NowaDraw</h2>
            <p className="text-xs text-gray-400">Access saved whiteboards and room history</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-gray-800 text-gray-100 text-sm px-3.5 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-800 text-gray-100 text-sm px-3.5 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 font-semibold text-white text-sm py-2.5 rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2"
          >
            <LogIn size={16} />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-400 hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};
