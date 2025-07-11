import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const EmailPopup = ({ onContinue }) => {
    const [email, setEmail] = useState('');
    const [checkedItems, setCheckedItems] = useState({
        prices: true,
        booking: true,
        aboutUs: true
    });
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const {quoteDetails, setQuoteDetails} = useBooking();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleCheckboxChange = (item) => {
        setCheckedItems(prev => ({
            ...prev,
            [item]: !prev[item]
        }));
    };

    const validateEmail = async (emailToValidate) => {
        try {
            const response = await fetch(`${baseUrl}/user/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailToValidate
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Email validation error:', error);
            return { success: false, error: error.message };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter an email address');
            return;
        }
        setIsLoading(true);
        setError('');
        const validationResult = await validateEmail(email);
        if (validationResult.success) {
            setQuoteDetails({...quoteDetails, email: email});
            setIsVisible(false);
            setTimeout(() => onContinue(email), 300);
        } else {
            setError('Invalid email address. Please check and try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className={`bg-white rounded-2xl shadow-xl max-w-md w-full mx-2 border border-gray-200 overflow-hidden transition-all duration-300 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transform-gpu`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-center text-black flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        RELIANCE
                    </h2>
                    <p className="text-gray-500 mt-0.5 text-center text-xs">Please enter email for instant prices</p>
                </div>
                <div className="p-4">
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-1 text-sm">
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Our Email includes:
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={checkedItems.prices}
                                    onChange={() => handleCheckboxChange('prices')}
                                    className="w-4 h-4 text-black border-2 border-gray-300 rounded focus:ring-black mr-2"
                                />
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 text-black mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    <span className="text-xs font-medium text-gray-700 group-hover:text-black">Guaranteed Lowest Prices!</span>
                                </div>
                            </label>
                            <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={checkedItems.booking}
                                    onChange={() => handleCheckboxChange('booking')}
                                    className="w-4 h-4 text-black border-2 border-gray-300 rounded focus:ring-black mr-2"
                                />
                                <span className="text-xs font-medium text-gray-700 group-hover:text-black">Booking Confirmation</span>
                            </label>
                            <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={checkedItems.aboutUs}
                                    onChange={() => handleCheckboxChange('aboutUs')}
                                    className="w-4 h-4 text-black border-2 border-gray-300 rounded focus:ring-black mr-2"
                                />
                                <span className="text-xs font-medium text-gray-700 group-hover:text-black">About Us & Offers</span>
                            </label>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 bg-white focus:ring-2 focus:ring-black text-sm ${error ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-black'}`}
                                    required
                                    disabled={isLoading}
                                />
                                <div className="absolute right-2 top-2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {error && <div className="text-xs text-rose-600">{error}</div>}
                        <button type="submit" className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors" disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Continue'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmailPopup;