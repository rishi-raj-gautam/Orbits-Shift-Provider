import React from 'react';
import { useBooking } from '../context/BookingContext';

const Header = ({ title }) => {
  // const { quoteRef } = useBooking(); // Not used in UI
  return (
    <div className="w-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-black">{title}</h1>
        </div>
        {/* Optionally add quoteRef or other info here if needed */}
      </div>
    </div>
  );
};

export default Header;