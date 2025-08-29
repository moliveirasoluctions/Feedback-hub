import React, { useState } from 'react';
import { Shield, Filter, Search, Calendar, User, Activity } from 'lucide-react';
import { AuditLog } from '@/Types';

export function AuditLogs() {
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      userId: '1',
      action: 'CREATE_USER',
      resource: 'users',
      details: 'Criou usuário: Emma Davis (user@feedbackhub.com)',
      timestamp: '2024-12-25T10:30:00Z'
    },
    {
      id: '2',
      userId: '2',
      action: 'CREATE_FEEDBACK',
      resource: 'feedbacks',
      details: 'Criou feedback de desempenho para Sarah Johnson',
      timestamp: '2024-12-25T09:15:00Z'
    },
    {
      id: '3',
      userId: '1',
      action: 'UPDATE_TEAM',
      resource: 'teams',
      details: 'Atualizou equipe de Marketing: adicionou 2 novos membros',
      timestamp: '2024-12-24T16:45:00Z'
    },
    {
      id: '4',
      userId: '3',
      action: 'LOGIN',
      resource: 'auth',
      details: 'Login realizado com sucesso',
      timestamp: '2024-12-24T08:20:00Z'
    },
    {
      id: '5',
      userId: '1',
      action: 'DELETE_USER',
      resource: 'users',
      details: 'Removeu usuário: João Silva (joao@feedbackhub.com)',
      timestamp: '2024-12-23T14:10:00Z'
    },
    {
      id: '6',
      userId: '2',
      action: 'APPROVE_FEEDBACK',
      resource: 'feedbacks',
      details: 'Aprovou feedback de comportamento para Michael Chen',
      timestamp: '2024-12-23T11:30:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction.toUpperCase());
    const matchesUser = filterUser === 'all' || log.userId === filterUser;
    
    return matchesSearch && matchesAction && matchesUser;
  });

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
    if (action.includes('APPROVE')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CREATE') || action.includes('UPDATE')) return Activity;
    if (action.includes('DELETE')) return Shield;
    if (action.includes('LOGIN')) return User;
    return Activity;
  };

  const getUserName = (userId: string) => {
    const users = {
      '1': 'Sarah Johnson',
      '2': 'Michael Chen',
      '3': 'Emma Davis'
    };
    return users[userId as keyof typeof users] || 'Usuário Desconhecido';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Logs de Auditoria</h2>
          <p className="text-sm text-gray-600">{filteredLogs.length} registros encontrados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Sistema Seguro</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Todas as Ações</option>
                <option value="create">Criação</option>
                <option value="update">Atualização</option>
                <option value="delete">Exclusão</option>
                <option value="login">Login</option>
                <option value="approve">Aprovação</option>
              </select>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Todos os Usuários</option>
                <option value="1">Sarah Johnson</option>
                <option value="2">Michael Chen</option>
                <option value="3">Emma Davis</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => {
            const ActionIcon = getActionIcon(log.action);
            const { date, time } = formatTimestamp(log.timestamp);
            
            return (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getActionColor(log.action).replace('text-', 'bg-').replace('800', '100')}`}>
                    <ActionIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {getUserName(log.userId)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{date} às {time}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">{log.details}</p>
                    
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <span>Recurso: {log.resource}</span>
                      <span className="mx-2">•</span>
                      <span>ID: {log.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}