import React, { useState } from 'react';
import { Database, Search, Table, Key, Network, Info, Eye } from 'lucide-react';

export default function SchemaExplorer({ schema }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('inspector'); // 'inspector' or 'erd'

  if (!schema || !schema.tables) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-brown-600">
        <Database className="w-12 h-12 text-brown-400 mb-3 animate-pulse" />
        <p className="text-sm font-bold">Loading database schema metadata...</p>
      </div>
    );
  }

  const filteredTables = schema.tables.filter(t => 
    t.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTableData = selectedTable 
    ? schema.tables.find(t => t.table_name === selectedTable)
    : schema.tables[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header Banner & Mode Switcher */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-beige-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brown-700 text-amber-200 rounded-xl shadow-sm">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brown-950 tracking-tight">Database Schema & Relational Explorer</h2>
            <p className="text-xs text-brown-600">
              Discovered <strong className="text-brown-950 font-bold">{schema.total_tables} tables</strong> with auto-extracted primary & foreign key relationships.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-beige-200 p-1 rounded-xl border border-beige-300">
          <button
            onClick={() => setViewMode('inspector')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              viewMode === 'inspector' ? 'bg-brown-700 text-beige-50 shadow-sm' : 'text-brown-700 hover:text-brown-950'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table Inspector</span>
          </button>
          <button
            onClick={() => setViewMode('erd')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              viewMode === 'erd' ? 'bg-brown-700 text-beige-50 shadow-sm' : 'text-brown-700 hover:text-brown-950'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Visual ER Diagram</span>
          </button>
        </div>
      </div>

      {viewMode === 'inspector' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table Directory Sidebar */}
          <div className="glass-card rounded-2xl p-4 space-y-4 border border-beige-200 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-brown-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-beige-50 border border-beige-300 rounded-xl pl-9 pr-4 py-2 text-xs text-brown-950 placeholder-brown-400 focus:outline-none focus:border-brown-600 font-semibold"
              />
            </div>

            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {filteredTables.map((t) => {
                const isSelected = (activeTableData?.table_name === t.table_name);
                return (
                  <button
                    key={t.table_name}
                    onClick={() => setSelectedTable(t.table_name)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-brown-800 text-beige-50 shadow-sm'
                        : 'text-brown-800 hover:bg-beige-200/80 hover:text-brown-950'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Table className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-brown-600'}`} />
                      <span className="font-bold">{t.table_name}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                      isSelected ? 'bg-brown-900 text-amber-200' : 'bg-beige-200 text-brown-700'
                    }`}>
                      {t.row_count} rows
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Details Inspector */}
          {activeTableData && (
            <div className="lg:col-span-2 space-y-6">
              {/* Table Summary Card */}
              <div className="glass-card rounded-2xl p-5 space-y-4 border border-beige-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-beige-200">
                  <div className="flex items-center space-x-3">
                    <Table className="w-5 h-5 text-brown-700" />
                    <div>
                      <h3 className="font-bold text-brown-950 text-base">{activeTableData.table_name}</h3>
                      <p className="text-xs text-brown-600 font-semibold">Total Columns: {activeTableData.columns.length} | Rows: {activeTableData.row_count}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-beige-200 text-brown-900 text-xs font-mono font-bold rounded-lg border border-beige-300">
                    Engine: {schema.database_type.toUpperCase()}
                  </span>
                </div>

                {/* Column Schema Table */}
                <div className="overflow-x-auto border border-beige-200 rounded-xl">
                  <table className="w-full text-left text-xs text-brown-900">
                    <thead className="bg-beige-200/80 text-brown-950 uppercase font-bold text-[11px] border-b border-beige-300">
                      <tr>
                        <th className="px-4 py-3">Column Name</th>
                        <th className="px-4 py-3">Data Type</th>
                        <th className="px-4 py-3">Key Constraint</th>
                        <th className="px-4 py-3">Nullable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-200 font-mono bg-white">
                      {activeTableData.columns.map((col, idx) => (
                        <tr key={idx} className="hover:bg-beige-100/60">
                          <td className="px-4 py-2.5 font-bold text-brown-950 flex items-center space-x-2">
                            {col.primary_key && <Key className="w-3.5 h-3.5 text-amber-600" />}
                            <span>{col.name}</span>
                          </td>
                          <td className="px-4 py-2.5 text-brown-700 font-bold">{col.type}</td>
                          <td className="px-4 py-2.5">
                            {col.primary_key ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold rounded">
                                PRIMARY KEY
                              </span>
                            ) : (
                              <span className="text-brown-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-brown-600 font-semibold">{col.nullable ? 'YES' : 'NO'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Rows Preview */}
              {activeTableData.sample_data && activeTableData.sample_data.length > 0 && (
                <div className="glass-card rounded-2xl p-5 space-y-3 border border-beige-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-brown-700" />
                    <h4 className="font-bold text-brown-950 text-xs uppercase tracking-wider">Sample Data Preview (Top 3 Records)</h4>
                  </div>

                  <div className="overflow-x-auto border border-beige-200 rounded-xl">
                    <table className="w-full text-left text-xs text-brown-900 font-mono">
                      <thead className="bg-beige-200/80 text-brown-950 border-b border-beige-300">
                        <tr>
                          {activeTableData.columns.map((col, i) => (
                            <th key={i} className="px-3 py-2 text-[11px] font-bold">{col.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige-200 bg-white">
                        {activeTableData.sample_data.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {activeTableData.columns.map((col, cIdx) => (
                              <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-brown-950 font-medium">
                                {row[col.name] !== null ? String(row[col.name]) : 'null'}
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
          )}
        </div>
      ) : (
        /* Visual ER Diagram Node Graph */
        <div className="glass-card rounded-2xl p-6 border border-beige-200 space-y-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-4 border-b border-beige-200">
            <Info className="w-4 h-4 text-brown-700" />
            <p className="text-xs text-brown-800 font-semibold">
              Interactive Entity-Relationship map showing discovered foreign key constraints and relational paths.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schema.tables.map((tbl) => (
              <div key={tbl.table_name} className="bg-beige-50 border border-beige-300 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-beige-300">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-brown-700" />
                    <span className="font-bold text-brown-950 text-sm">{tbl.table_name}</span>
                  </div>
                  <span className="text-[10px] text-brown-600 font-mono font-bold">{tbl.row_count} rows</span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  {tbl.columns.map((col, cIdx) => (
                    <div key={cIdx} className="flex items-center justify-between text-brown-700 hover:text-brown-950">
                      <div className="flex items-center space-x-1.5">
                        {col.primary_key && <Key className="w-3 h-3 text-amber-600 shrink-0" />}
                        <span className={col.primary_key ? 'text-amber-800 font-bold' : 'font-medium'}>{col.name}</span>
                      </div>
                      <span className="text-[10px] text-brown-500 font-semibold">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
