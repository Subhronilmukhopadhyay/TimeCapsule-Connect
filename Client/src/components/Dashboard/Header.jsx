// import { Link } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useEffect, useRef, useState } from 'react';
// import { logout as authLogout } from '../../store/slices/authSlice';
// // import { Howl } from 'howler'; // For sound effect
// import axios from 'axios';

// const Header = ({ isOpen }) => {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([
//     { id: 1, message: 'Your appointment is confirmed.' },
//     { id: 2, message: 'New message from Dr. Smith.' },
//     { id: 3, message: 'Your report is available for download.' },
//   ]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const dropdownRef = useRef(null);
//   const bellRef = useRef(null);

//   const authData = useSelector((state) => state.auth.userData?.username || 'Guest');
//   const dispatch = useDispatch();

//   // const notificationSound = new Howl({
//   //   src: ['/notification.mp3'], // Add your sound file in public or assets folder
//   //   volume: 0.5,
//   // });

//   const handleLogout = () => {
//     dispatch(authLogout());
//     setShowDropdown(false);
//   };

//   const toggleDropdown = () => {
//     setShowDropdown(prev => !prev);
//     setShowNotifications(false);
//   };

//   const toggleNotifications = () => {
//     setShowNotifications(prev => !prev);
//     setShowDropdown(false);
//   };

//   const markAsRead = async (id) => {
//     try {
//       await axios.post(`/api/notifications/${id}/read`);
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
//       );
//     } catch (err) {
//       console.error('Failed to mark as read:', err);
//     }
//   };

//   const fetchNotifications = async () => {
//     try {
//       const { data } = await axios.get('/api/notifications');
//       setNotifications(data);

//       const unread = data.filter(n => !n.isRead).length;
//       setUnreadCount(unread);

//       // if (unread > 0) notificationSound.play();
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//     }
//   };

//   // Auto-fetch notifications on mount and every 30s
//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // Auto-close on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target) &&
//         !bellRef.current.contains(e.target)
//       ) {
//         setShowNotifications(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);


//   return (
//     <header
//       className={`flex items-center justify-between bg-white shadow-sm p-4 fixed top-0 transition-all duration-300 z-20 h-14 rounded-l-sm ${
//         isOpen ? 'left-64' : 'left-16'
//       } right-0 ml-0.5`}
//     >
//       {/* Search */}
//       <div className="flex items-center w-full md:w-1/3 pl-1 md:pl-0">
//         <input
//           type="text"
//           placeholder="Search..."
//           className="w-full max-w-[200px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Right Icons */}
//       <div className="flex items-center space-x-4 relative">
//         {/* Notifications */}
//         <div className="relative" ref={bellRef}>
//           <span className="text-xl cursor-pointer" onClick={toggleNotifications}>
//             🔔
//           </span>
//           {unreadCount > 0 && (
//             <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
//               {unreadCount}
//             </span>
//           )}

//           {showNotifications && (
//             <div
//               ref={dropdownRef}
//               className="absolute right-0 top-10 w-64 bg-white shadow-lg rounded-lg p-2 z-30 max-h-60 overflow-auto"
//             >
//               <h4 className="text-sm font-semibold px-4 py-2 border-b">Notifications</h4>
//               {notifications.length > 0 ? (
//                 notifications.map((note) => (
//                   <div
//                     key={note.id}
//                     onClick={() => markAsRead(note.id)}
//                     className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
//                       !note.isRead ? 'font-semibold' : 'text-gray-600'
//                     }`}
//                   >
//                     {note.message}
//                   </div>
//                 ))
//               ) : (
//                 <div className="px-4 py-2 text-gray-500">No notifications</div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Profile Dropdown */}
//         <div className="flex items-center space-x-2 relative pr-2 pl-2">
//           <span
//             className="font-medium sm:block"
//             onPointerOver={(e) => {
//               e.currentTarget.style.textDecoration = 'underline';
//               e.currentTarget.style.cursor = 'pointer';
//             }}
//             onPointerOut={(e) => {
//               e.currentTarget.style.textDecoration = 'none';
//             }}
//             onClick={toggleDropdown}
//           >
//             {authData}
//           </span>

//           {showDropdown && (
//             <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg p-2 z-30">
//               <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
//                 Profile
//               </Link>
//               <Link to="/dashboard/settings" className="block px-4 py-2 hover:bg-gray-100">
//                 Settings
//               </Link>
//               <Link to="/" className="block px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>
//                 Logout
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;



import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import useLogout from '../../services/logout';
import { logout as authLogout } from '../../store/slices/authSlice';
// import { Howl } from 'howler'; // For sound effect
// import axios from 'axios';

const Header = ({ isOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  // ✅ Dummy notifications with isRead field
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your appointment is confirmed.', isRead: false },
    { id: 2, message: 'New message from Dr. Smith.', isRead: false },
    { id: 3, message: 'Your report is available for download.', isRead: false },
  ]);

  const [unreadCount, setUnreadCount] = useState(3); // Initial unread count
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const authData = useSelector((state) => state.auth.userData?.username);
  // const dispatch = useDispatch();

  const logout = useLogout();
  const handleLogout = async () => {
    await logout();
    setShowDropdown?.(false);
    setShowDropdown(false);
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowDropdown(false);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => prev - 1);
  };

  // Auto-close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !bellRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`flex items-center justify-between bg-white shadow-sm p-4 fixed top-0 transition-all duration-300 z-20 h-14 rounded-l-sm ${
        isOpen ? 'left-64' : 'left-16'
      } right-0 ml-0.5`}
    >
      {/* Search */}
      <div className="flex items-center w-full md:w-1/3 pl-1 md:pl-0">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-[200px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right Icons */}
      <div className="flex items-center space-x-4 relative">
        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <span className="text-xl cursor-pointer" onClick={toggleNotifications}>
            🔔
          </span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}

          {showNotifications && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-10 w-64 bg-white shadow-lg rounded-lg p-2 z-30 max-h-60 overflow-auto"
            >
              <h4 className="text-sm font-semibold px-4 py-2 border-b">Notifications</h4>
              {notifications.length > 0 ? (
                notifications.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => markAsRead(note.id)}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      !note.isRead ? 'font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {note.message}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No notifications</div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
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
              <Link to="/dashboard/settings" className="block px-4 py-2 hover:bg-gray-100">
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
