'use client';

import { useState } from 'react';

interface QueryResult {
  columns: string[];
  rows: any[];
}

export default function Home() {
  const [query, setQuery] = useState('SELECT * FROM customers LIMIT 10;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNaturalLanguage, setIsNaturalLanguage] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState<string | null>(null);
  const [convertingToSQL, setConvertingToSQL] = useState(false);

  const convertToSQL = async () => {
    setConvertingToSQL(true);
    setError(null);
    setGeneratedSQL(null);

    try {
      const response = await fetch('/api/nl-to-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error converting to SQL');
      }

      setGeneratedSQL(data.sql);
      setQuery(data.sql);
      setIsNaturalLanguage(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setConvertingToSQL(false);
    }
  };

  const executeQuery = async () => {
    // Si está en modo lenguaje natural, primero convertir a SQL
    if (isNaturalLanguage) {
      await convertToSQL();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error executing query');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = () => {
    setIsNaturalLanguage(!isNaturalLanguage);
    setGeneratedSQL(null);
    setError(null);
    if (!isNaturalLanguage) {
      // Cambiando a lenguaje natural
      setQuery('Muéstrame los 10 mejores clientes por volumen de compras');
    } else {
      // Cambiando a SQL
      setQuery('SELECT * FROM customers LIMIT 10;');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                PostgreSQL Query Interface
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Connected to Northwind Database via MCP Server
              </p>
            </div>
            
            {/* Toggle de modo */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
              <span className={`text-sm font-medium ${!isNaturalLanguage ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                SQL
              </span>
              <button
                onClick={handleModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isNaturalLanguage ? 'bg-green-600' : 'bg-blue-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isNaturalLanguage ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isNaturalLanguage ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                Natural
              </span>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="query" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {isNaturalLanguage ? 'Consulta en Lenguaje Natural' : 'Consulta SQL'}
            </label>
            {isNaturalLanguage && (
              <span className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                Powered by Claude
              </span>
            )}
          </div>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-40 p-4 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              isNaturalLanguage
                ? 'Escribe tu consulta en lenguaje natural... Ejemplo: "Muéstrame los 10 productos más caros" o "¿Cuántos clientes hay por país?"'
                : 'Enter your SQL query here... Ejemplo: SELECT * FROM customers LIMIT 10;'
            }
          />
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={executeQuery}
              disabled={(loading || convertingToSQL) || !query.trim()}
              className={`px-6 py-3 ${
                isNaturalLanguage
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2`}
            >
              {(loading || convertingToSQL) ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {convertingToSQL ? 'Convirtiendo...' : 'Ejecutando...'}
                </>
              ) : (
                <>
                  {isNaturalLanguage ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Convertir a SQL
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Ejecutar Consulta
                    </>
                  )}
                </>
              )}
            </button>

            {!isNaturalLanguage && generatedSQL && (
              <button
                onClick={() => {
                  setGeneratedSQL(null);
                  setIsNaturalLanguage(true);
                }}
                className="px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                Limpiar SQL Generado
              </button>
            )}
          </div>

          {generatedSQL && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">SQL Generado:</h4>
                  <pre className="text-xs font-mono text-green-900 dark:text-green-100 bg-white dark:bg-slate-800 p-3 rounded overflow-x-auto">
                    {generatedSQL}
                  </pre>
                  <button
                    onClick={async () => {
                      setGeneratedSQL(null);
                      await executeQuery();
                    }}
                    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Ejecutar este SQL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-300">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Query Results ({result.rows.length} rows)
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    {result.columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {result.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      {result.columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap"
                        >
                          {row[column] !== null && row[column] !== undefined
                            ? String(row[column])
                            : <span className="text-slate-400 italic">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!result && !error && !loading && (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <p className="text-slate-600 dark:text-slate-400">
              Enter a SQL query and click "Execute Query" to see results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
