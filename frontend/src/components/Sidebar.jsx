import React from 'react';
import { MessageSquareCode, Database, Terminal, Network, History } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'studio', label: 'AI Query Studio', icon: MessageSquareCode, badge: 'NL to SQL' },
    { id: 'schema', label: 'Schema & ERD', icon: Network, badge: 'Interactive' },
    { id: 'raw', label: 'Direct SQL Studio', icon: Terminal, badge: 'IDE' },
    { id: 'connections', label: 'Connections Hub', icon: Database, badge: 'Live' },
    { id: 'history', label: 'Audit Log & History', icon: History }
  ];

  return (
    <aside className="w-64 bg-beige-50/80 backdrop-blur border-r border-beige-200 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-brown-600 uppercase tracking-wider mb-2">
            Analytics Workspace
          </p>
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brown-800 text-beige-50 shadow-md shadow-brown-900/15'
                      : 'text-brown-700 hover:text-brown-950 hover:bg-beige-200/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-brown-600'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive ? 'bg-brown-600 text-beige-100' : 'bg-beige-200 text-brown-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Database Quick Summary Info */}
      <div className="p-3.5 bg-beige-200/80 border border-beige-300 rounded-xl text-xs space-y-2">
        <div className="flex items-center justify-between text-brown-700">
          <span className="font-medium">Security Guardrail</span>
          <span className="text-emerald-700 font-bold">Strict SELECT</span>
        </div>
        <div className="flex items-center justify-between text-brown-700">
          <span className="font-medium">Supported DBs</span>
          <span className="text-brown-900 font-bold">PostgreSQL, SQLite</span>
        </div>
      </div>
    </aside>
  );
}
