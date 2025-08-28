import React, { useState } from 'react';
import { BarChart3, Download, Filter, TrendingUp, Users, MessageSquare, Calendar } from 'lucide-react';

export function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'teams', label: 'Equipes', icon: Users },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare }
  ];

  const exportData = () => {
    // In a real app, this would generate and download a CSV file
    alert('Relatório exportado com sucesso!');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Feedbacks</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-xs text-green-600 mt-1">+12% vs mês anterior</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">8.4</p>
              <p className="text-xs text-green-600 mt-1">+0.3 vs mês anterior</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">892</p>
              <p className="text-xs text-green-600 mt-1">+5% vs mês anterior</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Resposta</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-xs text-green-600 mt-1">+2% vs mês anterior</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência de Feedbacks</h3>
          <div className="space-y-4">
            {[
              { month: 'Jan', feedbacks: 85, rating: 8.2 },
              { month: 'Fev', feedbacks: 92, rating: 8.1 },
              { month: 'Mar', feedbacks: 108, rating: 8.3 },
              { month: 'Abr', feedbacks: 96, rating: 8.5 },
              { month: 'Mai', feedbacks: 115, rating: 8.4 },
              { month: 'Jun', feedbacks: 127, rating: 8.6 }
            ].map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{item.feedbacks} feedbacks</span>
                  <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Tipo</h3>
          <div className="space-y-4">
            {[
              { type: 'Desempenho', count: 456, percentage: 36, color: 'bg-blue-500' },
              { type: 'Comportamento', count: 323, percentage: 26, color: 'bg-green-500' },
              { type: 'Projeto', count: 289, percentage: 23, color: 'bg-purple-500' },
              { type: '360°', count: 179, percentage: 15, color: 'bg-orange-500' }
            ].map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                  <span className="text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Relatório de Usuários</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 text-sm font-medium text-gray-700">Usuário</th>
              <th className="text-left py-3 text-sm font-medium text-gray-700">Feedbacks Dados</th>
              <th className="text-left py-3 text-sm font-medium text-gray-700">Feedbacks Recebidos</th>
              <th className="text-left py-3 text-sm font-medium text-gray-700">Avaliação Média</th>
              <th className="text-left py-3 text-sm font-medium text-gray-700">Última Atividade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: 'Sarah Johnson', given: 23, received: 18, avgRating: 8.9, lastActivity: '2 horas atrás' },
              { name: 'Michael Chen', given: 15, received: 24, avgRating: 8.6, lastActivity: '4 horas atrás' },
              { name: 'Emma Davis', given: 12, received: 19, avgRating: 8.7, lastActivity: '1 dia atrás' }
            ].map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-900">{user.name}</td>
                <td className="py-3 text-gray-600">{user.given}</td>
                <td className="py-3 text-gray-600">{user.received}</td>
                <td className="py-3">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{user.avgRating}</span>
                  </div>
                </td>
                <td className="py-3 text-sm text-gray-500">{user.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Relatórios e Análises</h2>
          <p className="text-sm text-gray-600">Análise detalhada do desempenho e atividade</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="last7days">Últimos 7 dias</option>
            <option value="last30days">Últimos 30 dias</option>
            <option value="last90days">Últimos 90 dias</option>
            <option value="lastyear">Último ano</option>
          </select>
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'teams' && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Relatório de equipes em desenvolvimento</p>
            </div>
          )}
          {activeTab === 'feedbacks' && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Relatório de feedbacks em desenvolvimento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}