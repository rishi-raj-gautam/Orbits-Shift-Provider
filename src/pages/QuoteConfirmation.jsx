import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import RouteMap from '../components/RouteMap';

const QuoteConfirmation = () => {
  const navigate = useNavigate();
  const {
    quoteRef,
    bookingRef,
    quoteDetails,
    pickup,
    delivery,
    extraStops,
    items,
    selectedDate,
    additionalServices,
    customerDetails,
    journey,
    totalPrice,
    van,
    itemsToAssemble,
    itemsToDismantle,
    itemsList,
    quantities,
    service
  } = useBooking();


  const formatAddress = (address) => {
    const parts = [];
    if (address.flatNo) parts.push(`Flat/Unit ${address.flatNo}`);
    if (address.addressLine1) parts.push(address.addressLine1);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.city) parts.push(address.city);
    if (address.postcode) parts.push(address.postcode);
    if (address.country) parts.push(address.country);
    return parts.filter(Boolean).join(', ');
  };

  const renderAddressCard = (location, address, color, letter) => (
    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-solid" style={{ borderLeftColor: color }}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={`text-white rounded-full w-8 h-8 flex items-center justify-center font-medium shadow-md`} style={{ backgroundColor: color }}>
            {letter}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="font-medium text-gray-800">{location}</div>
          <div className="text-sm text-gray-600 mt-1">{formatAddress(address)}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
              {address.propertyType || "Unknown property type"}
            </span>
            <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
              Floor: {address.floor || "Ground"}
            </span>
            {address.liftAvailable && (
              <span className="inline-flex items-center bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-700">
                Lift Available
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto mt-24 mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-0 relative flex flex-col">
            {/* Header */}
            <div className="text-center pt-10 pb-4 px-8 border-b border-gray-100">
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Thank you for your booking!</h2>
              <p className="text-gray-500 text-lg font-light">A confirmation has been sent to <span className="font-medium">{quoteDetails?.email || "your email"}</span></p>
              <p className="text-gray-700 font-bold mt-2">Here's a Summary of your Booking for {service}</p>
            </div>
            {/* Main content */}
            <div className="px-8 py-6 flex-1 flex flex-col gap-8">
              {/* Booking Reference */}
              <div>
                <div className="text-base font-medium text-gray-700 mb-1">Your Booking Reference</div>
                <div className="text-2xl font-bold text-amber-600 tracking-wide">{bookingRef || "Processing..."}</div>
              </div>
              {/* Journey Details */}
              <div>
                <div className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Journey Details
                </div>
                <div className="space-y-4 mb-4">
                  {pickup && renderAddressCard(pickup.location || "Pickup Location", pickup, "#10b981", "A")}
                  {extraStops && extraStops.length > 0 && (
                    <div className="pl-4 space-y-4">
                      {extraStops.map((stop, index) => (
                        <div key={index} className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-300 -ml-2"></div>
                          {renderAddressCard(
                            stop.address || `Stop ${index + 1}`,
                            {
                              addressLine1: stop.addressLine1,
                              addressLine2: stop.addressLine2,
                              city: stop.city,
                              postcode: stop.postcode,
                              country: stop.country,
                              propertyType: stop.propertyType,
                              floor: stop.floor,
                              liftAvailable: stop.liftAvailable,
                              flatNo: stop.flatNo || stop.doorFlatNo
                            },
                            "#eab308",
                            `${String.fromCharCode(66 + index)}`
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {delivery && (
                    <div className="relative">
                      {extraStops && extraStops.length > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-300 -ml-2"></div>
                      )}
                      {renderAddressCard(
                        delivery.location || "Delivery Location",
                        delivery,
                        "#f43f5e",
                        extraStops && extraStops.length > 0 ? `${String.fromCharCode(66 + extraStops.length)}` : "B"
                      )}
                    </div>
                  )}
                </div>
                <div className="my-4 px-3 py-2 bg-gray-100 rounded-lg">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs font-medium">Distance: <span className="text-gray-700">{journey?.distance || "Calculating..."}</span></div>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs font-medium">Duration: <span className="text-gray-700">{journey?.duration || "Calculating..."}</span></div>
                    </div>
                  </div>
                </div>
                <div className="h-64 bg-gray-100 rounded-lg mb-6 overflow-hidden shadow-inner">
                  <RouteMap />
                </div>
              </div>
              {/* Date, Time, Service Level */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 rounded-full p-3 text-emerald-600 text-xl">📅</div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Moving Date</div>
                      <div className="font-medium text-gray-800">{selectedDate?.date || "To be confirmed"}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-amber-100 rounded-full p-3 text-amber-600 text-xl">⏰</div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Time Window</div>
                      <div className="font-medium text-gray-800">
                        {selectedDate?.pickupTime ? `${selectedDate.pickupTime} - ${selectedDate.dropTime || 'TBC'}` : 'To be confirmed'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-rose-100 rounded-full p-3 text-rose-600 text-xl">👥</div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Service Level</div>
                      <div className="font-medium text-gray-800">{selectedDate?.numberOfMovers===0? 'Customer Loading & Unloading': selectedDate?.numberOfMovers} {selectedDate?.numberOfMovers!=0 && 'Person Removal'}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Vehicle & Items */}
              <div>
                <div className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Vehicle & Items
                </div>
                <div className="mb-6 p-3 bg-gray-100 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-700 mb-2">Vehicle Type</h4>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="font-medium text-gray-800">
                      {typeof van === 'string' ? van : van && van.type ? van.type + ' Van' : 'Standard Van'}
                    </span>
                  </div>
                </div>
                <h4 className="font-medium text-gray-700 mb-3">Items Summary</h4>
                {itemsList && itemsList.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {itemsList.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                          <div className="font-medium text-gray-700">{item || `Item ${index + 1}`}</div>
                          <div className="bg-emerald-100 px-3 py-1 rounded-full text-emerald-700 text-sm font-medium">
                            ×{quantities[index] || 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-100 text-gray-700">
                    No items have been specified for this move.
                  </div>
                )}
              </div>
              {/* Customer Details */}
              <div>
                <div className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Details
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Name</div>
                    <div className="font-medium text-gray-800">{customerDetails?.name || "Not provided"}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Phone</div>
                    <div className="font-medium text-gray-800">{customerDetails?.phone || "Not provided"}</div>
                  </div>
                </div>
              </div>
              {/* Additional Services */}
              <div>
                <div className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Additional Services
                </div>
                <div className="space-y-3">
                  {additionalServices && additionalServices.basicCompensation && (
                    <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                      <div className="bg-gray-200 rounded-full p-2 text-green-600">✓</div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-800">Basic Compensation Cover</div>
                        <div className="text-sm text-gray-600">Standard protection included</div>
                      </div>
                    </div>
                  )}
                  {additionalServices && additionalServices.comprehensiveInsurance && (
                    <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                      <div className="bg-gray-200 rounded-full p-2 text-blue-600">✓</div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-800">Comprehensive Insurance</div>
                        <div className="text-sm text-gray-600">Enhanced protection for your valuables</div>
                      </div>
                    </div>
                  )}
                  {itemsToDismantle > 0 && (
                    <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                      <span className="text-lg mr-2">🔧</span>
                      <div>
                        <div className="font-medium text-gray-800">Dismantling Service</div>
                        <div className="text-sm text-gray-600">
                          {itemsToDismantle} {itemsToDismantle === 1 ? 'item' : 'items'} to dismantle
                        </div>
                      </div>
                    </div>
                  )}
                  {itemsToAssemble > 0 && (
                    <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                      <span className="text-lg mr-2">🔨</span>
                      <div>
                        <div className="font-medium text-gray-800">Reassembly Service</div>
                        <div className="text-sm text-gray-600">
                          {itemsToAssemble} {itemsToAssemble === 1 ? 'item' : 'items'} to assemble
                        </div>
                      </div>
                    </div>
                  )}
                  {(!additionalServices || (
                    !additionalServices.basicCompensation &&
                    !additionalServices.comprehensiveInsurance &&
                    (!additionalServices.dismantling || additionalServices.dismantling.length === 0) &&
                    (!additionalServices.reassembly || additionalServices.reassembly.length === 0) &&
                    !additionalServices.specialRequirements
                  )) && (
                      <div className="bg-gray-100 p-4 rounded-lg text-gray-600 italic">
                        No additional services selected
                      </div>
                    )}
                </div>
              </div>
              {/* Special Requirements */}
              {additionalServices && additionalServices.specialRequirements && (
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-gray-700 text-sm">
                  <span className="font-medium">Special Requirements: </span>{additionalServices.specialRequirements}
                </div>
              )}
              {/* Total Price */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-lg text-gray-700">Total Price</div>
                  <div className="font-bold text-2xl text-emerald-600">£{totalPrice ? totalPrice.toFixed(2) : '0.00'}</div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-gray-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium shadow-sm">
                    Paid in full
                  </span>
                </div>
              </div>
              {/* What happens next */}
              <div>
                <div className="font-medium text-gray-700 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What happens next?
                </div>
                <div className="space-y-4">
                  <div className="flex items-start p-3 bg-gray-100 rounded-lg">
                    <div className="flex-shrink-0 bg-gray-200 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center">1</div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-800">Check your email</div>
                      <div className="text-sm text-gray-600">We've sent a booking confirmation to {customerDetails?.email || "your email"}</div>
                    </div>
                  </div>
                  <div className="flex items-start p-3 bg-gray-100 rounded-lg">
                    <div className="flex-shrink-0 bg-gray-200 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center">2</div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-800">Receive a confirmation call</div>
                      <div className="text-sm text-gray-600">Our team will call you to confirm all the details</div>
                    </div>
                  </div>
                  <div className="flex items-start p-3 bg-gray-100 rounded-lg">
                    <div className="flex-shrink-0 bg-gray-200 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center">3</div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-800">Moving day!</div>
                      <div className="text-sm text-gray-600">Your movers will arrive on <span className="font-medium">{selectedDate?.date || "the scheduled date"}</span> at the scheduled time</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Need help? */}
              <div>
                <div className="font-medium text-gray-700 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Need help?
                </div>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full p-3 text-red-600 text-xl">📞</div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">Customer Support</div>
                      <div className="font-medium text-gray-800">020 3051 6033</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full p-3 text-blue-600 text-xl">✉️</div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">Email Support</div>
                      <div className="font-medium text-gray-800">info@reliancemove.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Back Button (moved below main content) */}
            <div className="flex justify-center mt-2 mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg text-base"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 border-t border-gray-100 pt-6 px-8 pb-8">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg text-base w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Confirmation</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg text-base w-full sm:w-auto"
                onClick={() => window.location.href = 'https://reliancemove.com'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Book Another Move</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteConfirmation;