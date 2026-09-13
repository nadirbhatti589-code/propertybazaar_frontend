import { useEffect, useState } from 'react';
import api from '../api/axios';

const statusInfo = {
  pending: {
    color: 'bg-yellow-100 text-yellow-700',
    text: 'Your application is under review. This usually takes 1-2 business days.',
  },
  verified: {
    color: 'bg-green-100 text-green-700',
    text: "You're a verified agent! A badge now appears on your listings.",
  },
  rejected: {
    color: 'bg-red-100 text-red-700',
    text: 'Your application was rejected. See the reason below.',
  },
};

const AgentVerification = () => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    agencyName: '',
    licenseNumber: '',
    licenseDocumentUrl: '',
    bio: '',
    serviceCitiesText: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/agents/me');
        setAgent(data.agent);
      } catch (err) {
        // 404 just means no application submitted yet — that's fine
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        agencyName: form.agencyName,
        licenseNumber: form.licenseNumber,
        licenseDocumentUrl: form.licenseDocumentUrl,
        bio: form.bio,
        serviceCities: form.serviceCitiesText
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      };

      const { data } = await api.post('/agents/apply', payload);
      setAgent(data.agent);
      setSuccess('Application submitted! Track your status below.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Agent Verification</h1>
      <p className="text-gray-500 text-sm mb-6">
        Get a verified badge on your listings so buyers know you're a legitimate, licensed agent.
      </p>

      {agent ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <span
            className={`inline-block text-xs px-3 py-1 rounded-full mb-3 capitalize ${
              statusInfo[agent.verifiedStatus]?.color || 'bg-gray-100 text-gray-700'
            }`}
          >
            {agent.verifiedStatus}
          </span>
          <p className="text-gray-700 mb-4">{statusInfo[agent.verifiedStatus]?.text}</p>

          {agent.verifiedStatus === 'rejected' && agent.rejectionReason && (
            <p className="text-sm text-red-600 mb-4">Reason: {agent.rejectionReason}</p>
          )}

          <div className="text-sm text-gray-600 space-y-1 border-t pt-4">
            <p>
              <span className="font-medium">Agency:</span> {agent.agencyName || '-'}
            </p>
            <p>
              <span className="font-medium">License Number:</span> {agent.licenseNumber}
            </p>
            {agent.serviceCities?.length > 0 && (
              <p>
                <span className="font-medium">Service Cities:</span> {agent.serviceCities.join(', ')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Agency Name (optional)</label>
            <input
              name="agencyName"
              value={form.agencyName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">License Number</label>
            <input
              name="licenseNumber"
              required
              value={form.licenseNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">License Document URL</label>
            <input
              name="licenseDocumentUrl"
              required
              value={form.licenseDocumentUrl}
              onChange={handleChange}
              placeholder="Paste a link to your uploaded license document"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Image upload isn't wired into this form yet — for now, paste a link to your document
              (e.g. uploaded to Google Drive with public view access, or a Cloudinary URL).
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Bio (optional)</label>
            <textarea
              name="bio"
              rows={3}
              value={form.bio}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Service Cities (comma separated)</label>
            <input
              name="serviceCitiesText"
              placeholder="Karachi, Lahore, Islamabad"
              value={form.serviceCitiesText}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AgentVerification;