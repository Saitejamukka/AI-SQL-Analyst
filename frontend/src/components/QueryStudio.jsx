import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Send, Play, Copy, Check, ShieldCheck, Clock, FileSpreadsheet, 
  BarChart3, LineChart, PieChart, AreaChart, Lightbulb, 
  AlertCircle, Download, RefreshCw, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart as ReLineChart, Line, PieChart as RePieChart, Pie, Cell, 
  AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { executeNLQuery } from '../api';

const COLORS = ['#8c5a3c', '#d9a774', '#4d7c0f', '#b91c1c', '#6b5b4e', '#58341e', '#a16207'];

const SAMPLE_QUESTIONS = [
  "Show top 5 customers by total spending",
  "Find customers who haven't ordered in the last 90 days",
  "What are the total sales and revenue by product category?",
  "List products with low stock quantity under 20 units",
  "Show monthly revenue trend for orders",
  "Which payment methods have the highest transaction volume?"
];

export default function QueryStudio({ onOpenRawStudio }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeChartType, setActiveChartType] = useState('bar');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    handleRunQuery(SAMPLE_QUESTIONS[0]);
  }, []);

  async function handleRunQuery(queryText) {
    const qToRun = queryText || question;
    if (!qToRun.strip && !qToRun.trim()) return;

    setLoading(true);
    setError(null);
    setQuestion(qToRun);

    try {
      const data = await executeNLQuery(qToRun);
      setResult(data);
      if (data.visualization?.chart_type) {
        setActiveChartType(data.visualization.chart_type);
      }
      setPage(1);
    } catch (err) {
      setError(err.message || 'An error occurred during query execution.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    if (!result || !result.rows || result.rows.length === 0) return;
    const headers = result.columns.join(',');
    const rows = result.rows.map(r => result.columns.map(c => `"${r[c] !== undefined ? r[c] : ''}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sql_analyst_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderChart = () => {
    if (!result || !result.rows || result.rows.length === 0) return null;

    const xKey = result.visualization?.x_axis_key || result.columns[0];
    const yKey = result.visualization?.y_axis_keys?.[0] || result.columns[1] || result.columns[0];

    switch (activeChartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <ReLineChart data={result.rows} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede6d8" />
              <XAxis dataKey={xKey} stroke="#58341e" fontSize={12} tick={{ fill: '#58341e' }} />
              <YAxis stroke="#58341e" fontSize={12} tick={{ fill: '#58341e' }} />
              <Tooltip contentStyle={{ backgroundColor: '#25140a', borderColor: '#3d2212', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey={yKey} stroke="#8c5a3c" strokeWidth={3} dot={{ r: 4, fill: '#8c5a3c' }} activeDot={{ r: 6 }} />
            </ReLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <RePieChart>
              <Pie
                data={result.rows}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={50}
                paddingAngle={4}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {result.rows.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#25140a', borderColor: '#3d2212', borderRadius: '8px', color: '#fff' }} />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <ReAreaChart data={result.rows} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede6d8" />
              <XAxis dataKey={xKey} stroke="#58341e" fontSize={12} />
              <YAxis stroke="#58341e" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#25140a', borderColor: '#3d2212', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey={yKey} stroke="#8c5a3c" fill="#d9a774" fillOpacity={0.4} strokeWidth={2} />
            </ReAreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={result.rows} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede6d8" />
              <XAxis dataKey={xKey} stroke="#58341e" fontSize={12} />
              <YAxis stroke="#58341e" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#25140a', borderColor: '#3d2212', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Bar dataKey={yKey} fill="#8c5a3c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const totalPages = result ? Math.ceil(result.rows.length / rowsPerPage) : 1;
  const paginatedRows = result ? result.rows.slice((page - 1) * rowsPerPage, page * rowsPerPage) : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Natural Language Prompt Hero Card */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-brown-200 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-brown-600" />
          <h2 className="text-lg font-bold text-brown-950 tracking-tight">Ask Your Database in Natural English</h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleRunQuery(); }} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything (e.g., 'Show me customers who haven't ordered in the last 90 days')"
              className="w-full bg-beige-50 border border-beige-300 focus:border-brown-600 focus:ring-2 focus:ring-brown-500/20 rounded-xl px-5 py-3.5 pr-32 text-brown-950 placeholder-brown-400 text-sm font-semibold transition outline-none shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 bg-brown-700 hover:bg-brown-800 text-beige-50 font-bold text-xs rounded-lg transition flex items-center space-x-2 disabled:opacity-50 shadow-md shadow-brown-900/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Generate SQL</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Sample Question Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-brown-700 flex items-center space-x-1">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Try Asking:</span>
            </span>
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunQuery(q)}
                className="text-xs bg-beige-200/80 hover:bg-beige-300 text-brown-900 px-3 py-1.5 rounded-lg border border-beige-300 transition font-semibold"
              >
                {q}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Query Generation Error</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Query Results & Workspace */}
      {result && (
        <div className="space-y-6">
          {/* Generated SQL Studio Banner */}
          <div className="glass-card rounded-2xl p-5 space-y-3 border border-beige-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-brown-800">Generated Safe SQL SELECT Query</span>
                <span className="px-2.5 py-0.5 bg-emerald-800/10 border border-emerald-700/30 text-emerald-800 text-[11px] font-bold rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{result.guardrail_status}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(result.generated_sql)}
                  className="px-3 py-1.5 text-xs bg-beige-200 hover:bg-beige-300 text-brown-900 rounded-lg border border-beige-300 transition flex items-center space-x-1.5 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-brown-600" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => onOpenRawStudio && onOpenRawStudio(result.generated_sql)}
                  className="px-3 py-1.5 text-xs bg-brown-700 hover:bg-brown-800 text-beige-50 rounded-lg border border-brown-600 transition flex items-center space-x-1.5 font-semibold shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-amber-300" />
                  <span>Edit in Direct Studio</span>
                </button>
              </div>
            </div>

            {/* SQL Code Box - Dark Espresso Container */}
            <div className="glass-card-dark p-4 rounded-xl font-mono text-xs text-amber-200 overflow-x-auto">
              <pre>{result.generated_sql}</pre>
            </div>

            {/* Execution Metrics Bar */}
            <div className="flex items-center space-x-6 text-xs text-brown-700 pt-1 border-t border-beige-200">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-brown-600" />
                <span>Execution Time: <strong className="text-brown-950">{result.execution_time_ms} ms</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-brown-600" />
                <span>Records Returned: <strong className="text-brown-950">{result.record_count}</strong></span>
              </div>
            </div>
          </div>

          {/* AI Insights & Visualizations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Insights Card */}
            <div className="glass-card rounded-2xl p-5 space-y-4 lg:col-span-1 border border-beige-200">
              <div className="flex items-center space-x-2 pb-2 border-b border-beige-200">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-brown-950 text-sm">AI Business Insights</h3>
              </div>

              <p className="text-xs text-brown-800 leading-relaxed font-semibold">
                {result.explanation?.summary}
              </p>

              <div className="space-y-2.5 pt-2">
                {result.explanation?.insights?.map((ins, i) => (
                  <div key={i} className="p-3 bg-beige-50 border border-beige-200 rounded-xl text-xs text-brown-900 shadow-sm">
                    <span dangerouslySetInnerHTML={{ __html: ins.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brown-950 font-bold">$1</strong>').replace(/`(.*?)`/g, '<code class="text-brown-700 font-mono font-bold">$1</code>') }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recharts Data Visualization Card */}
            <div className="glass-card rounded-2xl p-5 lg:col-span-2 space-y-4 border border-beige-200">
              <div className="flex items-center justify-between pb-2 border-b border-beige-200">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-brown-700" />
                  <h3 className="font-bold text-brown-950 text-sm">
                    {result.visualization?.title || 'Data Visualization'}
                  </h3>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center space-x-1 bg-beige-200 p-1 rounded-xl border border-beige-300">
                  {[
                    { id: 'bar', icon: BarChart3, title: 'Bar Chart' },
                    { id: 'line', icon: LineChart, title: 'Line Chart' },
                    { id: 'pie', icon: PieChart, title: 'Pie Chart' },
                    { id: 'area', icon: AreaChart, title: 'Area Chart' }
                  ].map((ct) => {
                    const Icon = ct.icon;
                    return (
                      <button
                        key={ct.id}
                        onClick={() => setActiveChartType(ct.id)}
                        className={`p-1.5 rounded-lg transition ${
                          activeChartType === ct.id ? 'bg-brown-700 text-beige-50 shadow-sm' : 'text-brown-700 hover:text-brown-950'
                        }`}
                        title={ct.title}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chart Render Area */}
              <div className="pt-2">
                {renderChart()}
              </div>
            </div>
          </div>

          {/* Raw Data Table Card */}
          <div className="glass-card rounded-2xl p-5 space-y-4 border border-beige-200">
            <div className="flex items-center justify-between pb-3 border-b border-beige-200">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-brown-700" />
                <h3 className="font-bold text-brown-950 text-sm">Execution Result Data Grid</h3>
                <span className="text-xs text-brown-600 font-semibold">({result.record_count} total rows)</span>
              </div>

              <button
                onClick={exportCSV}
                className="px-3.5 py-1.5 bg-brown-700 hover:bg-brown-800 text-beige-50 text-xs font-bold rounded-xl border border-brown-600 transition flex items-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Table Element */}
            <div className="overflow-x-auto border border-beige-200 rounded-xl">
              <table className="w-full text-left text-xs text-brown-900">
                <thead className="bg-beige-200/80 text-brown-950 uppercase font-bold text-[11px] tracking-wider border-b border-beige-300">
                  <tr>
                    {result.columns.map((col, idx) => (
                      <th key={idx} className="px-4 py-3 font-bold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-200 bg-white font-mono">
                  {paginatedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-beige-100/60 transition">
                      {result.columns.map((col, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-brown-950 font-medium">
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-brown-400 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-brown-700 pt-2 font-medium">
                <span>Showing page <strong className="text-brown-950 font-bold">{page}</strong> of <strong className="text-brown-950 font-bold">{totalPages}</strong></span>
                <div className="flex space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 bg-beige-200 hover:bg-beige-300 disabled:opacity-40 text-brown-900 font-semibold rounded border border-beige-300 transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 bg-beige-200 hover:bg-beige-300 disabled:opacity-40 text-brown-900 font-semibold rounded border border-beige-300 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
