import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import axios from "axios";
import ExtraStopModal from '../components/ExtraStopModal';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const PianoLocationForm = () => {
  const navigate = useNavigate();
  const {
    pickup,
    setPickup,
    delivery,
    setDelivery,
    items,
    setItems,
    addItem,
    updateItemQuantity,
    removeItem,
    pickupAddressWithPostalCode,
    setpickupAddressWithPostalCode,
    dropAddressWithPostalCode,
    setdropAddressWithPostalCode,
    extraStops,
    setExtraStops,
    service, setService
  } = useBooking();

  // State for address inputs and autocomplete
  const [pickupQuery, setPickupQuery] = useState(pickup.location || '');
  const [deliveryQuery, setDeliveryQuery] = useState(delivery.location || '');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [deliverySuggestions, setDeliverySuggestions] = useState([]);
  const [pickupPlaceId, setPickupPlaceId] = useState('');
  const [deliveryPlaceId, setDeliveryPlaceId] = useState('');
  const [pickupTypingTimeout, setPickupTypingTimeout] = useState(null);
  const [deliveryTypingTimeout, setDeliveryTypingTimeout] = useState(null);
  const [focusedPickupIndex, setFocusedPickupIndex] = useState(-1);
  const [focusedDeliveryIndex, setFocusedDeliveryIndex] = useState(-1);
  const [pickupError, setPickupError] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [pickupSelecting, setPickupSelecting] = useState(false);
  const [deliverySelecting, setDeliverySelecting] = useState(false);

  // State for selected piano type
  const [selectedPianoType, setSelectedPianoType] = useState('');

  // For extra stop modal
  const [isExtraStopModalOpen, setIsExtraStopModalOpen] = useState(false);

  // Constants
  const floorOptions = [
    "Ground floor", "1st floor", "2nd floor", "3rd floor", "4th floor", "5th floor +"
  ];

  const pianoTypes = [
    "Upright Piano", "Baby Grand Piano", "Grand Piano",
    "Digital Piano", "Electric Piano", "Console Piano"
  ];

  // Check if piano is already in items and set initial state
  useEffect(() => {
    const existingPiano = items.find(item =>
      pianoTypes.includes(item.name)
    );
    if (existingPiano) {
      setSelectedPianoType(existingPiano.name);
    }
  }, [items]);

  // Handle piano type selection
  const handlePianoTypeChange = (pianoType) => {
    // Remove any existing piano from items
    // setItems([]);

    // Add new piano type to items
    if (pianoType) {
      setItems([{ name: pianoType, quantity: 1 }]);
      // addItem(pianoType);
      setSelectedPianoType(pianoType);
    } else {
      setItems([]);
      setSelectedPianoType('');
    }
  };

  // Utility functions
  const containsUKPostalCode = (str) => {
    const ukPostcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i;
    return ukPostcodeRegex.test(str);
  };

  const containsUK = (str) => {
    return str.trim().endsWith("UK") || str.trim().endsWith("UK,");
  };

  const formatAddressWithPostcode = (address, postcode) => {
    let cleanAddress = address;
    if (containsUK(cleanAddress)) {
      cleanAddress = cleanAddress.replace(/,?\s*UK,?$/, '');
    }

    if (!containsUKPostalCode(cleanAddress)) {
      return `${cleanAddress} ${postcode}, UK`;
    } else {
      return containsUK(cleanAddress) ? cleanAddress : `${cleanAddress}, UK`;
    }
  };

   useEffect(()=>{
    setService("Piano Removal");
    console.log(service);

  },[setService])

  // Validation functions
  const validatePickupAddress = () => {
    if (!pickupQuery.trim()) {
      setPickupError('Please enter your pickup location');
      return false;
    }
    if (!pickupPlaceId) {
      setPickupError('Please select a valid pickup location from suggestions');
      return false;
    }
    setPickupError('');
    return true;
  };

  const validateDeliveryAddress = () => {
    if (!deliveryQuery.trim()) {
      setDeliveryError('Please enter your delivery location');
      return false;
    }
    if (!deliveryPlaceId) {
      setDeliveryError('Please select a valid delivery location from suggestions');
      return false;
    }
    setDeliveryError('');
    return true;
  };

  // Autocomplete effects
  useEffect(() => {
    if (pickupQuery.trim() === '' || pickupSelecting) {
      setPickupSuggestions([]);
      return;
    }

    if (pickupTypingTimeout) clearTimeout(pickupTypingTimeout);

    const timeout = setTimeout(() => {
      axios.post(`${baseUrl}/autocomplete`, { place: pickupQuery })
        .then(res => {
          setPickupSuggestions(res.data.predictions || []);
          setFocusedPickupIndex(-1);
        })
        .catch(() => setPickupSuggestions([]));
    }, 500);

    setPickupTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [pickupQuery]);

  useEffect(() => {
    if (deliveryQuery.trim() === '' || deliverySelecting) {
      setDeliverySuggestions([]);
      return;
    }

    if (deliveryTypingTimeout) clearTimeout(deliveryTypingTimeout);

    const timeout = setTimeout(() => {
      axios.post(`${baseUrl}/autocomplete`, { place: deliveryQuery })
        .then(res => {
          setDeliverySuggestions(res.data.predictions || []);
          setFocusedDeliveryIndex(-1);
        })
        .catch(() => setDeliverySuggestions([]));
    }, 500);

    setDeliveryTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [deliveryQuery]);

  // Postal code effects
  useEffect(() => {
    if (!pickupPlaceId) return;

    getPostalCode(pickupPlaceId).then((res) => {
      setPickup(prev => {
        const formattedAddress = formatAddressWithPostcode(prev.location, res.data.long_name);
        setPickupSelecting(true);
        setPickupQuery(formattedAddress);
        setTimeout(() => setPickupSelecting(false), 100);
        setpickupAddressWithPostalCode(formattedAddress);
        return { ...prev, postcode: res.data.long_name, location: formattedAddress };
      });
    });
  }, [pickupPlaceId]);

  useEffect(() => {
    if (!deliveryPlaceId) return;

    getPostalCode(deliveryPlaceId).then((res) => {
      setDelivery(prev => {
        const formattedAddress = formatAddressWithPostcode(prev.location, res.data.long_name);
        setDeliverySelecting(true);
        setDeliveryQuery(formattedAddress);
        setTimeout(() => setDeliverySelecting(false), 100);
        setdropAddressWithPostalCode(formattedAddress);
        return { ...prev, postcode: res.data.long_name, location: formattedAddress };
      });
    });
  }, [deliveryPlaceId]);

  // Helper functions
  async function getPostalCode(place_id) {
    const response = await axios.get(`${baseUrl}/postalcode/${place_id}`);
    return response;
  }

  const handlePickupSuggestionSelect = (suggestion) => {
    setPickupSelecting(true);
    setPickupQuery(suggestion.description);
    setPickup({ ...pickup, location: suggestion.description });
    setPickupPlaceId(suggestion.place_id);
    setPickupSuggestions([]);
    setFocusedPickupIndex(-1);
    setPickupError('');
    setTimeout(() => setPickupSelecting(false), 100);
  };

  const handleDeliverySuggestionSelect = (suggestion) => {
    setDeliverySelecting(true);
    setDeliveryQuery(suggestion.description);
    setDelivery({ ...delivery, location: suggestion.description });
    setDeliveryPlaceId(suggestion.place_id);
    setDeliverySuggestions([]);
    setFocusedDeliveryIndex(-1);
    setDeliveryError('');
    setTimeout(() => setDeliverySelecting(false), 100);
  };

  const handlePickupKeyDown = (e) => {
    if (!pickupSuggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedPickupIndex(prev => (prev < pickupSuggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedPickupIndex(prev => (prev > 0 ? prev - 1 : pickupSuggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        const index = focusedPickupIndex >= 0 ? focusedPickupIndex : 0;
        if (pickupSuggestions[index]) handlePickupSuggestionSelect(pickupSuggestions[index]);
        break;
      case 'Escape':
        setPickupSuggestions([]);
        break;
      default:
        break;
    }
  };

  const handleDeliveryKeyDown = (e) => {
    if (!deliverySuggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedDeliveryIndex(prev => (prev < deliverySuggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedDeliveryIndex(prev => (prev > 0 ? prev - 1 : deliverySuggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        const index = focusedDeliveryIndex >= 0 ? focusedDeliveryIndex : 0;
        if (deliverySuggestions[index]) handleDeliverySuggestionSelect(deliverySuggestions[index]);
        break;
      case 'Escape':
        setDeliverySuggestions([]);
        break;
      default:
        break;
    }
  };

  const handlePickupInputChange = (e) => {
    setPickupQuery(e.target.value);
    setPickupSelecting(false);
    if (e.target.value.trim() === '') {
      setPickupError('Please enter your pickup location');
    } else {
      setPickupError('');
    }
  };

  const handleDeliveryInputChange = (e) => {
    setDeliveryQuery(e.target.value);
    setDeliverySelecting(false);
    if (e.target.value.trim() === '') {
      setDeliveryError('Please enter your delivery location');
    } else {
      setDeliveryError('');
    }
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const isPickupValid = validatePickupAddress();
    const isDeliveryValid = validateDeliveryAddress();

    if (!isPickupValid || !isDeliveryValid) {
      return;
    }

    if (!selectedPianoType) {
      alert('Please select your piano type');
      return;
    }

    navigate('/date');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto mt-24 mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="absolute left-6 top-6 flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            {/* Header */}
            <div className="text-center mb-10 mt-2">
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Piano Removal Details</h2>
              <p className="text-gray-500 text-lg font-light">Tell us about your piano and locations</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Piano Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Piano Type</label>
                <select
                  value={selectedPianoType}
                  onChange={(e) => handlePianoTypeChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 bg-white text-base"
                  required
                >
                  <option value="" disabled>Select Your Piano Type</option>
                  {pianoTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {/* Locations Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Pickup Section */}
                <div className="bg-white rounded-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Pickup Location</h3>
                  </div>
                  {/* Pickup Address */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pickupQuery}
                        onChange={handlePickupInputChange}
                        onKeyDown={handlePickupKeyDown}
                        onBlur={validatePickupAddress}
                        className={`w-full px-4 py-3 border-2 ${pickupError ? 'border-rose-400' : 'border-gray-200'} rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 bg-white text-base`}
                        placeholder="Enter pickup address"
                      />
                      {pickupSuggestions.length > 0 && !pickupSelecting && (
                        <ul className="absolute z-20 bg-white border-2 border-emerald-200 mt-1 rounded-xl w-full shadow-lg max-h-60 overflow-y-auto text-xs">
                          {pickupSuggestions.map((s, idx) => (
                            <li
                              key={idx}
                              className={`px-3 py-2 cursor-pointer transition-colors rounded-lg ${idx === focusedPickupIndex ? 'bg-emerald-100 border-l-4 border-emerald-500' : 'hover:bg-emerald-50'}`}
                              onClick={() => handlePickupSuggestionSelect(s)}
                            >
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span className="text-xs">{s.description}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {pickupError && <p className="text-rose-600 text-xs flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {pickupError}
                    </p>}
                  </div>
                  {/* Pickup Floor and Lift */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
                      <select
                        value={pickup.floor}
                        onChange={(e) => setPickup({ ...pickup, floor: e.target.value })}
                        className="w-full px-2 py-2 text-xs border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white"
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
                      <label className="flex items-center gap-1 cursor-pointer bg-white px-2 py-2 rounded-lg hover:bg-gray-50 w-full justify-center">
                        <input
                          type="checkbox"
                          id="pickupLift"
                          checked={pickup.liftAvailable}
                          onChange={(e) => setPickup({ ...pickup, liftAvailable: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-xs font-medium text-gray-700">Lift Available</span>
                      </label>
                    </div>
                  </div>
                </div>
                {/* Delivery Section */}
                <div className="bg-white rounded-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Delivery Location</h3>
                  </div>
                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={deliveryQuery}
                        onChange={handleDeliveryInputChange}
                        onKeyDown={handleDeliveryKeyDown}
                        onBlur={validateDeliveryAddress}
                        className={`w-full px-4 py-3 border-2 ${deliveryError ? 'border-rose-400' : 'border-gray-200'} rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-200 bg-white text-base`}
                        placeholder="Enter delivery address"
                      />
                      {deliverySuggestions.length > 0 && !deliverySelecting && (
                        <ul className="absolute z-20 bg-white border-2 border-rose-200 mt-1 rounded-xl w-full shadow-lg max-h-60 overflow-y-auto text-xs">
                          {deliverySuggestions.map((s, idx) => (
                            <li
                              key={idx}
                              className={`px-3 py-2 cursor-pointer transition-colors rounded-lg ${idx === focusedDeliveryIndex ? 'bg-rose-100 border-l-4 border-rose-500' : 'hover:bg-rose-50'}`}
                              onClick={() => handleDeliverySuggestionSelect(s)}
                            >
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-rose-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span className="text-xs">{s.description}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {deliveryError && <p className="text-rose-600 text-xs flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {deliveryError}
                    </p>}
                  </div>
                  {/* Delivery Floor and Lift */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
                      <select
                        value={delivery.floor}
                        onChange={(e) => setDelivery({ ...delivery, floor: e.target.value })}
                        className="w-full px-2 py-2 text-xs border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-white"
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
                      <label className="flex items-center gap-1 cursor-pointer bg-white px-2 py-2 rounded-lg hover:bg-gray-50 w-full justify-center">
                        <input
                          type="checkbox"
                          id="deliveryLift"
                          checked={delivery.liftAvailable}
                          onChange={(e) => setDelivery({ ...delivery, liftAvailable: e.target.checked })}
                          className="w-4 h-4 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500"
                        />
                        <span className="text-xs font-medium text-gray-700">Lift Available</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200 mt-8">
                <div></div>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg text-base"
                >
                  <span>Continue</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoLocationForm;