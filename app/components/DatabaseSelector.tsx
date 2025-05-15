"use client";

import { useState, useCallback, memo, useEffect } from 'react';

interface DbTable {
  name: string;
  columns: any[];
}

interface DatabaseSelectorProps {
  connectionString: string;
  selectedTables: string[];
  onConnectionStringChange: (value: string) => void;
  onTablesChange: (tables: string[]) => void;
  onConnectingChange?: (isConnecting: boolean) => void;
  initialDbName?: string;
  initialTables?: string[];
}

const DatabaseSelector = memo(function DatabaseSelector({
  connectionString,
  selectedTables,
  onConnectionStringChange,
  onTablesChange,
  onConnectingChange,
  initialDbName,
  initialTables = []
}: DatabaseSelectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbTables, setDbTables] = useState<DbTable[]>([]);
  const [showTableSelector, setShowTableSelector] = useState(false);

  useEffect(() => {
    if (initialDbName && initialTables.length > 0) {
      const tables = initialTables.map(name => ({
        name,
        columns: []
      }));
      setDbTables(tables);
      setShowTableSelector(true);
    }
  }, [initialDbName, initialTables]);

  useEffect(() => {
    if (!connectionString) {
      setShowTableSelector(false);
      setDbTables([]);
      setError(null);
    }
  }, [connectionString]);

  const handleConnectClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!connectionString) {
      setError('Por favor, insira uma string de conexão');
      return;
    }

    setIsConnecting(true);
    setError('');
    setDbTables([]);
    setShowTableSelector(false);

    try {
      console.log('🔌 Tentando conectar ao banco...');
      const response = await fetch('/api/database/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connectionString })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao conectar ao banco');
      }

      console.log('✅ Conexão bem sucedida:', data);
      
      if (data.tables && data.tables.length > 0) {
        const tables = data.tables.map((name: string) => ({
          name,
          columns: []
        }));
        setDbTables(tables);
        setShowTableSelector(true);
      } else {
        setError('Nenhuma tabela encontrada no banco de dados');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco:', error);
      setError(error instanceof Error ? error.message : 'Erro ao conectar ao banco');
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleTableSelection = useCallback((tableName: string) => {
    const newSelection = selectedTables.includes(tableName)
      ? selectedTables.filter(name => name !== tableName)
      : [...selectedTables, tableName];
    
    console.log('📋 Alteração na seleção de tabelas', {
      tableName,
      ação: selectedTables.includes(tableName) ? 'remover' : 'adicionar',
      novasSelecionadas: newSelection
    });
    
    onTablesChange(newSelection);
  }, [selectedTables, onTablesChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('✏️ String de conexão alterada');
    e.preventDefault();
    e.stopPropagation();
    onConnectionStringChange(e.target.value);
  }, [onConnectionStringChange]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('⌨️ Enter pressionado no input');
      e.preventDefault();
      e.stopPropagation();
      if (connectionString) {
        handleConnectClick(e as any);
      }
    }
  }, [connectionString, handleConnectClick]);

  const handleCloseSelector = useCallback((e: React.MouseEvent) => {
    console.log('❌ Fechando seletor de tabelas');
    e.preventDefault();
    e.stopPropagation();
    setShowTableSelector(false);
  }, []);

  console.log('🔄 Renderização do DatabaseSelector', {
    isConnecting,
    showTableSelector,
    numTables: dbTables.length,
    selectedTables,
    hasConnectionString: !!connectionString
  });

  return (
    <div 
      className="space-y-4"
      onClick={(e) => {
        console.log('🛡️ Clique interceptado no DatabaseSelector root');
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {!showTableSelector ? (
        <div 
          className="flex space-x-2"
          onClick={(e) => {
            console.log('🛡️ Clique interceptado no container do input');
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <input
            type="text"
            value={connectionString}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="mysql://user:password@host:port/database"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="button"
            onClick={handleConnectClick}
            disabled={isConnecting || !connectionString}
            className="bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 disabled:bg-violet-300"
          >
            {isConnecting ? 'Conectando...' : 'Conectar ao Banco'}
          </button>
        </div>
      ) : (
        <div 
          className="border rounded-md p-4 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-medium">
              Banco de Dados: {initialDbName || connectionString.split('@')[1]?.split('/')[1] || connectionString}
            </h4>
            <button
              type="button"
              onClick={handleCloseSelector}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            {dbTables.map(table => (
              <div 
                key={table.name} 
                className="flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  id={`table-${table.name}`}
                  checked={selectedTables.includes(table.name)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleTableSelection(table.name);
                  }}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor={`table-${table.name}`} 
                  className="ml-2 block text-sm text-gray-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  {table.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
});

export default DatabaseSelector; 