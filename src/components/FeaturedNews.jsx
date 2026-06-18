import React from 'react';

const newsData = [
  {
    category: 'WEB DESK / BIG STORY / LATEST / NEWS',
    title: 'തൃശ്ശൂരിൽ വിദ്യാർഥികളെ ബന്ധിൽ കയ്യറ്റതിരുന്ന സംഭവം: കണ്ടുകൂടെ ലൈസൻസ് സന്ത്‌പേർഡ് ചെയ്തു',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop',
    time: '2 hours ago'
  },
  {
    category: 'WEB DESK / BIG STORY / KERALA / LATEST / NEWS',
    title: 'പിടിയിലായത് ഇടനിലക്കാരനോ? ഉപ്പള വിഭ്ളേജ് ഓഫീസിൽ വിജിലൻസ് റെയ്ഡ്, കൈക്കെല്ലേ വാങ്ങിയത് കാഷ്ട്രത്തെ സ്വിപ്പൂർ',
    image: 'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?w=800&h=500&fit=crop',
    time: '4 hours ago'
  },
  {
    category: 'WEB DESK / LATEST / NEWS',
    title: 'സംസ്ഥാനത്ത് വ്യാപക മഴ: എട്ട് ജില്ലകളിൽ യെല്ലോ അലേർട്ട്',
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&h=500&fit=crop',
    time: '6 hours ago'
  },
  // ----- NEW ITEMS START HERE -----
  {
    category: 'WEB DESK / KERALA / LATEST / NEWS',
    title: 'വയനാട്ടിൽ ഉരുൾപൊട്ടൽ: ദുരിതാശ്വാസ പ്രവർത്തനങ്ങൾ തുടരുന്നു',
    image: 'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?w=800&h=500&fit=crop',
    time: '8 hours ago'
  },
  {
    category: 'WEB DESK / SPORTS / LATEST / NEWS',
    title: 'ഐ.പി.എൽ. 2026: കൊൽക്കത്ത നൈറ്റ് റൈഡേഴ്സ് സെമിയിൽ',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=500&fit=crop',
    time: '10 hours ago'
  },
  {
    category: 'WEB DESK / BUSINESS / LATEST / NEWS',
    title: 'സംസ്ഥാന ബജറ്റ് അവതരിപ്പിച്ചു; പുതിയ പദ്ധതികൾ പ്രഖ്യാപിച്ചു',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
    time: '12 hours ago'
  },
  {
    category: 'WEB DESK / TECH / LATEST / NEWS',
    title: 'ഇന്ത്യയുടെ ആദ്യ സ്വദേശി ചിപ്പ് പുറത്തിറക്കി; ടെസ്റ്റ് വിജയകരം',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
    time: '14 hours ago'
  },
  {
    category: 'WEB DESK / ENTERTAINMENT / LATEST / NEWS',
    title: 'മമ്മൂട്ടിയുടെ പുതിയ ചിത്രത്തിന് മികച്ച പ്രതികരണം',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop',
    time: '1 day ago'
  },
  {
    category: 'WEB DESK / HEALTH / LATEST / NEWS',
    title: 'കേരളത്തിൽ ഡെങ്കി വ്യാപനം രൂക്ഷം; പ്രതിരോധ നിർദ്ദേശങ്ങൾ',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=500&fit=crop',
    time: '1 day ago'
  }
]; 
const FeaturedNews = ({ news }) => {
  if (!news) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="relative">
        <img 
          src={news.image} 
          alt="News" 
          className="w-full h-64 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              BIG STORY
            </span>
            <span className="text-white/70 text-xs flex items-center">
              <span className="mr-1">🕒</span> {news.time}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">
            {news.title}
          </h2>
          <p className="text-white/60 text-xs mt-1">{news.category}</p>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;