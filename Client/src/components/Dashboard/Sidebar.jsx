// src/components/Dashboard/Sidebar.jsx
import { useDispatch } from 'react-redux';
import { logout as authLogout } from '../../store/slices/authSlice';
import useLogout from '../../services/logout';
import { useNavigate, Link } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const logout = useLogout();
  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'My Capsules', icon: '🗂️', path: '/dashboard/my-capsules' },
    // { name: 'Time-Locked', icon: '⏳', path: '/dashboard/time-locked' },
    // { name: 'Location-Locked', icon: '📍', path: '/dashboard/location-locked' },
    { name: 'Explore', icon: '🧭', path: '/dashboard/explore' },
    { name: 'Shared with me', icon: '👥', path: '/dashboard/shared-with-me' },
    { name: 'Messages', icon: '💬', path: '/dashboard/messages' },
    // { name: 'Notifications', icon: '🔔', path: '/dashboard/notifications' },
    // { name: 'Settings', icon: '⚙️', path: '/dashboard/settings' },

  ];

  return (
    <>
      <button
        className="p-4 fixed top-0 left-0 z-50 text-white bg-gray-800 rounded-r-sm shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <div
        className={`h-screen bg-gray-800 text-white fixed top-0 left-0 transition-all duration-300 ease-in-out z-40 ${
          isOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="p-4 pt-16">
          <h1 className={`text-2xl font-bold ${isOpen ? 'block' : 'hidden'}`}>
            TimeCapsule
          </h1>
        </div>

        <nav className="mt-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center p-4 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">{item.icon}</span>
              <span className={`${isOpen ? 'block' : 'hidden'}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-3">
          <button
            className="flex items-center p-2 hover:bg-gray-700 rounded-lg w-full"
            onClick={handleLogout}
          >
            <span className="mr-2">🔒</span>
            <span className={`${isOpen ? 'block' : 'hidden'}`}>Logout</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
