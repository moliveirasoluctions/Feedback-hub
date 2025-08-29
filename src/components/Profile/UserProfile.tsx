import React, { useState } from 'react';
import { Edit, Star, MessageSquare, TrendingUp, Calendar, Award } from 'lucide-react';
import { useAuth } from '@/Context/AuthContext';

export function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    position: user?.position || ''
  });

  const handleSave = () => {
    // In a real app, this would update the user profile
    setIsEditing(false);
  };

  const stats = [
    {
      label: 'Feedbacks Recebidos',
      value: 24,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      label: 'Feedbacks Dados',
      value: 15,
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      label: 'Avaliação Média',
      value: '8.6',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'Competências Avaliadas',
      value: 12,
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  const recentFeedbacks = [
    {
      id: 1,
      type: 'Desempenho',
      from: 'Sarah Johnson',
      rating: 9,
      title: 'Excelente trabalho no projeto Q4',
      date: '2024-12-20'
    },
    {
      id: 2,
      type: 'Comportamento',
      from: 'Michael Chen',
      rating: 8,
      title: 'Ótima colaboração em equipe',
      date: '2024-12-18'
    },
    {
      id: 3,
      type: 'Projeto',
      from: 'Emma Davis',
      rating: 10,
      title: 'Liderança exemplar no projeto Alpha',
      date: '2024-12-15'
    }
  ];

  const competencies = [
    { name: 'Liderança', rating: 8.7, feedbacks: 8 },
    { name: 'Comunicação', rating: 9.1, feedbacks: 12 },
    { name: 'Trabalho em Equipe', rating: 8.9, feedbacks: 10 },
    { name: 'Organização', rating: 8.5, feedbacks: 6 },
    { name: 'Adaptabilidade', rating: 8.8, feedbacks: 7 }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.position}</p>
              <p className="text-sm text-gray-500">{user?.department}</p>
              <div className="flex items-center space-x-1 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user?.role === 'admin' ? 'Administrador' : user?.role === 'manager' ? 'Gestor' : 'Usuário'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </button>
        </div>

        {isEditing && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedbacks Recentes</h3>
          <div className="space-y-4">
            {recentFeedbacks.map((feedback) => (
              <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{feedback.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>De: {feedback.from}</span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {feedback.type}
                    </span>
                    <span>{new Date(feedback.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competências</h3>
          <div className="space-y-4">
            {competencies.map((competency, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{competency.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">{competency.rating}</span>
                    <span className="text-xs text-gray-500">({competency.feedbacks} avaliações)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(competency.rating / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}