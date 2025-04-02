import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo">TimeCapsule Connect</div>
      <nav>
        <ul>
          <li><a href="#hero">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#login">Login</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
