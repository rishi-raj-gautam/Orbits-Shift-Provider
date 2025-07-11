import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);       // jump to page top
  }, [pathname]);

  return null;                   // render nothing
}


import './App.css';

// Import Pages
import LocationForm from './pages/LocationForm';
import ItemsForm from './pages/ItemsForm';
import DateSelection from './pages/DateSelection';
import AdditionalServices from './pages/AdditionalServices';
import BookingDetails from './pages/BookingDetails';
import QuoteConfirmation from './pages/QuoteConfirmation';
import OtherRemovals from './pages/OtherRemovals';


// Import Context
import { BookingProvider } from './context/BookingContext';
import AddressDetailsForm from './pages/AddressDetailsForm';
import ItemCategoryForm from './pages/ItemCategoryForm';
import Home from './Home';
import PianoLocationForm from './pages/PianoLocationForm';
import MotorBikeLocationForm from './pages/MotorBikeLocationForm';
import PaymentFailed from './pages/PaymentFailed';
import PaymentSuccess from './pages/PaymentSuccess';

// import Footer from './components/Footer';
// import Nav from './Nav';
import Confirmation from './pages/Confirmation';
import PaymentPage from './pages/PaymentPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';




function App() {
  return (
    <BookingProvider>

      
      <Router>
      <ScrollToTop />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50 flex flex-col app-container">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={< Home />} />
              <Route path="/furniture-loc" element={<LocationForm />} />
              <Route path="/home-loc" element={<AddressDetailsForm />} />
              <Route path="/piano-loc" element={<PianoLocationForm prepath='/piano-loc' />} />
              <Route path="/items" element={<ItemsForm prepath="/items" />} />
              <Route path="/date" element={<DateSelection />} />
              <Route path="/items-home" element={<ItemCategoryForm prepath="/items-home" />} />
              <Route path="/additional-services" element={<AdditionalServices />} />
              <Route path="/booking-details" element={<BookingDetails />} />
              <Route path="/confirmation" element={<QuoteConfirmation />} />
              <Route path="/quote-confirmation" element={<Confirmation />} />
              <Route path="/payment-failed" element={<PaymentFailed />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/other-removals" element={<OtherRemovals />} />
              <Route path="/motorbike-removals" element={<MotorBikeLocationForm prepath='/motorbike-removals' />} />
            </Routes>
          </main>
          <Footer />
        </div>
        {/* <RelianceFooter /> */}
      </Router>
      
    </BookingProvider>
  );
}
export default App;