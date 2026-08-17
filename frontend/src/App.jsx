import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QueryStudio from './components/QueryStudio';
import SchemaExplorer from './components/SchemaExplorer';
import RawSqlStudio from './components/RawSqlStudio';
import ConnectionsHub from './components/ConnectionsHub';
import QueryHistory from './components/QueryHistory';
import { fetchSchema } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [schema, setSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [initialSqlForStudio, setInitialSqlForStudio] = useState('');

  useEffect(() => {
    loadSchemaData();
  }, []);

  const loadSchemaData = async () => {
    setLoadingSchema(true);
    try {
      const data = await fetchSchema();
      setSchema(data);
    } catch (err) {
      console.error('Failed to load schema:', err);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleOpenRawStudio = (sql) => {
    setInitialSqlForStudio(sql);
    setActiveTab('raw');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-beige-100 text-brown-900">
      {/* Navbar Header */}
      <Navbar
        activeConn={schema?.active_connection}
        onOpenConnections={() => setActiveTab('connections')}
        onRefreshSchema={loadSchemaData}
        loadingSchema={loadingSchema}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-beige-100">
          {activeTab === 'studio' && (
            <QueryStudio onOpenRawStudio={handleOpenRawStudio} />
          )}

          {activeTab === 'schema' && (
            <SchemaExplorer schema={schema} />
          )}

          {activeTab === 'raw' && (
            <RawSqlStudio initialSql={initialSqlForStudio} />
          )}

          {activeTab === 'connections' && (
            <ConnectionsHub onConnectionChanged={loadSchemaData} />
          )}

          {activeTab === 'history' && (
            <QueryHistory onRunHistoricalQuery={handleOpenRawStudio} />
          )}
        </main>
      </div>
    </div>
  );
}
