import React, { useState, useEffect } from 'react';
import { Terminal, Play, ShieldCheck, Wrench, Clock, FileSpreadsheet, AlertCircle, Copy, Check } from 'lucide-react';
import { executeRawSQL, autoFixSQL } from '../api';

export default function RawSqlStudio({ initialSql }) {
  const [sql, setSql] = useState(initialSql || 'SELECT * FROM customers LIMIT 10;');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fixing, setFixing] = useState(false);
  const [fixExplanation, setFixExplanation] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialSql) {
      setSql(initialSql);
    }
  }, [initialSql]);

  const handleExecute = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    setError(null);
    setFixExplanation(null);

    try {
      const data = await executeRawSQL(sql);
      setResult(data);
    } catch (err) {
      setError(err.message || 'SQL Execution failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFix = async () => {
    if (!error) return;
    setFixing(true);
    try {
      const fixedData = await autoFixSQL(sql, error);
      if (fixedData.fixed_sql) {
        setSql(fixedData.fixed_sql);
        setFixExplanation(fixedData.explanation);
        setError(null);
      }
    } catch (err) {
      setError('Auto-fix failed to resolve the query syntax.');
    } finally {
      setFixing(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-beige-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brown-700 text-amber-200 rounded-xl shadow-sm">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brown-950 tracking-tight">Direct SQL Studio & Query IDE</h2>
            <p className="text-xs text-brown-600">
              Write & execute raw SELECT queries directly with real-time read-only safety guardrails.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-800/10 border border-emerald-700/30 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Strict SELECT Guardrails Enforced</span>
          </span>
        </div>
      </div>

      {/* Editor Box */}
      <div className="glass-card rounded-2xl p-5 space-y-4 border border-beige-200 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-brown-800">
            SQL Command Editor
          </label>

          <div className="flex items-center space-x-2">
            <button
              onClick={copySql}
              className="px-3 py-1.5 text-xs bg-beige-200 hover:bg-beige-300 text-brown-900 font-semibold rounded-lg border border-beige-300 transition flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleExecute}
              disabled={loading || !sql.trim()}
              className="px-5 py-1.5 bg-brown-700 hover:bg-brown-800 text-beige-50 font-bold text-xs rounded-lg transition shadow-md shadow-brown-900/20 flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>{loading ? 'Executing...' : 'Run Query'}</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={6}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="ENTER SELECT STATEMENT HERE..."
            className="w-full glass-card-dark p-4 rounded-xl font-mono text-xs text-amber-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed"
          />
        </div>
      </div>

      {/* Auto Fix Explanation Pill */}
      {fixExplanation && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center space-x-2 font-semibold">
          <Wrench className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{fixExplanation}</span>
        </div>
      )}

      {/* Error & Auto-Fix Trigger */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Query Execution Failed</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>

          <button
            onClick={handleAutoFix}
            disabled={fixing}
            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold rounded-lg text-xs transition flex items-center space-x-1.5 shrink-0 shadow-sm"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-700" />
            <span>{fixing ? 'Fixing Query...' : 'Auto Safe Fix'}</span>
          </button>
        </div>
      )}

      {/* Execution Results Data Grid */}
      {result && (
        <div className="glass-card rounded-2xl p-5 space-y-4 border border-beige-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-beige-200">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-brown-700" />
              <h3 className="font-bold text-brown-950 text-sm">Query Results</h3>
              <span className="text-xs text-brown-600 font-semibold">({result.record_count} rows returned)</span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-brown-700 font-medium">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-brown-600" />
                <span><strong className="text-brown-950">{result.execution_time_ms} ms</strong></span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-beige-200 rounded-xl">
            <table className="w-full text-left text-xs text-brown-900 font-mono">
              <thead className="bg-beige-200/80 text-brown-950 uppercase font-bold text-[11px] border-b border-beige-300">
                <tr>
                  {result.columns.map((col, i) => (
                    <th key={i} className="px-4 py-3 font-bold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200 bg-white">
                {result.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-beige-100/60">
                    {result.columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-brown-950 font-medium">
                        {row[col] !== null ? String(row[col]) : 'null'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
