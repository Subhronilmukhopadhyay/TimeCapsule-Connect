import { useState } from 'react';
import ProfileSettings from './Settings/ProfileSettings'
// import PrivacySettings from './settings/PrivacySettings';
import NotificationSettings from './Settings/NotificationSettings';
import DeleteAccount from './Settings/DeleteAccount';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      {/* Tab Selector */}
      <div className="flex space-x-4 border-b mb-6">
        {['profile', 'notifications', 'delete account'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 capitalize border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-blue-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      {activeTab === 'profile' && <ProfileSettings />}
      {/* {activeTab === 'privacy' && <PrivacySettings />} */}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'delete account' && <DeleteAccount />}
    </div>
  );
};

export default Settings;
