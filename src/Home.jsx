import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const heroOptions = [
  { label: 'Home', icon: '🏠', to: '/home-loc' },
  { label: 'Furniture', icon: '🪑', to: '/furniture-loc' },
  { label: 'Piano', icon: '🎹', to: '/piano-loc' },
  { label: 'Other', icon: '📦', to: '/other-removals' },
];

const testimonials = [
  { name: 'Sarah L.', text: 'Made my move effortless and stress-free.' },
  { name: 'James P.', text: 'Professional and careful with belongings.' },
  { name: 'Priya S.', text: 'Best moving experience I\'ve ever had.' },
];

const ServiceCard = ({ icon, title, onClick }) => (
  <button 
    className="group flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg hover:border-black hover:shadow-lg transition-all duration-300 text-left w-full"
    onClick={onClick}
  >
    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
  </button>
);

const TestimonialCard = ({ name, text }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
    <p className="text-gray-700 mb-4 italic">"{text}"</p>
    <div className="text-sm font-medium text-gray-900">— {name}</div>
  </div>
);

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">
              Moving Made
              <span className="block font-bold">Simple</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 font-light">
              Professional moving services with attention to detail and care for your belongings
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {heroOptions.map((option, index) => (
              <div
                key={option.label}
                className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <ServiceCard
                  icon={option.icon}
                  title={option.label}
                  onClick={() => navigate(option.to)}
                />
              </div>
            ))}
          </div>
          <div className="text-center">
            <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Get Quote
            </button>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6">About Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              We specialize in providing reliable, efficient moving services with a focus on simplicity and customer satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Reliable', desc: 'Consistent, dependable service you can trust', icon: '✓' },
              { title: 'Efficient', desc: 'Streamlined processes for faster moves', icon: '→' },
              { title: 'Careful', desc: 'Protecting your belongings is our priority', icon: '♦' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-16 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Home Moves', desc: 'Complete residential moving solutions', icon: '🏠' },
              { title: 'Furniture Transport', desc: 'Specialized furniture handling and care', icon: '🪑' },
              { title: 'Piano Moving', desc: 'Expert piano transportation services', icon: '🎹' },
              { title: 'Storage', desc: 'Secure storage facilities available', icon: '📦' },
              { title: 'Packing', desc: 'Professional packing and unpacking', icon: '📋' },
              { title: 'Insurance', desc: 'Comprehensive coverage for peace of mind', icon: '🛡️' }
            ].map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-medium mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-16 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light mb-6">Get in Touch</h2>
            <p className="text-xl text-gray-600 font-light">
              Ready to move? Contact us for a free quote.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <textarea 
                placeholder="Tell us about your move..." 
                rows={4} 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
              />
              <div className="text-center">
                <button 
                  className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Quote request submitted! We\'ll contact you soon.');
                  }}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;