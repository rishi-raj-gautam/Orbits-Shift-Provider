import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-12 px-4">
    <div className="max-w-6xl mx-auto text-center">
      <div className="text-2xl font-bold mb-4 text-gray-900">Orbits Shift</div>
      <p className="text-gray-500 mb-8">Moving made simple, every time.</p>
      <div className="flex justify-center space-x-8 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <Link to="/furniture-loc" className="hover:text-black transition-colors">Furniture</Link>
        <Link to="/piano-loc" className="hover:text-black transition-colors">Piano</Link>
        <Link to="/other-removals" className="hover:text-black transition-colors">Other</Link>
        <Link to="/contact" className="hover:text-black transition-colors">Contact</Link>
      </div>
      <div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Orbits Shift. All rights reserved.</div>
    </div>
  </footer>
);

export default Footer; 