
import React from 'react';
import { 
  Home, 
  Layers, 
  Settings, 
  Library, 
  FileText, 
  PieChart, 
  History,
  PlusCircle
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: false },
    { icon: PlusCircle, label: 'New Project', active: true },
    { icon: Layers, label: 'Active Campaigns', active: false },
    { icon: Library, label: 'Asset Library', active: false },
    { icon: History, label: 'History', active: false },
    { icon: PieChart, label: 'Analytics', active: false },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-[calc(100vh-64px)] hidden lg:flex flex-col">
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-4">Workspace</div>
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              item.active 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
