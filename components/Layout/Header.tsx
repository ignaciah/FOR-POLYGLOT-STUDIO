
import React from 'react';
import { Bell, Search, User, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">PolyGlot</span>
        </div>
        
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="pl-10 pr-4 py-2 bg-gray-100 border-transparent border focus:bg-white focus:border-indigo-100 rounded-xl text-sm outline-none transition-all w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-200 mx-1"></div>
        <div className="flex items-center gap-3 pl-1 cursor-pointer hover:bg-gray-50 p-1 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            JD
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Jane Doe</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
