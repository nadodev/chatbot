import { useState, useEffect, useCallback } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ChatSource {
  id: string;
  type: string;
  name: string;
  content: string;
  createdAt: string;
}

interface DbTable {
  name: string;
  columns: string[];
}

interface ChatSourcesProps {
  chatId: string;
  onSourceAdded?: () => void;
  onSourceRemoved?: () => void;
}

export default function ChatSources({ chatId, onSourceAdded, onSourceRemoved }: ChatSourcesProps) {
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dbConnection, setDbConnection] = useState('');
  const [processingDb, setProcessingDb] = useState(false);
  const [dbTables, setDbTables] = useState<DbTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [showTableSelector, setShowTableSelector] = useState(false);

  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}/sources`);
      if (!response.ok) throw new Error('Failed to fetch sources');
      const data = await response.json();
      setSources(data);
    } catch (error) {
      setError('Failed to load sources');
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      // Process URL
      const processResponse = await fetch('/api/process-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl }),
      });

      if (!processResponse.ok) throw new Error('Failed to process URL');
      const { content } = await processResponse.json();

      // Add source
      const addResponse = await fetch(`/api/chats/${chatId}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'url',
          name: newUrl,
          content,
        }),
      });

      if (!addResponse.ok) throw new Error('Failed to add source');
      await fetchSources();
      setNewUrl('');
      onSourceAdded?.();
    } catch (error) {
      setError('Failed to add URL source');
      console.error('Error adding URL source:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError(null); // Clear previous errors
    
    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const { filename } = await uploadResponse.json();

      // Process file
      const processResponse = await fetch('/api/process-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || 'Failed to process file');
      }
      
      const { content } = await processResponse.json();

      // Add source
      const addResponse = await fetch(`/api/chats/${chatId}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'file',
          name: file.name,
          content,
        }),
      });

      if (!addResponse.ok) throw new Error('Failed to add source');
      await fetchSources();
      onSourceAdded?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add file source');
      console.error('Error adding file source:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDbConnectClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbConnection) return;

    setProcessingDb(true);
    setError(null);
    try {
      // Get database tables
      const response = await fetch('/api/process-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: dbConnection }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to database');
      }
      
      const { tables } = await response.json();
      setDbTables(tables);
      setShowTableSelector(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect to database');
      console.error('Error connecting to database:', error);
    } finally {
      setProcessingDb(false);
    }
  };

  const handleDatabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbConnection || selectedTables.length === 0) return;

    setProcessingDb(true);
    setError(null);
    try {
      // Get database schema and sample data for selected tables
      const response = await fetch('/api/process-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connectionString: dbConnection,
          tables: selectedTables
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process database tables');
      }
      
      const { schema } = await response.json();

      // Add source
      const addResponse = await fetch(`/api/chats/${chatId}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'database',
          name: `Database: ${dbConnection.split('@')[1] || dbConnection} (${selectedTables.join(', ')})`,
          content: JSON.stringify(schema),
        }),
      });

      if (!addResponse.ok) throw new Error('Failed to add database source');
      
      await fetchSources();
      setDbConnection('');
      setSelectedTables([]);
      setShowTableSelector(false);
      onSourceAdded?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add database source');
      console.error('Error adding database source:', error);
    } finally {
      setProcessingDb(false);
    }
  };

  const toggleTableSelection = (tableName: string) => {
    setSelectedTables(prevSelected => 
      prevSelected.includes(tableName)
        ? prevSelected.filter(name => name !== tableName)
        : [...prevSelected, tableName]
    );
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/sources?sourceId=${sourceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete source');
      await fetchSources();
      onSourceRemoved?.();
    } catch (error) {
      setError('Failed to delete source');
      console.error('Error deleting source:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading sources...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Knowledge Base</h3>
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploadingFile}
              accept=".pdf,.doc,.docx,.txt,.csv"
            />
            <span className="flex items-center">
              <PlusIcon className="w-5 h-5 mr-1" />
              {uploadingFile ? 'Uploading...' : 'Upload File'}
            </span>
          </label>
        </div>
      </div>

      <form onSubmit={handleUrlSubmit} className="flex space-x-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Add URL source..."
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add URL
        </button>
      </form>

      {!showTableSelector ? (
        <form onSubmit={handleDbConnectClick} className="flex space-x-2">
          <input
            type="text"
            value={dbConnection}
            onChange={(e) => setDbConnection(e.target.value)}
            placeholder="Database connection string..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={processingDb}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {processingDb ? 'Connecting...' : 'Connect Database'}
          </button>
        </form>
      ) : (
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Select Tables from {dbConnection.split('@')[1] || dbConnection}</h4>
            <button
              type="button"
              onClick={() => setShowTableSelector(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {dbTables.length > 0 ? (
              <div className="space-y-2">
                {dbTables.map(table => (
                  <div key={table.name} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`table-${table.name}`}
                      checked={selectedTables.includes(table.name)}
                      onChange={() => toggleTableSelection(table.name)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`table-${table.name}`} className="ml-2 block text-sm text-gray-900">
                      {table.name} ({table.columns.length} columns)
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No tables found or still loading...
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDatabaseSubmit}
              disabled={processingDb || selectedTables.length === 0}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {processingDb ? 'Adding...' : 'Add Selected Tables'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="space-y-2">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
          >
            <div>
              <div className="font-medium">{source.name}</div>
              <div className="text-sm text-gray-500">
                {source.type === 'url' ? 'URL' : source.type === 'file' ? 'File' : 'Database'} • Added{' '}
                {new Date(source.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => handleDeleteSource(source.id)}
              className="text-red-500 hover:text-red-600"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}

        {sources.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No sources added yet. Add URLs, upload files, or connect databases to build your knowledge base.
          </div>
        )}
      </div>
    </div>
  );
} 