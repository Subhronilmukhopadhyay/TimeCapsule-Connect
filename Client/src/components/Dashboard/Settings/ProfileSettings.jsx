import { useEffect, useState } from 'react';
// import axios from '../../utils/axiosInstance'; // custom axios with auth headers

const ProfileSettings = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const fetchProfile = async () => {
    //   const res = await axios.get('/api/user/profile');
    //   setFormData({ name: res.data.name, email: res.data.email, password: '' });
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // await axios.put('/api/user/profile', formData);
    alert('Profile updated!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" />
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" />
      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password" className="w-full border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
};

export default ProfileSettings;
