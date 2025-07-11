import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useBooking } from '../context/BookingContext';
import RouteMap from './RouteMap';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const OrderSummary = () => {
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const {
    quoteRef,
    items,
    pickup,
    delivery,
    selectedDate,
    journey,
    setJourney,
    totalPrice,
    setTotalPrice,
    piano,
    van,
    motorBike,
    extraStops,
    removeExtraStop,
    itemsToAssemble,
    itemsToDismantle,
    additionalServices,
    customerDetails,
    service
  } = useBooking();

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

  const kmToMiles = (kmString) => {
    const kmValue = parseFloat(kmString);
    const miles = kmValue * 0.621371;
    return `${miles.toFixed(2)} miles`;
  };

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const payload = {
          pickupLocation: {
            location: pickup.location,
            floor: floorToNumber(pickup.floor),
            lift: pickup.liftAvailable
          },
          dropLocation: {
            location: delivery.location,
            floor: floorToNumber(delivery.floor),
            lift: delivery.liftAvailable
          },
          vanType: van.type,
          worker: selectedDate.numberOfMovers,
          itemsToDismantle:itemsToDismantle,
          itemsToAssemble:itemsToAssemble,
          stoppage:extraStops.map(item => ({ address: item.address }))
        };

        const res = await axios.post(`${baseUrl}/price`, payload);
        setTotalPrice(res.data.price);
      } catch (err) {
        console.error("Price fetch error:", err);
      }
    };

    fetchPrice();
  }, [pickup, delivery, van, selectedDate, itemsToDismantle,itemsToAssemble, extraStops]);

  useEffect(() => {
    const fetchDistance = async () => {
      try {
        const res = await axios.post(`${baseUrl}/distance`, {
          origin: pickup.location,
          destination: delivery.location
        });

        const element = res.data.rows[0].elements[0];
        const distanceText = element.distance.text;
        const distanceInMiles = kmToMiles(distanceText);
        const durationText = element.duration.text;

        setJourney(prev => ({
          ...prev,
          distance: distanceInMiles,
          duration: durationText
        }));
      } catch (err) {
        console.error("Distance fetch error:", err);
      }
    };

    fetchDistance();
  }, [pickup.location, delivery.location]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-black flex items-center">
          <svg className="w-4 h-4 mr-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Order Summary
        </h2>
        <p className="text-gray-500 text-xs mt-0.5">Review your booking details</p>
      </div>
      {/* Route Map */}
      <div className="p-2 bg-white">
        <RouteMap />
      </div>
      {/* Items Section */}
      <div className="space-y-2 p-2 bg-white rounded-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-1">
          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-gray-700 font-medium text-xs">Items to Move</span>
        </div>
        {items.length === 0 && <div className="text-gray-400 text-xs">No items selected</div>}
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-0.5">
            <div className="text-gray-800 text-xs">{item.name}</div>
            <div className="text-gray-600 text-xs font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">{item.quantity}</div>
          </div>
        ))}
        {motorBike.type && (
          <div className="flex justify-between items-center py-0.5">
            <div className="text-gray-800 text-xs">Motor Bike ({motorBike.type})</div>
            <div className="text-black text-xs font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">✓</div>
          </div>
        )}
        {piano.type !== '' && (
          <div className="flex justify-between items-center py-0.5 border-t border-gray-200 pt-1">
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="text-gray-700 text-xs font-medium">Piano</span>
            </div>
            <span className="text-black text-xs font-medium">{piano.type}</span>
          </div>
        )}
      </div>
      {/* Items to Dismantle/Assemble */}
      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
        <span className="text-gray-700 text-xs font-medium">Dismantle</span>
        <span className="text-gray-800 text-xs font-semibold">{itemsToDismantle}</span>
        <span className="text-gray-700 text-xs font-medium">Assemble</span>
        <span className="text-gray-800 text-xs font-semibold">{itemsToAssemble}</span>
      </div>

      {/* Additional Services */}
      <div className="p-2 bg-white rounded-lg border border-gray-100">
        <div className="text-gray-700 text-xs font-medium mb-1">Additional Services</div>
        <div className="flex flex-wrap gap-2">
          {additionalServices.basicCompensation && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">Basic Compensation</span>}
          {additionalServices.comprehensiveInsurance && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">Comprehensive Insurance</span>}
          {additionalServices.dismantling.length > 0 && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">Dismantling: {additionalServices.dismantling.join(', ')}</span>}
          {additionalServices.reassembly.length > 0 && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">Reassembly: {additionalServices.reassembly.join(', ')}</span>}
          {additionalServices.specialRequirements && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{additionalServices.specialRequirements}</span>}
        </div>
      </div>

      {/* Van Type, Movers, Date, Journey */}
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-gray-700 text-xs font-medium">Van Type</span>
          </div>
          <span className="text-gray-800 font-semibold text-xs">{van.type}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0" />
            </svg>
            <span className="text-green-700 text-xs font-medium">Movers</span>
          </div>
          <span className="text-green-800 text-xs font-semibold">{selectedDate.numberOfMovers} Person</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7" />
            </svg>
            <span className="text-purple-700 text-xs font-medium">Date</span>
          </div>
          <span className="text-purple-800 text-xs font-semibold">{selectedDate.date}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17a4 4 0 01-8 0m8 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2z" />
            </svg>
            <span className="text-emerald-700 text-xs font-medium">Journey</span>
          </div>
          <span className="text-emerald-800 text-xs font-semibold">{journey.distance} / {journey.duration}</span>
        </div>
      </div>

      {/* Pickup/Delivery Details */}
      <div className="space-y-2">
        <div className="p-2 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 text-xs font-semibold">Pickup Location</span>
          </div>
          <div className="space-y-0.5 ml-4">
            <p className="text-gray-700 text-xs font-medium">{pickup.location}</p>
            <p className="text-green-600 text-xs">Door/Flat: {pickup.flatNo}</p>
            <p className="text-gray-600 text-xs">{pickup.addressLine1} {pickup.addressLine2}</p>
            <p className="text-gray-600 text-xs">{pickup.city} {pickup.postcode}</p>
            <p className="text-gray-600 text-xs">Contact: {pickup.contactName} {pickup.contactPhone}</p>
            <div className="flex items-center space-x-1">
              <svg className="w-2 h-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-gray-600 text-xs">Lift: {pickup.liftAvailable ? 'Available' : 'Not Available'}</span>
            </div>
          </div>
        </div>

        <div className="p-2 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700 text-xs font-semibold">Delivery Location</span>
          </div>
          <div className="space-y-0.5 ml-4">
            <p className="text-gray-700 text-xs font-medium">{delivery.location}</p>
            <p className="text-red-600 text-xs">Door/Flat: {delivery.flatNo}</p>
            <p className="text-gray-600 text-xs">{delivery.addressLine1} {delivery.addressLine2}</p>
            <p className="text-gray-600 text-xs">{delivery.city} {delivery.postcode}</p>
            <p className="text-gray-600 text-xs">Contact: {delivery.contactName} {delivery.contactPhone}</p>
            <div className="flex items-center space-x-1">
              <svg className="w-2 h-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-gray-600 text-xs">Lift: {delivery.liftAvailable ? 'Available' : 'Not Available'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Stops */}
      {extraStops.length > 0 && (
        <div className="p-2 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-blue-700 text-xs font-semibold">Extra Stops ({extraStops.length})</span>
          </div>
          <div className="space-y-1">
            {extraStops.map((stop, index) => (
              <div key={index} className="group bg-white/60 backdrop-blur-sm rounded-lg p-1.5 border border-blue-200/50 hover:bg-blue-50/80 transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <p className="text-blue-700 text-xs font-semibold truncate">
                        Stop {index + 1}
                      </p>
                    </div>
                    <p className="text-gray-700 text-xs truncate ml-3.5">{stop.address}</p>
                    <p className="text-blue-600 text-xs ml-3.5">Door/Flat: {stop.doorFlatNo}</p>
                    <div className="mt-0.5 ml-3.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded-full">{stop.propertyType}</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded-full">{stop.floor}</span>
                      <span className={`px-1.5 py-0.5 rounded-full ${stop.liftAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{stop.liftAvailable ? 'Lift ✓' : 'No Lift'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeExtraStop(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                    aria-label="Remove stop"
                    title="Remove stop"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-3 w-3" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Details */}
      <div className="p-2 bg-white rounded-lg border border-gray-100">
        <div className="text-gray-700 text-xs font-medium mb-1">Customer Details</div>
        <div className="text-xs text-gray-700">{customerDetails.name} {customerDetails.email} {customerDetails.phone}</div>
      </div>

      {/* Total Price Section */}
      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-800 font-semibold text-base">Total Price</span>
          <span className="text-xl font-bold text-gray-800">
            {totalPrice !== null ? `£${totalPrice.toFixed(2)}` : (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                <span className="text-xs text-gray-600">Calculating...</span>
              </div>
            )}
          </span>
        </div>
        <div className="bg-gray-200 text-gray-700 text-xs font-semibold py-1.5 px-2 rounded-lg inline-flex items-center shadow-lg">
          <svg className="w-3 h-3 mr-1 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          42% saving vs other companies
        </div>
      </div>

      {/* Payment Methods */}
      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center space-x-3">
        <div className="text-xs text-gray-500 mr-1">Secure payments:</div>
        <div className="flex space-x-1">
          <div className="w-8 h-5 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-white">VISA</span>
          </div>
          <div className="w-8 h-5 bg-gradient-to-r from-amber-600 to-amber-700 rounded flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-white">MC</span>
          </div>
          <div className="w-8 h-5 bg-gradient-to-r from-rose-600 to-rose-700 rounded flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-white">MTRO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;