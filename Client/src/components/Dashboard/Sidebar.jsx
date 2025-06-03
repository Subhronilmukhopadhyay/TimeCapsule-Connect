import {useDispatch} from 'react-redux';
import {logout as authLogout} from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(authLogout()); // Dispatch the logout action
    setIsOpen(false); // Close the sidebar on logout
    navigate('/'); // Redirect to login page
  };

  const menuItems = [
    { name: 'Dashboard', icon: '🏠' },
    { name: 'My Capsules', icon: '📊' },
    { name: 'Explore', icon: '📋' },
    { name: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="p-4 fixed top-0 left-0 z-50 text-white bg-gray-800 rounded-r-sm shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div
        className={`h-screen bg-gray-800 text-white fixed top-0 left-0 transition-all duration-300 ease-in-out z-40 ${
          isOpen ? 'w-64' : 'w-16'
        }`
      }
      >
        <div className="p-4 pt-16">
          <h1 className={`text-2xl font-bold ${isOpen ? 'block' : 'hidden'}`}>
            TimeCapsule
          </h1>
        </div>
        <nav className="mt-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className="flex items-center p-4 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">{item.icon}</span>
              <span className={`${isOpen ? 'block' : 'hidden'}`}>
                {item.name}
              </span>
            </a>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <a
            href="#"
            className="flex items-center p-2 hover:bg-gray-700 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <span className="mr-2"onClick={handleLogout}>🔒</span>
            <span className={`${isOpen ? 'block' : 'hidden'}`} onClick={handleLogout}>Logout</span>
          </a>
        </div>
      </div>

      {/* Overlay */}
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
