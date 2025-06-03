import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import {useDispatch} from 'react-redux'; // Import useDispatch from react-redux
import {logout as authLogout} from '../../store/slices/authSlice'; // Import the logout action

const Header = ({ isOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const authData = useSelector((state) => state.auth.userData?.username || 'Guest'); // Fallback to 'Guest' if no user data
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(authLogout()); // Dispatch the logout action
    setShowDropdown(false); // Close the dropdown on logout
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <header
      className={`flex items-center justify-between bg-white shadow-sm p-4 fixed top-0 transition-all duration-300 z-20 h-14 rounded-l-sm ${
        isOpen ? 'left-64' : 'left-16'
      } right-0 ml-0.5`}
    >
      <div className="flex items-center w-full md:w-1/3 pl-1 md:pl-0">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-[200px] sm:max-w-[200px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:block"
        />
      </div>
      <div className="flex items-center space-x-4 relative">
        <div className="relative">
          <span className="text-xl cursor-pointer">🔔</span>
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </div>
        <div className="flex items-center space-x-2 relative pr-2 pl-2">
          <span
            className="font-medium sm:block"
            onPointerOver={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
              e.currentTarget.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
            onClick={toggleDropdown}
          >
            {authData}
          </span>

          {showDropdown && (
            <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg p-2 z-30">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                Profile
              </Link>
              <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">
                Settings
              </Link>
              <Link to="/" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
