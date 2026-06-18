// ==============================
// 6. components/MalayalamSection.jsx
// ==============================
import React from 'react';
import { ChevronRight } from 'lucide-react';

const MalayalamSection = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="bg-red-600 w-1 h-6 rounded-full mr-2"></span>
          ചിലവും
        </h3>
        <a href="#" className="text-red-600 text-sm font-medium flex items-center hover:underline">
          കൂടുതൽ <ChevronRight size={16} />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-gray-800 font-medium text-sm">ഇന്നി പണക്കുല ഇല്ലാതെ</p>
          <span className="text-gray-400 text-xs mt-1 block">2 hours ago</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-gray-800 font-medium text-sm">സംസ്ഥാനത്ത് വ്യാപക മഴ</p>
          <span className="text-gray-400 text-xs mt-1 block">4 hours ago</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-gray-800 font-medium text-sm">പുതിയ ടൂറിസം പദ്ധതികൾ</p>
          <span className="text-gray-400 text-xs mt-1 block">6 hours ago</span>
        </div>
      </div>
    </div>
  );
};

export default MalayalamSection;