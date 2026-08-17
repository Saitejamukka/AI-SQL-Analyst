import React from 'react';
import { Database, Sparkles, Server, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Navbar({ activeConn, onOpenConnections, onRefreshSchema, loadingSchema }) {
  return (
    <header className="sticky top-0 z-40 bg-beige-50/95 backdrop-blur border-b border-beige-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brown-700 via-brown-600 to-amber-600 p-0.5 flex items-center justify-center shadow-md shadow-brown-900/10">
          <div className="w-full h-full bg-brown-900 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg tracking-tight text-brown-950">AI SQL Analyst</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-brown-100 text-brown-800 border border-brown-300/80 rounded-full">
              Beige & Brown Theme
            </span>
          </div>
          <p className="text-xs text-brown-600 hidden sm:block">Intelligent Database Insights & Natural Language Analytics</p>
        </div>
      </div>

      {/* Active Database Badge & Quick Actions */}
      <div className="flex items-center space-x-3">
        {/* Guardrail Safety Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-800/10 border border-emerald-700/30 rounded-xl text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Read-Only Guardrails Active</span>
        </div>

        {/* Database Connection Pill */}
        <button
          onClick={onOpenConnections}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-beige-200/70 hover:bg-beige-200 border border-beige-300 rounded-xl text-xs font-semibold transition text-brown-900"
        >
          <Server className="w-4 h-4 text-brown-600" />
          <span className="max-w-[140px] truncate font-bold">
            {activeConn ? activeConn.name : 'Sample Database'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
        </button>

        {/* Refresh Schema Button */}
        <button
          onClick={onRefreshSchema}
          disabled={loadingSchema}
          title="Refresh Database Schema"
          className="p-2 text-brown-700 hover:text-brown-900 bg-beige-200/70 hover:bg-beige-200 border border-beige-300 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loadingSchema ? 'animate-spin text-brown-600' : ''}`} />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-beige-300">
          <div className="w-8 h-8 rounded-full bg-brown-700 border border-brown-600 flex items-center justify-center text-xs font-bold text-beige-100 shadow-sm">
            BA
          </div>
          <span className="text-xs font-bold text-brown-900 hidden md:inline">Business Analyst</span>
        </div>
      </div>
    </header>
  );
}
