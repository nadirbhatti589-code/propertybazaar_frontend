import { useEffect, useState } from 'react';
import api from '../../api/axios';

const roleStyles = {
  admin: 'bg-purple-100 text-purple-700',
  agent: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleBlock = async (id) => {
    setProcessingId(id);
    setError('');
    try {
      const { data } = await api.patch(`/admin/users/${id}/block`);
      setUsers((current) => current.map((user) => (user._id === id ? data.user : user)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update user status.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p className="py-10 text-center text-gray-500">Loading users...</p>;

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${roleStyles[user.role] || roleStyles.user}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={user.isBlocked ? 'text-red-600' : 'text-green-600'}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => toggleBlock(user._id)}
                      disabled={processingId === user._id}
                      className={user.isBlocked ? 'text-primary-600 hover:text-primary-700 disabled:opacity-60' : 'text-red-600 hover:text-red-700 disabled:opacity-60'}
                    >
                      {processingId === user._id ? 'Updating...' : user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-8 text-center text-sm text-gray-500">No users found.</p>}
      </div>
    </div>
  );
};

export default AdminUsers;
