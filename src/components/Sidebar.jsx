  import React from 'react';

  const Sidebar = ({ trending, navItems }) => {
    return (
      <div className="space-y-6">
        {/* Trending */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-red-600">🔥</span>
            <h3 className="font-bold text-gray-800">ട്രെൻഡിംഗ്</h3>
          </div>
          <div className="space-y-3">
            {trending.map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="flex items-start space-x-3">
                  <span className="text-red-600 font-bold text-sm w-5 flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-red-600 transition-colors leading-tight">
                      {item.title}
                    </p>
                    <span className="text-gray-400 text-xs flex items-center mt-0.5">
                      <span className="mr-1">🕒</span> {item.time}
                    </span>
                  </div>
                </div>
                {index < trending.length - 1 && <div className="border-b border-gray-100 my-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3">വിഭാഗങ്ങൾ</h3>
          <div className="grid grid-cols-2 gap-2">
            {navItems.slice(0, 10).map((item, index) => (
              <a key={index} href="#" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors text-xs font-medium">
                <span className="text-gray-400">📰</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-5 text-white">
          <h3 className="font-bold text-lg">വാർത്തകൾ നേരിട്ട്</h3>
          <p className="text-white/80 text-sm mt-1">ഇമെയിൽ വഴി ലഭിക്കാൻ സബ്സ്ക്രൈബ് ചെയ്യുക</p>
          <div className="mt-3 flex">
            <input type="email" placeholder="ഇമെയിൽ വിലാസം" className="flex-1 px-3 py-2 rounded-l-lg text-gray-800 text-sm outline-none" />
            <button className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-r-lg font-semibold text-sm hover:bg-yellow-300">സബ്സ്ക്രൈബ്</button>
          </div>
        </div>
      </div>
    );
  };

  export default Sidebar;