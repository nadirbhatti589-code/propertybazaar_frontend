import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Log in to PropertyBazaar</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <label className="block text-sm text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        />

        <label className="block text-sm text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-600 font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
