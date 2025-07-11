import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useBooking } from '../context/BookingContext';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const ExtraStopModal = ({ isOpen, onClose, onAddStop }) => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [placeId, setPlaceId] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selecting, setSelecting] = useState(false);
  const [addressWithPostalCode, setAddressWithPostalCode] = useState('');
  const [error, setError] = useState('');
  const { extraStops, setExtraStops } = useBooking();
  const [doorFlatNo, setDoorFlatNo] = useState(''); // New state for door/flat number

  // New state for property type, floor, and lift availability
  const [propertyType, setPropertyType] = useState('Studio');
  const [floor, setFloor] = useState('Ground floor');
  const [liftAvailable, setLiftAvailable] = useState(false);

    const floorToNumber = (floor) => {
    const map = {
      "Ground floor": 0,
      "1st floor": 1,
      "2nd floor": 2,
      "3rd floor": 3,
      "4th floor": 4,
      "5th floor +": 5
    };
    return typeof floor === 'string' ? map[floor] ?? 0 : floor;
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAddress('');
      setSuggestions([]);
      setPlaceId('');
      setError('');
      setPropertyType('Studio');
      setFloor('Ground floor');
      setLiftAvailable(false);
      setDoorFlatNo(''); // Reset door/flat number
    }
  }, [isOpen]);

  // ... (keep all your existing useEffect hooks and other functions the same)
 // Autocomplete logic
  useEffect(() => {
    if (address.trim() === '' || selecting) {
      setSuggestions([]);
      return;
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      axios.post(`${baseUrl}/autocomplete`, { place: address })
        .then(res => {
          setSuggestions(res.data.predictions || []);
          setFocusedIndex(-1);
        })
        .catch(() => setSuggestions([]));
    }, 500);

    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [address]);

  // Get postal code when place_id is set
  useEffect(() => {
    if (!placeId) return;
    
    const getPostalCode = async () => {
      try {
        const response = await axios.get(`${baseUrl}/postalcode/${placeId}`);
        const formattedAddress = formatAddressWithPostcode(address, response.data.long_name);
        
        setSelecting(true);
        setAddress(formattedAddress);
        setAddressWithPostalCode(formattedAddress);
        setTimeout(() => setSelecting(false), 100);
      } catch (error) {
        console.error('Error fetching postal code:', error);
      }
    };

    getPostalCode();
  }, [placeId]);

  const formatAddressWithPostcode = (address, postcode) => {
    const ukPostcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i;
    const containsUK = (str) => str.trim().endsWith("UK") || str.trim().endsWith("UK,");
    
    let cleanAddress = address;
    if (containsUK(cleanAddress)) {
      cleanAddress = cleanAddress.replace(/,?\s*UK,?$/, '');
    }
    
    if (!ukPostcodeRegex.test(cleanAddress)) {
      return `${cleanAddress} ${postcode}, UK`;
    } else {
      return containsUK(cleanAddress) ? cleanAddress : `${cleanAddress}, UK`;
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSelecting(true);
    setAddress(suggestion.description);
    setPlaceId(suggestion.place_id);
    setSuggestions([]);
    setFocusedIndex(-1);
    setError('');
    setTimeout(() => setSelecting(false), 100);
  };

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const index = focusedIndex >= 0 ? focusedIndex : 0;
      if (suggestions[index]) {
        handleSuggestionSelect(suggestions[index]);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Address is required');
      return;
    }

    if (!placeId) {
      setError('Please select a valid address from suggestions');
      return;
    }

    const newStop = {
      liftAvailable: liftAvailable,  // Renamed from liftAvailable to lift
      floor: floorToNumber(floor),
      address: addressWithPostalCode || address,
      propertyType,
      doorFlatNo: doorFlatNo || ''  // Renamed from doorFlatNo to doorNumber, with fallback to empty string
    };

    setExtraStops([...extraStops, newStop]);
    console.log(extraStops);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>
      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-2 pb-8 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-bold flex items-center gap-2 text-black">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Extra Stop
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">Add an additional pickup or delivery location</p>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Door/Flat Number Input */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Door/Flat No
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={doorFlatNo}
                  onChange={e => setDoorFlatNo(e.target.value)}
                  className="w-full px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm bg-white/70 transition-all duration-200 shadow-sm"
                  placeholder="Enter door/flat number"
                />
              </div>
            </div>
            {/* Address Input */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={e => { setAddress(e.target.value); setSelecting(false); }}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm bg-white/70 transition-all duration-200 shadow-sm"
                  placeholder="Enter address"
                />
                {suggestions.length > 0 && !selecting && (
                  <ul className="absolute z-30 bg-white border-2 border-emerald-200 mt-1 rounded-xl w-full shadow-2xl max-h-40 overflow-y-auto animate-fade-in text-xs">
                    {suggestions.map((s, idx) => (
                      <li
                        key={idx}
                        className={`px-2 py-1 cursor-pointer flex items-center gap-1 transition-colors rounded-lg ${idx === focusedIndex ? 'bg-emerald-100 border-l-4 border-emerald-500' : 'hover:bg-emerald-50'}`}
                        onClick={() => handleSuggestionSelect(s)}
                      >
                        <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>{s.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* Property Type, Floor, Lift */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Property</label>
                <select
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                  className="w-full px-2 py-1 text-xs border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white/70"
                >
                  <option>Studio</option>
                  <option>Flat</option>
                  <option>House</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Floor</label>
                <select
                  value={floor}
                  onChange={e => setFloor(e.target.value)}
                  className="w-full px-2 py-1 text-xs border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white/70"
                >
                  <option>Ground floor</option>
                  <option>1st floor</option>
                  <option>2nd floor</option>
                  <option>3rd floor</option>
                  <option>4th floor</option>
                  <option>5th floor +</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-1 cursor-pointer bg-gray-50 px-2 py-1 rounded-lg hover:bg-emerald-50 w-full justify-center">
                  <input
                    type="checkbox"
                    checked={liftAvailable}
                    onChange={e => setLiftAvailable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-gray-700">Lift</span>
                </label>
              </div>
            </div>
            {error && <p className="text-rose-600 text-xs flex items-center gap-1 mt-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>}
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 border-2 border-rose-500 text-rose-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium text-xs shadow"
              >
                Add Stop
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExtraStopModal;