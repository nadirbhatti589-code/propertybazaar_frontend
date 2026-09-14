import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { const fetchFavorites = async () => { try { const { data } = await api.get('/favorites'); setFavorites(data.favorites); } catch (err) { /* ignore */ } finally { setLoading(false); } }; fetchFavorites(); }, []);
  if (loading) return <p className="py-20 text-center text-sand-600">Loading...</p>;
  return <main className="mx-auto max-w-7xl px-4 py-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500">Saved places</p><h1 className="section-heading mb-6 mt-1">Your Favorites</h1>{favorites.length === 0 ? <div className="border border-dashed border-sand-400 bg-sand-100/60 px-6 py-14 text-center"><p className="font-display text-2xl font-semibold text-ink">A good shortlist is worth keeping.</p><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-sand-600">Explore listings and save the homes you want to revisit.</p><Link to="/" className="btn-primary mt-6 inline-block">Browse Properties</Link></div> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{favorites.map((fav) => fav.property && <PropertyCard key={fav._id} property={fav.property} />)}</div>}</main>;
};
export default Favorites;
