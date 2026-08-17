const API_BASE = 'http://127.0.0.1:8000/api';

export async function fetchSchema() {
  const res = await fetch(`${API_BASE}/schema/`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch schema' }));
    throw new Error(err.detail || 'Failed to fetch schema');
  }
  return res.json();
}

export async function executeNLQuery(question, conversationHistory = []) {
  const res = await fetch(`${API_BASE}/query/generate-and-execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, conversation_history: conversationHistory })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error executing query');
  }
  return data;
}

export async function executeRawSQL(sql, question = 'Manual SQL') {
  const res = await fetch(`${API_BASE}/query/execute-raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, question })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'SQL Error');
  }
  return data;
}

export async function autoFixSQL(sql, error) {
  const res = await fetch(`${API_BASE}/query/autofix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, error })
  });
  return res.json();
}

export async function fetchConnections() {
  const res = await fetch(`${API_BASE}/connections/`);
  return res.json();
}

export async function testConnection(dbType, connectionString) {
  const res = await fetch(`${API_BASE}/connections/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ db_type: dbType, connection_string: connectionString })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Connection test failed');
  }
  return data;
}

export async function createConnection(name, dbType, connectionString, set_active = true) {
  const res = await fetch(`${API_BASE}/connections/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, db_type: dbType, connection_string: connectionString, set_active })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to create connection');
  }
  return data;
}

export async function activateConnection(id) {
  const res = await fetch(`${API_BASE}/connections/${id}/activate`, { method: 'POST' });
  return res.json();
}

export async function fetchHistory(limit = 50) {
  const res = await fetch(`${API_BASE}/history/?limit=${limit}`);
  return res.json();
}
