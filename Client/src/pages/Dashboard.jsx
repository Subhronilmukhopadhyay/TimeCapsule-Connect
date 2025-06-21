// src/pages/Dashboard.jsx
import { useState } from 'react';
import Sidebar from '../components/Dashboard/Sidebar.jsx';
import Header from '../components/Dashboard/Header.jsx';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header isOpen={isOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          isOpen ? 'pl-64' : 'pl-16'
        } p-4 ml-2 relative`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
