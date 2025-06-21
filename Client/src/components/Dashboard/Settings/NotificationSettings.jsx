import { useEffect, useState } from 'react';
// import axios from '../../utils/axiosInstance';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    capsuleReminders: false,
    collaborationInvites: false,
    messageActivity: false,
  });

  useEffect(() => {
    const fetchNotifications = async () => {
    //   const res = await axios.get('/api/user/settings/notifications');
    //   setSettings(res.data);
    };
    fetchNotifications();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // await axios.put('/api/user/settings/notifications', settings);
    alert('Notification preferences saved');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
      {['capsuleReminders', 'collaborationInvites', 'messageActivity'].map((key) => (
        <label key={key} className="flex justify-between items-center">
          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          <input type="checkbox" name={key} checked={settings[key]} onChange={handleChange} />
        </label>
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
    </form>
  );
};

export default NotificationSettings;
