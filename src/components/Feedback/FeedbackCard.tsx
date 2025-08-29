import React from 'react';
import { Star, Clock, User, Edit, Eye, MessageSquare } from 'lucide-react';
import { Feedback } from '@/Types';

interface FeedbackCardProps {
  feedback: Feedback;
  onEdit: () => void;
  onView: () => void;
}

export function FeedbackCard({ feedback, onEdit, onView }: FeedbackCardProps) {
  const getTypeColor = (type: string) => {
    const colors = {
      performance: 'bg-blue-100 text-blue-800',
      behavior: 'bg-green-100 text-green-800',
      project: 'bg-purple-100 text-purple-800',
      '360': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || colors.performance;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      performance: 'Desempenho',
      behavior: 'Comportamento',
      project: 'Projeto',
      '360': '360°'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      in_review: 'Em análise',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">{feedback.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{feedback.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Ver detalhes"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
          {getTypeLabel(feedback.type)}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
          {getStatusLabel(feedback.status)}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
          {getPriorityLabel(feedback.priority)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{feedback.rating}/10</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4" />
            <span>{feedback.competencies.length} competências</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{new Date(feedback.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}