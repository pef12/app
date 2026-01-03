
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'tasks', icon: 'fa-list-check', label: 'Lista de Funções' },
    { id: 'ai-assistant', icon: 'fa-robot', label: 'Assistente IA' },
    { id: 'resources', icon: 'fa-book', label: 'Recursos UE5' },
    { id: 'settings', icon: 'fa-gear', label: 'Configurações' },
  ];

  return (
    <div className="w-64 bg-[#0f172a] h-screen border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 unreal-gradient rounded-lg flex items-center justify-center text-white font-bold text-xl">
          U
        </div>
        <span className="font-bold text-lg tracking-tight">UE5 Architect</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="glass-card p-4 rounded-xl text-xs text-slate-500 border border-slate-800">
          <p className="mb-2">Powered by Google Gemini</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>API Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
