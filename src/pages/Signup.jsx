import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'buyer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create your account</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <label className="block text-sm text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        />

        <label className="block text-sm text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        />

        <label className="block text-sm text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        />

        <label className="block text-sm text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        />

        <label className="block text-sm text-gray-700 mb-1">I am a...</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        >
          <option value="buyer">Buyer / Renter</option>
          <option value="seller">Seller (I want to list my own property)</option>
          <option value="agent">Agent (I sell properties for clients)</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
