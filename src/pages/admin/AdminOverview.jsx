import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statCards = [
  { key: 'totalProperties', label: 'Live Properties' },
  { key: 'pendingProperties', label: 'Pending Properties' },
  { key: 'totalUsers', label: 'Total Users' },
  { key: 'pendingAgents', label: 'Pending Agents' },
  { key: 'totalAgents', label: 'Verified Agents' },
];

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard statistics.');
      }
    };

    fetchStats();
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="py-10 text-center text-gray-500">Loading dashboard...</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map(({ key, label }) => (
        <div key={key} className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats[key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminOverview;
