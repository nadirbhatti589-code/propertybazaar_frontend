import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data } = await api.get('/admin/agents/pending');
        setAgents(data.agents || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load pending agents.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleReview = async (id, action) => {
    let payload;
    if (action === 'reject') {
      const reason = window.prompt('Reason for rejection (optional):');
      if (reason === null) return;
      payload = { reason: reason.trim() };
    }

    setProcessingId(id);
    setError('');
    try {
      await api.patch(`/admin/agents/${id}/${action}`, payload);
      setAgents((current) => current.filter((agent) => agent._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action} this agent.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p className="py-10 text-center text-gray-500">Loading pending agents...</p>;

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {agents.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <p className="font-medium text-gray-900">No agents are waiting for verification.</p>
          <p className="mt-1 text-sm text-gray-500">New agent applications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent._id} className="rounded-lg border border-gray-200 bg-white p-4 sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{agent.user?.name || 'Unknown agent'}</h2>
                <p className="mt-1 text-sm text-gray-500">{agent.user?.email || 'No email'} · {agent.user?.phone || 'No phone number'}</p>
                <p className="mt-1 text-sm text-gray-500">Agency: {agent.agencyName} · License: {agent.licenseNumber}</p>
                {agent.licenseDocumentUrl && (
                  <a
                    href={agent.licenseDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    View license document
                  </a>
                )}
              </div>
              <div className="mt-4 flex gap-2 sm:mt-0 sm:ml-4">
                <button
                  type="button"
                  onClick={() => handleReview(agent._id, 'verify')}
                  disabled={processingId === agent._id}
                  className="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Verify
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(agent._id, 'reject')}
                  disabled={processingId === agent._id}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAgents;
