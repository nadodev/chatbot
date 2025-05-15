import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription?: {
    endDate: Date;
    isActive: boolean;
  };
}

interface UserManagementProps {
  token: string;
}

export default function UserManagement({ token }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [daysToAdd, setDaysToAdd] = useState(7);

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      console.log('Fazendo requisição com token:', token);
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao carregar usuários');
      }

      setUsers(data);
      setError('');
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const addPremiumDays = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ days: daysToAdd }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao adicionar dias premium');
      }
      
      await fetchUsers(); // Recarregar lista de usuários
      setSelectedUser(null);
      setError('');
    } catch (error) {
      console.error('Erro ao adicionar dias premium:', error);
      setError('Erro ao adicionar dias premium');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600 text-center mb-4">{error}</div>
        <button
          onClick={fetchUsers}
          className="mx-auto block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Gerenciamento de Usuários</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Premium
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.subscription?.isActive ? (
                    <span className="text-green-600">
                      Ativo até {format(new Date(user.subscription.endDate), 'dd/MM/yyyy')}
                    </span>
                  ) : (
                    <span className="text-red-600">Inativo</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {selectedUser === user.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={daysToAdd}
                        onChange={(e) => setDaysToAdd(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border rounded"
                        min="1"
                      />
                      <button
                        onClick={() => addPremiumDays(user.id)}
                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedUser(user.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Adicionar Dias
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 