// ==============================
// 3. components/BreakingTicker.jsx
// ==============================
import React from 'react';

const BreakingTicker = () => {
  return (
    <div className="bg-red-600 text-white py-1.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* <span className="bg-white text-red-600 text-xs font-bold px-3 py-0.5 rounded mr-3 whitespace-nowrap">
          BREAKING
        </span> */}
        <div className="flex-1 overflow-hidden">
      
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BreakingTicker;