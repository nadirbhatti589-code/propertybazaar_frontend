import { useState } from 'react';
import AdminOverview from './admin/AdminOverview';
import AdminProperties from './admin/AdminProperties';
import AdminAgents from './admin/AdminAgents';
import AdminUsers from './admin/AdminUsers';

const tabs = [
  { id: 'overview', label: 'Overview', component: AdminOverview },
  { id: 'properties', label: 'Pending Properties', component: AdminProperties },
  { id: 'agents', label: 'Pending Agents', component: AdminAgents },
  { id: 'users', label: 'Users', component: AdminUsers },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab).component;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-500">Manage PropertyBazaar listings, agents, and users.</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-5 overflow-x-auto" aria-label="Admin panel sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <ActiveComponent />
    </main>
  );
};

export default AdminPanel;
