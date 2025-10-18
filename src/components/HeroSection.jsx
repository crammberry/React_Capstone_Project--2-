import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-[#2C3E50] text-white py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Eternal Rest Memorial Park
          </h1>
          
          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 lg:mb-12 leading-relaxed font-normal">
            Digital Mapping System for Our Beloved Departed
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="/map"
              className="bg-[#3498DB] hover:bg-[#2980B9] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors duration-200 flex items-center gap-2 sm:gap-3 justify-center"
            >
              <span className="text-white">📍</span>
              View Graveyard Map
            </a>
            
            <a
              href="/about"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-[#2C3E50] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-200 flex items-center gap-2 sm:gap-3 justify-center"
            >
              <span className="text-white">ℹ️</span>
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;