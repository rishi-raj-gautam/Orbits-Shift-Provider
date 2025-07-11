import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Calendar, MapPin, User, Phone, Package, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { loadStripe } from '@stripe/stripe-js';
import Header from '../components/Header';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const quotationNo = searchParams.get('quotationRef');
        fetchQuotation(quotationNo);
    }, []);

    const fetchQuotation = async (quotationNo) => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/quote/get/${quotationNo}`);
            if (response.data.msg === "Quotation found") {
                setQuotation(response.data.quotation);
            } else {
                throw new Error('Quotation not found');
            }
        } catch (err) {
            if (err.response) {
                setError(`Error ${err.response.status}: ${err.response.data.message || 'Failed to fetch quotation'}`);
            } else if (err.request) {
                setError('Network error: Unable to connect to server');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        try {
            const sessionRes = await axios.post(`${baseUrl}/create-checkout-session`, quotation);
            const stripe = await stripePromise;
            await stripe.redirectToCheckout({ sessionId: sessionRes.data.sessionId });
        } catch (error) {
            setSubmitError('Failed to submit booking. Please try again. (Check all fields are selected or not)');
            navigate('/payment-failed');
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
                    <p className="text-gray-700">Loading quotation details...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-black" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Quotation</h2>
                            <p className="text-gray-700 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors w-full mt-2"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-100 py-12 px-4 flex flex-col items-center">
            <Header title="Payment" />
            {/* Back Button */}
            <div className="flex justify-center mb-8 mt-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-md"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
            </div>
            <div className="w-full max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-0">
                    {/* Header */}
                    <div className="p-8 border-b border-neutral-200 text-center">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">Complete Your Payment</h1>
                        <p className="text-gray-500 text-base font-light mb-2">Quotation Reference: <span className="font-semibold text-gray-900">{quotation?.quotationRef}</span></p>
                        <Truck className="w-12 h-12 text-black mx-auto mt-2" />
                    </div>
                    <div className="p-8">
                        {/* Price Summary */}
                        <div className="bg-white rounded-xl p-6 mb-8 border border-neutral-200 shadow-sm">
                            <div className="text-center">
                                <h2 className="text-4xl font-bold text-black mb-2">£{quotation?.price}</h2>
                                <p className="text-gray-700 text-lg">Total Amount</p>
                                <div className="mt-4 flex justify-center items-center space-x-4 text-sm text-gray-700">
                                    <span className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {quotation?.distance} miles
                                    </span>
                                    <span className="flex items-center">
                                        <Package className="w-4 h-4 mr-1" />
                                        {quotation?.vanType} Van
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Service Details */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Pickup Details */}
                            <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm">
                                <h3 className="text-lg font-bold text-center text-black mb-4 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 mr-2 text-black" />
                                    Pickup Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-black">{quotation?.pickupAddress.addressLine1}</p>
                                        <p className="text-sm text-gray-500">{quotation?.pickupAddress.city} {quotation?.pickupAddress.postcode}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Date</p>
                                            <p className="font-medium flex items-center text-black">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {quotation?.pickupDate}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Time</p>
                                            <p className="font-medium text-black">{quotation?.pickupTime}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Contact</p>
                                        <p className="font-medium flex items-center text-black">
                                            <User className="w-4 h-4 mr-1" />
                                            {quotation?.pickupAddress.contactName}
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Phone className="w-4 h-4 mr-1" />
                                            {quotation?.pickupAddress.contactPhone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Drop Details */}
                            <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm">
                                <h3 className="text-lg font-bold text-center text-black mb-4 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 mr-2 text-black" />
                                    Drop Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-black">{quotation?.dropAddress.addressLine1}</p>
                                        <p className="text-sm text-gray-500">{quotation?.dropAddress.city} {quotation?.dropAddress.postcode}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Date</p>
                                            <p className="font-medium flex items-center text-black">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {quotation?.dropDate}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Time</p>
                                            <p className="font-medium text-black">{quotation?.dropTime}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Contact</p>
                                        <p className="font-medium flex items-center text-black">
                                            <User className="w-4 h-4 mr-1" />
                                            {quotation?.dropAddress.contactName}
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Phone className="w-4 h-4 mr-1" />
                                            {quotation?.dropAddress.contactPhone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Service Info */}
                        <div className="bg-white rounded-xl p-6 mb-8 border border-neutral-100 shadow-sm">
                            <h3 className="text-lg font-bold text-center text-black mb-4">Service Information</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <Truck className="w-8 h-8 text-black mx-auto mb-2" />
                                    <p className="font-medium text-black">{quotation?.vanType} Van</p>
                                    <p className="text-sm text-gray-500">Vehicle Type</p>
                                </div>
                                <div className="text-center">
                                    <User className="w-8 h-8 text-black mx-auto mb-2" />
                                    <p className="font-medium text-black">{quotation?.worker} Worker</p>
                                    <p className="text-sm text-gray-500">Team Size</p>
                                </div>
                                <div className="text-center">
                                    <MapPin className="w-8 h-8 text-black mx-auto mb-2" />
                                    <p className="font-medium text-black">{quotation?.distance} miles</p>
                                    <p className="text-sm text-gray-500">Distance</p>
                                </div>
                            </div>
                        </div>
                        {/* Payment Button */}
                        <div className="text-center">
                            <button
                                onClick={handlePayment}
                                className="bg-black text-white font-bold py-4 px-12 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg flex items-center justify-center mx-auto text-lg w-full max-w-xs"
                            >
                                <CreditCard className="w-6 h-6 mr-3" />
                                Pay Now - £{quotation?.price}
                            </button>
                            {submitError && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {submitError}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-4">Secure payment processing • SSL encrypted</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;