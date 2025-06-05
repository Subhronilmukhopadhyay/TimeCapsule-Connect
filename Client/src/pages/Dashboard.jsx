import { useState } from 'react';
import Header from '../components/Dashboard/Header.jsx';
import Sidebar from '../components/Dashboard/Sidebar.jsx';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false); // Central sidebar state

  return (
    <div className="relative min-h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header isOpen={isOpen} />

      <main className={`pt-16 transition-all duration-300 ease-in-out ${isOpen ? 'pl-64' : 'pl-16'} p-4 ml-2 relative`}>
        <h2>Main Content</h2>
        <p>Your content goes here...</p>
      </main>
    </div>
  );
};

export default Dashboard;
