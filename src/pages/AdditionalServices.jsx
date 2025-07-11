import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import axios from 'axios';

// Helper function for consistent time format conversion
const hourToTime = (hour) => {
  // If the hour is already in HH:MM:SS format, return it as is
  if (typeof hour === 'string' && hour.includes(':')) {
    return hour;
  }

  // Handle possible NaN or undefined values
  if (hour === undefined || isNaN(hour)) {
    return '08:00:00'; // Default fallback time
  }

  // Convert number to time string (e.g., 8.5 -> "08:30:00")
  const hrs = Math.floor(hour).toString().padStart(2, '0');
  const mins = (hour % 1 === 0.5) ? '30' : '00';
  return `${hrs}:${mins}:00`;
};

const AdditionalServices = () => {
  const navigate = useNavigate();
  const {
    customerDetails,
    pickup,
    delivery,
    selectedDate,
    setSelectedDate,
    journey,
    totalPrice,
    items,
    motorBike,
    piano,
    quoteRef,
    setQuoteRef,
    van,
    extraStops,
    itemsToAssemble,
    itemsToDismantle,
    setItemsToAssemble,
    setItemsToDismantle,
    additionalServices,
    setAdditionalServices,
    quoteDetails,
  } = useBooking();

  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [collectionTime, setCollectionTime] = useState({ start: 8, end: 18 });
  const [deliveryTime, setDeliveryTime] = useState('Same day');
  const [showAssemblyOptions, setShowAssemblyOptions] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize time values from context on component mount
  useEffect(() => {
    // Time conversion from string to decimal for slider display
    const convertTimeToDecimal = (timeStr) => {
      if (typeof timeStr !== 'string' || !timeStr.includes(':')) return null;

      const parts = timeStr.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      return hours + (minutes === 30 ? 0.5 : 0);
    };

    // Check if there are time values in the context
    if (selectedDate.pickupTime && selectedDate.dropTime) {
      // Convert string times to decimal for sliders if needed
      const pickupTimeDecimal = typeof selectedDate.pickupTime === 'string' && selectedDate.pickupTime.includes(':')
        ? convertTimeToDecimal(selectedDate.pickupTime)
        : selectedDate.pickupTime;

      const dropTimeDecimal = typeof selectedDate.dropTime === 'string' && selectedDate.dropTime.includes(':')
        ? convertTimeToDecimal(selectedDate.dropTime)
        : selectedDate.dropTime;

      setCollectionTime({
        start: pickupTimeDecimal || 8,
        end: dropTimeDecimal || 18
      });
    } else {
      // Use default values and update context with proper string format
      setCollectionTime({ start: 8, end: 18 });
      setSelectedDate(prev => ({
        ...prev,
        pickupTime: hourToTime(8),
        dropTime: hourToTime(18)
      }));
    }
  }, [selectedDate.pickupTime, selectedDate.dropTime, setSelectedDate]);

  // Format the date for display
  const formatDisplayDate = (date) => {
    if (!date) return 'Select date';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      return dateObj.toLocaleDateString('en-GB', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format time in 12-hour format with 30-minute increments (e.g. 8 -> "8:00am", 8.5 -> "8:30am")
  const formatTimeWithMinutes = (time) => {
    const hour = Math.floor(time);
    const minute = time % 1 === 0.5 ? 30 : 0;
    let period = 'am';
    let displayHour = hour;

    if (hour >= 12) {
      period = 'pm';
      if (hour > 12) {
        displayHour = hour - 12;
      }
    }

    if (hour === 0) {
      displayHour = 12; // midnight
    }

    return `${displayHour}:${minute === 0 ? '00' : minute}${period}`;
  };

  const validateExtraStops = (stops) => {
    if (!Array.isArray(stops) || stops.length === 0) return [];

    return stops.map(stop => ({
      ...stop,
      // Ensure doorNumber exists and is a string
      doorNumber: stop.doorNumber || stop.doorFlatNo || '',
      // Ensure lift exists and is a boolean
      lift: typeof stop.lift === 'boolean' ? stop.lift : Boolean(stop.liftAvailable),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError(''); // Clear any previous errors
    // setIsSubmitting(true); // Start loading animation

    // try {

    //   const validatedStops = validateExtraStops(extraStops);

    //   // Create quoteData - no need to convert times again
    //   const quoteData = {
    //     username: customerDetails.name || 'NA',
    //     email: quoteDetails.email || 'NA',
    //     phoneNumber: customerDetails.phone || 'NA',
    //     price: totalPrice || 0,
    //     distance: parseInt(journey.distance) || 0,
    //     route: "default route",
    //     duration: journey.duration || "N/A",
    //     pickupDate: selectedDate.date || 'NA',
    //     pickupTime: selectedDate.pickupTime || '08:00:00', // Already in correct format
    //     pickupAddress: {
    //       postcode: pickup.postcode,
    //       addressLine1: pickup.addressLine1,
    //       addressLine2: pickup.addressLine2,
    //       city: pickup.city,
    //       country: pickup.country,
    //       contactName: pickup.contactName,
    //       contactPhone: pickup.contactPhone,
    //     },
    //     dropDate: selectedDate.date || 'NA',
    //     dropTime: selectedDate.dropTime || '18:00:00', // Already in correct format
    //     dropAddress: {
    //       postcode: delivery.postcode,
    //       addressLine1: delivery.addressLine1,
    //       addressLine2: delivery.addressLine2,
    //       city: delivery.city,
    //       country: delivery.country,
    //       contactName: delivery.contactName,
    //       contactPhone: delivery.contactPhone,
    //     },
    //     vanType: van.type || "N/A",
    //     worker: selectedDate.numberOfMovers || 1,
    //     itemsToDismantle: itemsToDismantle || 0,
    //     itemsToAssemble: itemsToAssemble || 0,
    //     stoppage: validatedStops,
    //     pickupLocation: {
    //       location: pickup.location || "N/A",
    //       floor: typeof pickup.floor === 'string' ? parseInt(pickup.floor) : pickup.floor,
    //       lift: pickup.liftAvailable,
    //       propertyType: pickup.propertyType || "standard"
    //     },
    //     dropLocation: {
    //       location: delivery.location || "N/A",
    //       floor: typeof delivery.floor === 'string' ? parseInt(delivery.floor) : delivery.floor,
    //       lift: delivery.liftAvailable,
    //       propertyType: delivery.propertyType || "standard"
    //     },
    //     details: {
    //       items: {
    //         name: items.map(item => item.name) || [],
    //         quantity: items.map(item => item.quantity) || [],
    //       },
    //       isBusinessCustomer: customerDetails.isBusinessCustomer,
    //       motorBike: motorBike.type,
    //       piano: piano.type,
    //       specialRequirements: additionalServices.specialRequirements
    //     },
    //   };

    //   console.log("Quotation Data being sent:", JSON.stringify(quoteData, null, 2));

    //   // 🔁 First: POST to /quote and get quotationRef
    //   const quoteResponse = await axios.post('https://api.reliancemove.com/quote', quoteData);
    //   const quotationRef = quoteResponse.data?.newQuote?.quotationRef;
    //   console.log("quotation reference: ", quotationRef);

    //   if (!quotationRef) {
    //     throw new Error("Quotation reference not received from server");
    //   }

    //   setQuoteRef(quotationRef);
      navigate('/booking-details');
    // } catch (error) {
    //   console.error('Error submitting booking:', error);

    //   // Set appropriate error message based on the error
    //   if (error.response) {
    //     // The request was made and the server responded with a status code
    //     // that falls out of the range of 2xx
    //     setError(`Server error: ${error.response.data?.message || error.response.statusText || 'Unknown server error'}`);
    //     console.error('Error response data:', error.response.data);
    //   } else if (error.request) {
    //     // The request was made but no response was received
    //     setError('Network error: No response received from server. Please check your internet connection and try again.');
    //   } else {
    //     // Something happened in setting up the request that triggered an Error
    //     setError(`Error: ${error.message || 'An unknown error occurred'}`);
    //   }
    // } finally {
    //   setIsSubmitting(false); // Stop loading animation regardless of outcome
    // }
  };

  const handleAddServices = () => {
    console.log('Items to assemble:', itemsToAssemble);
    console.log('Items to dismantle:', itemsToDismantle);
    setShowAssemblyOptions(false);
  };

  const handleTimeSlotChange = () => {
    setShowTimeSlotModal(true);
  };

  const handleCollectionTimeChange = (e, type) => {
    const value = parseFloat(e.target.value);
    const timeString = hourToTime(value); // Convert to time string immediately

    if (type === 'start') {
      setCollectionTime(prev => ({ ...prev, start: value }));
      // Store the formatted time string in context
      setSelectedDate(prev => ({ ...prev, pickupTime: timeString }));
    } else {
      setCollectionTime(prev => ({ ...prev, end: value }));
      // Store the formatted time string in context
      setSelectedDate(prev => ({ ...prev, dropTime: timeString }));
    }
  };

  const handleResetTimeSlots = () => {
    // Reset the local state
    setCollectionTime({ start: 8, end: 18 });

    // Update the context with properly formatted time strings
    setSelectedDate(prev => ({
      ...prev,
      pickupTime: hourToTime(8),
      dropTime: hourToTime(18)
    }));
  };

  const handleConfirmTimeSlot = () => {
    setShowTimeSlotModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50 flex items-center justify-center">
      {/* <Header title="Additional Services and Special Requirements" /> */}

      <div className="w-full max-w-4xl mx-auto px-4 py-10 mt-24">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-white/30 overflow-hidden p-6 relative">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-6 top-6 flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-amber-400 transition-all duration-200 font-medium shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-gray-800">Additional Services</h2>
            <p className="text-gray-500 text-lg font-light">Select any extra services you need</p>
          </div>
          {/* Collection & Delivery Section */}
          <div className="bg-white/70 rounded-xl border border-amber-100 p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800">Collection & Delivery</h3>
              </div>
              <span className="text-xs text-gray-500 bg-amber-50 px-2 py-1 rounded-full">
                {selectedDate.date ? formatDisplayDate(selectedDate.date) : 'No date selected'}
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs text-gray-700 font-medium">Collection Time</span>
                <button type="button" onClick={handleTimeSlotChange} className="px-3 py-1 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-all duration-200 text-xs font-medium">Change Time Slot</button>
                <span className="text-xs text-gray-600 mt-1">{formatTimeWithMinutes(collectionTime.start)} - {formatTimeWithMinutes(collectionTime.end)}</span>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs text-gray-700 font-medium">Delivery</span>
                <span className="text-xs text-gray-600 mt-1">{deliveryTime}</span>
              </div>
            </div>
          </div>
          {/* Assembly/Disassembly Section */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Assembly/Disassembly</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-medium border-2 transition-all duration-200 shadow-sm ${showAssemblyOptions ? 'border-black bg-gray-100 text-black' : 'border-gray-200 bg-white/70 text-gray-700 hover:border-black hover:bg-gray-100'}`}
                onClick={() => setShowAssemblyOptions(!showAssemblyOptions)}
              >
                {showAssemblyOptions ? 'Hide Options' : 'Show Options'}
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-lg text-xs font-medium border-2 border-black text-black hover:bg-gray-100 transition-all duration-200"
                onClick={() => setShowLearnMoreModal(true)}
              >
                Learn More
              </button>
            </div>
            {showAssemblyOptions && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Items to Assemble</label>
                  <input
                    type="number"
                    min="0"
                    value={itemsToAssemble}
                    onChange={e => setItemsToAssemble(Number(e.target.value))}
                    className="w-full px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs bg-white/70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Items to Dismantle</label>
                  <input
                    type="number"
                    min="0"
                    value={itemsToDismantle}
                    onChange={e => setItemsToDismantle(Number(e.target.value))}
                    className="w-full px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs bg-white/70"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Special Requirements Section */}
          <div className="bg-white/70 rounded-xl border border-rose-100 p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-800">Special Requirements or Notes</h3>
            </div>
            <textarea
              placeholder="E.g. Parking available opposite property, sofa comes apart, slightly awkward entrance etc. The more information, the better! Please note: you will receive tracking prior to arrival"
              value={additionalServices.specialRequirements}
              onChange={(e) => setAdditionalServices({
                ...additionalServices,
                specialRequirements: e.target.value
              })}
              className="w-full p-2 border-2 border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white/70 resize-none text-xs"
            />
          </div>
          {/* Error Alert */}
          {error && (
            <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          {/* Continue Button */}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg text-sm"
            >
              Continue
            </button>
          </div>
        </form>
      </div>


      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="text-center border-b border-gray-100 p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">Choose Time Slot</h3>
              <p className="text-gray-500 text-sm">Select your preferred time</p>
            </div>
            <div className="p-6">
              <div className="mb-3 text-center">
                <div className="text-base font-medium text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  {selectedDate.date ? formatDisplayDate(selectedDate.date) : 'No date selected'}
                </div>
              </div>
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-emerald-800 mb-1">Collection</div>
                    <div className="text-emerald-700 font-semibold text-sm">
                      {formatTimeWithMinutes(collectionTime.start)} - {formatTimeWithMinutes(collectionTime.end)}
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-rose-800 mb-1">Delivery</div>
                    <div className="text-rose-700 font-semibold text-sm">
                      {deliveryTime}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium text-gray-700">Start: {formatTimeWithMinutes(collectionTime.start)}</span>
                      <span className="text-xs font-medium text-gray-700">End: {formatTimeWithMinutes(collectionTime.end)}</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start time</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="0.5"
                          value={collectionTime.start}
                          onChange={(e) => handleCollectionTimeChange(e, 'start')}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End time</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="0.5"
                          value={collectionTime.end}
                          onChange={(e) => handleCollectionTimeChange(e, 'end')}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 px-2">
                    <span className="font-medium">12am</span>
                    <span className="font-medium">12pm</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6 gap-2">
                <button
                  type="button"
                  onClick={handleResetTimeSlots}
                  className="flex items-center space-x-2 px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset to default</span>
                </button>
                <button
                  onClick={handleConfirmTimeSlot}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium text-sm"
                >
                  Confirm Time Slot
                </button>
                <button
                  onClick={() => setShowTimeSlotModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="text-center border-b border-gray-100 p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">Dismantle & Assemble</h3>
              <p className="text-gray-500 text-sm">We can take apart your large items at pickup and reassemble them at delivery</p>
            </div>
            <div className="p-6">
              {/* Service pricing */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Dismantling service</span>
                    <span className="font-semibold text-lg">£20 per item</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Assembly service</span>
                    <span className="font-semibold text-lg">£30 per item</span>
                  </div>
                </div>
              </div>
              {/* Additional info */}
              <div className="text-sm text-gray-600 mb-4 text-center">
                Our professional movers will carefully dismantle your furniture at the pickup location and reassemble it at your new home, saving you time and ensuring everything is properly set up.
              </div>
              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLearnMoreModal(false)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowLearnMoreModal(false);
                    setShowAssemblyOptions(true);
                  }}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Add to your move
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalServices;