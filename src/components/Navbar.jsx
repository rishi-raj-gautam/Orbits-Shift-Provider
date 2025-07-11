import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/home-loc', label: 'Home' },
  { to: '/furniture-loc', label: 'Furniture' },
  { to: '/piano-loc', label: 'Piano' },
  { to: '/other-removals', label: 'Other' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const location = useLocation();
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-900">Orbits Shift</Link>
        <nav className="hidden md:flex space-x-8">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-gray-600 hover:text-black transition-colors font-medium ${location.pathname === link.to ? 'underline underline-offset-4 text-black' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 