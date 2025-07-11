import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
// Removed: import OrderSummary from '../components/OrderSummary';

const ItemsForm = (props) => {
  const navigate = useNavigate();
  const { items, addItem, updateItemQuantity, removeItem } = useBooking();
  const [newItemText, setNewItemText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/date', { state: { prepath: props.prepath } });
  };
  
  const handleAddItem = () => {
    if (newItemText.trim()) {
      addItem(newItemText);
      setNewItemText('');
    }
  };
  

return (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50 flex items-center justify-center">
    <div className="max-w-3xl w-full mx-auto px-4 py-10">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-white/30 overflow-hidden p-6 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-amber-400 transition-all duration-200 font-medium shadow-sm text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-gray-800">Moving Items</h2>
          <p className="text-gray-500 text-lg font-light">Tell us what you're moving to get accurate pricing</p>
        </div>
        {/* Add Item Section */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-800 mb-2">Add Items to Move</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Enter your item(s) here e.g. Sofa" 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full pl-3 pr-12 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm bg-white/70 transition-all duration-200 shadow-sm"
            />
            <button 
              type="button" 
              onClick={handleAddItem} 
              className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center bg-black text-white rounded-md hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <div className="text-gray-600 text-xs mt-2 font-medium">
            Or quickly add from our list of popular items below:
          </div>
        </div>
        {/* Popular Items Grid */}
        <div className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {[
              { label: 'Sofas', icon: '🛋️', value: 'Sofa' },
              { label: 'Wardrobes', icon: '🪟', value: 'Wardrobe' },
              { label: 'Boxes', icon: '📦', value: 'Box' },
              { label: 'Beds', icon: '🛏️', value: 'Bed' },
              { label: 'Tables', icon: '🪑', value: 'Table' },
              { label: 'TVs', icon: '📺', value: 'TV' },
              { label: 'Clothing', icon: '👕', value: 'Clothing' },
              { label: 'Chairs', icon: '🪑', value: 'Chair' },
              { label: 'Add Custom', icon: '➕', value: 'Custom', extra: 'col-span-2 sm:col-span-1' }
            ].map(({ label, icon, value, extra }) => (
              <button 
                key={label}
                type="button" 
                className={`flex items-center justify-center p-2 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 bg-white/70 group text-xs font-medium ${extra || ''}`}
                onClick={() => addItem(value)}
              >
                <span className="mr-1 text-base group-hover:scale-110 transition-transform">{icon}</span> 
                <span className="text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Items List */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-1">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Item List
            </h3>
            <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="font-medium">No items added yet</p>
                <p className="text-xs mt-1">Add items using the search bar or buttons above</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-white/70 hover:bg-white/80 transition-all duration-200">
                  <div className="text-gray-800 font-medium text-xs">{item.name}</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-gray-100 rounded-md overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => updateItemQuantity(item.name, Math.max(item.quantity - 1, 1))}
                        className="h-6 w-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700 font-bold text-xs"
                      >
                        −
                      </button>
                      <span className="h-6 w-8 flex items-center justify-center bg-white text-gray-800 font-medium text-xs">
                        {item.quantity}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => updateItemQuantity(item.name, item.quantity + 1)}
                        className="h-6 w-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeItem(item.name)}
                      className="ml-1 text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-0.5 rounded-full bg-rose-100 hover:bg-rose-200 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Continue Button */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-amber-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default ItemsForm;