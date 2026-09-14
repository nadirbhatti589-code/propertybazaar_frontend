import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); setLoading(true); try { await login(form.email, form.password); navigate('/'); } catch (err) { setError(err.response?.data?.message || 'Login failed'); } finally { setLoading(false); } };

  return <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl lg:grid-cols-2">
    <section className="order-2 flex items-center justify-center px-5 py-12 sm:px-10 lg:order-1 lg:px-16 xl:px-24"><div className="w-full max-w-md">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-500">Welcome back</p>
      <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">Come home to a better search.</h1>
      <p className="mt-4 text-sm leading-6 text-sand-600">Log in to save the places that feel right and speak directly with their owners.</p>
      <form onSubmit={handleSubmit} className="mt-8 border-t border-sand-200 pt-6">
        {error && <p className="mb-4 rounded-md border border-brand-400/30 bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p>}
        <div className="space-y-5"><div><label className="mb-1.5 block text-sm font-medium text-ink">Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" /></div><div><label className="mb-1.5 block text-sm font-medium text-ink">Password</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="form-input" /></div></div>
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">{loading ? 'Logging in...' : 'Log In'}</button>
        <p className="mt-5 text-center text-sm text-sand-600">Don't have an account? <Link to="/signup" className="font-semibold text-teal-600 hover:text-teal-500 hover:underline">Sign up</Link></p>
      </form>
    </div></section>
    <aside className="relative order-1 overflow-hidden bg-teal-600 px-7 py-12 text-paper sm:px-12 lg:order-2 lg:flex lg:items-end lg:px-16 lg:py-20"><div className="tile-pattern absolute inset-0 opacity-30" /><div className="relative max-w-lg"><span className="mb-6 block h-px w-16 bg-gold-400" /><p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">PropertyBazaar Pakistan</p><h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">A local address for every next chapter.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-teal-50">Thoughtful listings, familiar neighbourhoods, and a marketplace made for the way Pakistan moves.</p></div></aside>
  </main>;
};
export default Login;
