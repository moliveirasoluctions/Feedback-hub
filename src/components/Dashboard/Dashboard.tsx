import React from 'react';
import { Users, MessageSquare, TrendingUp, Star, BarChart3, Clock } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useAuth } from '../../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total de Usuários',
      value: 1247,
      change: '+12% este mês',
      changeType: 'increase' as const,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Feedbacks Ativos',
      value: 89,
      change: '+23% esta semana',
      changeType: 'increase' as const,
      icon: MessageSquare,
      color: 'green' as const
    },
    {
      title: 'Avaliação Média',
      value: '8.4',
      change: '+0.3 este mês',
      changeType: 'increase' as const,
      icon: Star,
      color: 'orange' as const
    },
    {
      title: 'Equipes Ativas',
      value: 34,
      change: '+2 novas equipes',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'purple' as const
    }
  ];

  const recentFeedbacks = [
    {
      id: 1,
      giver: 'Ana Silva',
      receiver: 'João Santos',
      type: 'Desempenho',
      rating: 9,
      timestamp: '2h atrás'
    },
    {
      id: 2,
      giver: 'Carlos Oliveira',
      receiver: 'Maria Costa',
      type: 'Comportamento',
      rating: 8,
      timestamp: '4h atrás'
    },
    {
      id: 3,
      giver: 'Pedro Lima',
      receiver: 'Ana Silva',
      type: 'Projeto',
      rating: 10,
      timestamp: '6h atrás'
    }
  ];

  const topPerformers = [
    { name: 'Maria Costa', avgRating: 9.2, feedbacks: 12 },
    { name: 'João Santos', avgRating: 8.9, feedbacks: 15 },
    { name: 'Ana Silva', avgRating: 8.7, feedbacks: 18 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Feedbacks Recentes</h3>
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentFeedbacks.map((feedback) => (
              <div key={feedback.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{feedback.giver}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-700">{feedback.receiver}</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-600">{feedback.type}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{feedback.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{feedback.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-600">{performer.feedbacks} feedbacks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{performer.avgRating}</p>
                  <p className="text-sm text-gray-500">média</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {user?.role === 'user' && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Suas Estatísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-80">Feedbacks Recebidos</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-80">Avaliação Média</p>
              <p className="text-2xl font-bold">8.6</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-80">Feedbacks Dados</p>
              <p className="text-2xl font-bold">15</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}