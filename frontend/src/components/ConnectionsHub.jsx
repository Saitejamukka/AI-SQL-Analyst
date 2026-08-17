import React, { useState, useEffect } from 'react';
import { Database, Plus, CheckCircle2, Server, Activity } from 'lucide-react';
import { fetchConnections, testConnection, createConnection, activateConnection } from '../api';

export default function ConnectionsHub({ onConnectionChanged }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [dbType, setDbType] = useState('postgresql');
  const [connString, setConnString] = useState('postgresql://user:password@localhost:5432/analytics_db');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const list = await fetchConnections();
      setConnections(list);
    } catch (err) {
      setError('Failed to load database connections');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);
    try {
      const res = await testConnection(dbType, connString);
      setTestResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !connString.trim()) return;

    try {
      await createConnection(name, dbType, connString, true);
      setName('');
      setShowAddForm(false);
      await loadConnections();
      if (onConnectionChanged) onConnectionChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateConnection(id);
      await loadConnections();
      if (onConnectionChanged) onConnectionChanged();
    } catch (err) {
      setError('Failed to switch database connection');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-beige-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brown-700 text-amber-200 rounded-xl shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brown-950 tracking-tight">Database Connections Hub</h2>
            <p className="text-xs text-brown-600 font-semibold">
              Manage live PostgreSQL or built-in SQLite database instances.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brown-700 hover:bg-brown-800 text-beige-50 font-bold text-xs rounded-xl transition flex items-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>{showAddForm ? 'Cancel' : 'Connect New Database'}</span>
        </button>
      </div>

      {/* Add New Connection Form */}
      {showAddForm && (
        <div className="glass-card rounded-2xl p-6 border border-brown-300 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-brown-950 uppercase tracking-wider">Configure New Relational Database</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-brown-800 block mb-1">Connection Label</label>
                <input
                  type="text"
                  placeholder="e.g. Production PostgreSQL DB"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs text-brown-950 placeholder-brown-400 focus:outline-none focus:border-brown-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brown-800 block mb-1">Database Engine</label>
                <select
                  value={dbType}
                  onChange={(e) => setDbType(e.target.value)}
                  className="w-full bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs text-brown-950 focus:outline-none focus:border-brown-600 font-bold"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="sqlite">SQLite (File Path)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brown-800 block mb-1">Connection String / URI</label>
              <input
                type="text"
                value={connString}
                onChange={(e) => setConnString(e.target.value)}
                placeholder="postgresql://username:password@localhost:5432/dbname"
                className="w-full bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs font-mono text-brown-900 placeholder-brown-400 focus:outline-none focus:border-brown-600 font-bold"
                required
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-bold ${
                testResult.success ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' : 'bg-rose-50 border border-rose-300 text-rose-900'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !connString.trim()}
                className="px-4 py-2 bg-beige-200 hover:bg-beige-300 text-brown-900 text-xs font-bold rounded-xl border border-beige-300 transition flex items-center space-x-1.5"
              >
                <Activity className="w-4 h-4 text-brown-700" />
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-beige-50 text-xs font-bold rounded-xl transition shadow-sm"
              >
                Save & Set Active
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Saved Connections List */}
      <div className="glass-card rounded-2xl p-6 border border-beige-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-brown-950 uppercase tracking-wider">Active & Saved Database Instances</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                c.is_active
                  ? 'bg-beige-200/90 border-brown-400 shadow-sm'
                  : 'bg-white border-beige-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Server className={`w-5 h-5 ${c.is_active ? 'text-brown-800' : 'text-brown-500'}`} />
                  <div>
                    <h4 className="font-bold text-brown-950 text-sm">{c.name}</h4>
                    <span className="text-[10px] text-brown-600 uppercase font-mono font-bold">{c.db_type} Engine</span>
                  </div>
                </div>

                {c.is_active ? (
                  <span className="px-2.5 py-1 bg-emerald-800/10 border border-emerald-700/30 text-emerald-800 text-[10px] font-bold rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                    <span>ACTIVE</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleActivate(c.id)}
                    className="px-3 py-1 bg-beige-200 hover:bg-beige-300 text-brown-900 text-xs font-bold rounded-lg border border-beige-300 transition"
                  >
                    Set Active
                  </button>
                )}
              </div>

              <div className="bg-beige-50 p-2.5 rounded-lg border border-beige-300 font-mono text-[11px] text-brown-800 truncate font-semibold">
                {c.connection_string}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
