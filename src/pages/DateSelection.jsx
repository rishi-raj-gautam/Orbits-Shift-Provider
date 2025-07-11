import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import EmailPopup from '../components/EmailPopup';
import './Date.css';

const DateSelection = () => {
    // Navigation and routing
    const navigate = useNavigate();
    const location = useLocation();
    const prepath = location.state?.prepath;

    // Context and state management
    const { selectedDate, setSelectedDate, van, setVan } = useBooking();
    const [value, setValue] = useState(new Date());
    const [calendarPrices, setCalendarPrices] = useState({});
    const [bestPriceDates, setBestPriceDates] = useState([]);
    const [currentView, setCurrentView] = useState(new Date());
    const [selectedMovers, setSelectedMovers] = useState(selectedDate.numberOfMovers || 0);
    const [selectedVanType, setSelectedVanType] = useState(van.type || '');
    const [showEmailPopup, setShowEmailPopup] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    // Derived values
    const currentMonth = currentView.toLocaleString('default', { month: 'long' });
    const currentYear = currentView.getFullYear();

    // Van options configuration
    const vanOptions = [
        { type: 'Small', price: 60, emoji: '🚐' },
        { type: 'Medium', price: 70, emoji: '🚚' },
        { type: 'Large', price: 80, emoji: '🚛' },
        { type: 'Luton', price: 90, emoji: '📦' }
    ];

    useEffect(() => {
        // generatePriceData();
    }, []);

    const generatePriceData = () => {
        const prices = {};
        const bestPrices = [];
        const today = new Date();

        for (let i = 0; i < 60; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            let price;
            const day = date.getDay();

            if (day === 0 || day === 6) {
                price = 179 + Math.floor(Math.random() * 20);
            } else if (day === 2 || day === 4) {
                price = 139 + Math.floor(Math.random() * 10);
                if (Math.random() > 0.6) {
                    bestPrices.push(date.toDateString());
                }
            } else {
                price = 169 + Math.floor(Math.random() * 10);
            }

            prices[date.toDateString()] = price;
        }

        setCalendarPrices(prices);
        setBestPriceDates(bestPrices);
    };

    const handleEmailSubmit = (email) => {
        setUserEmail(email);
        setShowEmailPopup(false);
    };

    const formatSelectedDate = (date) => {
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    };

    const handleSelectDate = (date) => {
        setValue(date);
        const formattedDate = formatSelectedDate(date);
        const datePrice = calendarPrices[date.toDateString()] || 169;

        setSelectedDate({
            date: formattedDate,
            price: datePrice,
            numberOfMovers: selectedMovers || 0
        });
    };

    const handleSelectMovers = (count) => {
        setSelectedMovers(count);
        setSelectedDate({
            ...selectedDate,
            numberOfMovers: count
        });
    };

    const handleSelectVanType = (type) => {
        setSelectedVanType(type);
        setVan({ ...van, type: type });
    };

    const getVanEmoji = (type) => {
        const emojis = {
            'Small': '🚐',
            'Medium': '🚚',
            'Large': '🚛',
            'Luton': '📦'
        };
        return emojis[type] || '🚐';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!van.type || selectedDate.numberOfMovers === undefined) {
            setShowAlert(true);
            return;
        }
        navigate('/additional-services');
    };

    const tileContent = ({ date, view }) => {
        if (view !== 'month') return null;
        const dateString = date.toDateString();
        const price = calendarPrices[dateString];
        const isBestPrice = bestPriceDates.includes(dateString);

        return (
            <div className="text-center py-1">
                {price && <div className="text-sm font-medium text-gray-700">£{price}</div>}
                {isBestPrice && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded-sm">
                        Best Price!
                    </div>
                )}
            </div>
        );
    };

    const tileClassName = ({ date, view }) => {
        if (view !== 'month') return '';
        const dateString = date.toDateString();
        const selectedDateString = value.toDateString();
        const isBestPrice = bestPriceDates.includes(dateString);

        if (dateString === selectedDateString) {
            return 'bg-blue-600 text-white rounded-lg';
        } else if (isBestPrice) {
            return 'bg-green-50 rounded-lg';
        }
        return '';
    };

    const handlePrevMonth = () => {
        const newDate = new Date(currentView);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentView(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentView);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentView(newDate);
    };

    const isCurrentMonth = () => {
        const today = new Date();
        return currentView.getMonth() === today.getMonth() && currentView.getFullYear() === today.getFullYear();
    };

    const isDateDisabled = ({ date, view }) => {
        if (view === 'month') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
        }
        return false;
    };

    return (
        <>
            {showEmailPopup && <EmailPopup onContinue={handleEmailSubmit} />}

            <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50 flex items-center justify-center ${showEmailPopup ? 'blur-sm' : ''}`}>
                <div className="w-full max-w-3xl mx-auto px-4 py-10 mt-24">
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
                            <h2 className="text-3xl font-bold mb-2 tracking-tight text-gray-800">Select Date & Van</h2>
                            <p className="text-gray-500 text-lg font-light">Choose your preferred date and van type</p>
                        </div>
                        {/* Calendar Section */}
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Select Date</label>
                            <div className="bg-white/70 rounded-lg p-2 border border-gray-200 shadow-sm">
                                <Calendar
                                    onChange={handleSelectDate}
                                    value={value}
                                    tileContent={tileContent}
                                    tileClassName={({ date, view }) => {
                                        if (view !== 'month') return '';
                                        const dateString = date.toDateString();
                                        const selectedDateString = value.toDateString();
                                        const isBestPrice = bestPriceDates.includes(dateString);
                                        if (dateString === selectedDateString) {
                                            return 'bg-emerald-600 text-white rounded-lg';
                                        } else if (isBestPrice) {
                                            return 'bg-amber-50 rounded-lg';
                                        }
                                        return '';
                                    }}
                                    prevLabel={<span className="text-emerald-600">‹</span>}
                                    nextLabel={<span className="text-emerald-600">›</span>}
                                    className="w-full text-xs"
                                    tileDisabled={isDateDisabled}
                                />
                            </div>
                        </div>
                        {/* Van Type Selection */}
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Select Van Type</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {vanOptions.map((option) => (
                                    <button
                                        key={option.type}
                                        type="button"
                                        onClick={() => handleSelectVanType(option.type)}
                                        className={`flex flex-col items-center justify-center p-2 border-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm ${selectedVanType === option.type ? 'border-black bg-gray-100 text-black' : 'border-gray-200 bg-white/70 text-gray-700 hover:border-black hover:bg-gray-100'}`}
                                    >
                                        <span className="text-lg mb-1">{option.emoji}</span>
                                        {option.type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Movers Selection */}
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Number of Movers</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[0, 1, 2, 3].map((count) => (
                                    <button
                                        key={count}
                                        type="button"
                                        className={`p-2 border-2 rounded-lg transition-all duration-200 text-xs font-medium shadow-sm ${selectedMovers === count
                                            ? 'border-black bg-gray-100 text-black'
                                            : 'border-gray-200 bg-white/70 text-gray-700 hover:border-black hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleSelectMovers(count)}
                                    >
                                        <div className="text-base mb-1">
                                            {count === 0 ? '📦' : count === 1 ? '🚚' : count === 2 ? '👤' : '👥'}
                                        </div>
                                        <div className="font-medium text-xs">
                                            {count === 0 ? 'Customer loading & unloading' : count === 1 ? 'Driver Help' : `Driver+${count-1} Person${count > 2 ? 's' : ''}`}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Error Alert */}
                        {showAlert && (
                            <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2 mb-4">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Please select a van type and number of movers.
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
            </div>
        </>
    );
};

export default DateSelection;