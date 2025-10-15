// Loader.jsx

import React from 'react';

/**
 * A minimalistic, black and white three-dot loader using Tailwind CSS 
 * and inline styles for custom animation delays.
 */
const Loader = ({ loadingText = 'Saving Changes' }) => {
  return (
    // Overlay: Fixed, semi-transparent white backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 transition-opacity duration-300"
    >
      <div className="flex flex-col items-center space-y-4">
        
        {/* Loader Container */}
        <div className="flex space-x-2">
          {/* Dot 1 */}
          <div 
            className="w-2 h-2 rounded-full bg-gray-800 animate-pulse"
            style={{ animationDelay: '0s' }}
          ></div>

          {/* Dot 2 */}
          <div 
            className="w-2 h-2 rounded-full bg-gray-800 animate-pulse"
            style={{ animationDelay: '0.2s' }}
          ></div>

          {/* Dot 3 */}
          <div 
            className="w-2 h-2 rounded-full bg-gray-800 animate-pulse"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>

        {/* Loading Text */}
        <p className="text-sm font-medium text-gray-700">
          {loadingText}
          <span className="animate-pulse ml-0.5">.</span>
          <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
        </p>
        
      </div>
    </div>
  );
};

export default Loader;