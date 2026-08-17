import React, { useState, useEffect } from 'react';
import { History, Play, Clock, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchHistory } from '../api';

export default function QueryHistory({ onRunHistoricalQuery }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory(50);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-beige-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brown-700 text-amber-200 rounded-xl shadow-sm">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brown-950 tracking-tight">Query History & Audit Log</h2>
            <p className="text-xs text-brown-600 font-semibold">
              Audit trail of generated SQL queries, security compliance checks, and execution metrics.
            </p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="glass-card rounded-2xl p-6 border border-beige-200 space-y-4 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-brown-600 text-sm font-bold">Loading audit history logs...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-brown-600 text-sm font-bold">No historical queries executed yet.</div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-beige-50 border border-beige-200 rounded-xl hover:border-beige-300 transition space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.status === 'SUCCESS' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-800/10 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-700/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>SUCCESS</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-rose-800/10 text-rose-800 text-[10px] font-bold rounded-full border border-rose-700/30 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 text-rose-700" />
                        <span>{item.status}</span>
                      </span>
                    )}

                    <span className="text-xs text-brown-950 font-bold">{item.question}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-brown-700 font-medium">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-brown-600" />
                      <span>{item.execution_time_ms} ms</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-brown-600" />
                      <span>{item.record_count} rows</span>
                    </span>
                    <span className="text-[11px] text-brown-500 font-mono font-semibold">{item.created_at}</span>

                    <button
                      onClick={() => onRunHistoricalQuery && onRunHistoricalQuery(item.generated_sql)}
                      className="px-3 py-1 bg-brown-700 hover:bg-brown-800 text-beige-50 text-xs font-bold rounded-lg transition flex items-center space-x-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 text-amber-300" />
                      <span>Re-Run</span>
                    </button>
                  </div>
                </div>

                <div className="glass-card-dark p-3 rounded-lg font-mono text-xs text-amber-200 overflow-x-auto">
                  <code>{item.generated_sql}</code>
                </div>

                {item.error_message && (
                  <p className="text-xs text-rose-800 font-mono bg-rose-50 p-2 rounded border border-rose-200 font-semibold">
                    Error: {item.error_message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
