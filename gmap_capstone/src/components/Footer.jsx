import React from 'react';

const Footer = ({ statusText }) => {
  return (
    <footer className="bg-[#2C3E50] text-white py-6 sm:py-8 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center">
          {statusText && (
            <p className="text-sm opacity-90 mb-2 font-medium">
              {statusText}
            </p>
          )}
          <p className="text-sm opacity-80 mb-1">
            © 2024 Eternal Rest Memorial Park. All rights reserved.
          </p>
          <p className="text-sm opacity-80">
            For assistance, please contact us at (555) 123-4567
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
