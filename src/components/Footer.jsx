// ==============================
// 8. components/Footer.jsx
// ==============================
import React from 'react';

const Footer = () => {
  return (
    <footer className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <h4 className="font-bold text-gray-800 text-sm mb-2">കെയിരളി ന്യൂസ്</h4>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li><a href="#" className="hover:text-red-600">ഞങ്ങളെക്കുറിച്ച്</a></li>
            <li><a href="#" className="hover:text-red-600">ബന്ധപ്പെടുക</a></li>
            <li><a href="#" className="hover:text-red-600">പരസ്യം</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm mb-2">വിഭാഗങ്ങൾ</h4>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li><a href="#" className="hover:text-red-600">വാർത്ത</a></li>
            <li><a href="#" className="hover:text-red-600">വിനോദം</a></li>
            <li><a href="#" className="hover:text-red-600">കായികം</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm mb-2">സേവനങ്ങൾ</h4>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li><a href="#" className="hover:text-red-600">RSS ഫീഡ്</a></li>
            <li><a href="#" className="hover:text-red-600">മൊബൈൽ ആപ്പ്</a></li>
            <li><a href="#" className="hover:text-red-600">ന്യൂസ് അലേർട്ട്</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm mb-2">സോഷ്യൽ</h4>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li><a href="#" className="hover:text-red-600">ഫേസ്ബുക്ക്</a></li>
            <li><a href="#" className="hover:text-red-600">ട്വിറ്റർ</a></li>
            <li><a href="#" className="hover:text-red-600">യൂട്യൂബ്</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        © 2026 kairalinewsonline.com. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;