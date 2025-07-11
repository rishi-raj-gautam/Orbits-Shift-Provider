import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const MotorBikeLocationForm = (props) => {
  const { 
    pickup, 
    setPickup, 
    delivery, 
    setDelivery, 
    motorBike, 
    setMotorBike, 
    pickupAddressWithPostalCode, 
    setpickupAddressWithPostalCode, 
    dropAddressWithPostalCode, 
    setdropAddressWithPostalCode,
    extraStops,
     setExtraStops 
  } = useBooking();

  // Address and autocomplete states
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
  
  const navigate = useNavigate();

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
    setPickupError('');
  };

  const handleDeliveryInputChange = (e) => {
    setDeliveryQuery(e.target.value);
    setDeliverySelecting(false);
    setDeliveryError('');
  };

  const handleBikeTypeChange = (e) => {
    setMotorBike({ ...motorBike, type: e.target.value });
  };

  // Extra stop functions
  const handleAddExtraStop = (stopAddress) => {
    setExtraStops([...extraStops, stopAddress]);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (!pickupQuery.trim()) {
      setPickupError('Pickup address is required');
      valid = false;
    } else {
      setPickupError('');
    }

    if (!deliveryQuery.trim()) {
      setDeliveryError('Delivery address is required');
      valid = false;
    } else {
      setDeliveryError('');
    }

    if (valid) {
      navigate('/date', { state: { prepath: props.prepath } });
    }
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
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Motorbike Removal Details</h2>
              <p className="text-gray-500 text-lg font-light">Tell us about your bike and locations</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Motor Bike Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bike Type</label>
                <select
                  value={motorBike.type || ''}
                  onChange={handleBikeTypeChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 bg-white text-base"
                >
                  <option value="">Select bike type</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Sport Bike">Sport Bike</option>
                  <option value="Cruiser">Cruiser</option>
                  <option value="Touring">Touring</option>
                  <option value="Off-Road">Off-Road</option>
                  <option value="Standard">Standard</option>
                  <option value="Adventure">Adventure</option>
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
                        className={`w-full px-4 py-3 border-2 ${pickupError ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 bg-white text-base`}
                        placeholder="Enter pickup address"
                      />
                      {pickupSuggestions.length > 0 && !pickupSelecting && (
                        <ul className="absolute z-20 bg-white border-2 border-emerald-200 mt-1 rounded-xl w-full shadow-lg max-h-60 overflow-y-auto text-xs">
                          {pickupSuggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              onClick={() => handlePickupSuggestionSelect(suggestion)}
                              className={`px-3 py-2 cursor-pointer rounded-lg ${idx === focusedPickupIndex ? 'bg-emerald-100 border-l-4 border-emerald-500' : 'hover:bg-emerald-50'}`}
                            >
                              {suggestion.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {pickupError && <p className="mt-1 text-xs text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {pickupError}
                    </p>}
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
                        className={`w-full px-4 py-3 border-2 ${deliveryError ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-200 bg-white text-base`}
                        placeholder="Enter delivery address"
                      />
                      {deliverySuggestions.length > 0 && !deliverySelecting && (
                        <ul className="absolute z-20 bg-white border-2 border-rose-200 mt-1 rounded-xl w-full shadow-lg max-h-60 overflow-y-auto text-xs">
                          {deliverySuggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              onClick={() => handleDeliverySuggestionSelect(suggestion)}
                              className={`px-3 py-2 cursor-pointer rounded-lg ${idx === focusedDeliveryIndex ? 'bg-rose-100 border-l-4 border-rose-500' : 'hover:bg-rose-50'}`}
                            >
                              {suggestion.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {deliveryError && <p className="mt-1 text-xs text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {deliveryError}
                    </p>}
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
                  <span>Next Step</span>
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

export default MotorBikeLocationForm;