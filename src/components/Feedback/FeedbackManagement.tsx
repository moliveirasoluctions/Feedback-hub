import React, { useState } from 'react';
import { Plus, Filter, Star, Clock, User, MessageSquare } from 'lucide-react';
import { Feedback, FeedbackType, FeedbackStatus, Priority } from '../../types';
import { FeedbackModal } from './FeedbackModal';
import { FeedbackCard } from './FeedbackCard';

export function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: '1',
      type: 'performance',
      giverId: '1',
      receiverId: '3',
      title: 'Excelente desempenho no projeto Q4',
      description: 'Emma demonstrou habilidades excepcionais de gestão e entrega de resultados no último trimestre.',
      rating: 9,
      priority: 'high',
      status: 'approved',
      competencies: [
        { competencyId: '1', competencyName: 'Liderança', rating: 8, comments: 'Liderou muito bem a equipe' },
        { competencyId: '2', competencyName: 'Comunicação', rating: 9, comments: 'Comunicação clara e efetiva' }
      ],
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-22T14:30:00Z'
    },
    {
      id: '2',
      type: 'behavior',
      giverId: '2',
      receiverId: '1',
      title: 'Colaboração exemplar',
      description: 'Sarah sempre demonstra um comportamento colaborativo e prestativo com toda a equipe.',
      rating: 8,
      priority: 'medium',
      status: 'pending',
      competencies: [
        { competencyId: '3', competencyName: 'Trabalho em equipe', rating: 9 },
        { competencyId: '4', competencyName: 'Adaptabilidade', rating: 8 }
      ],
      createdAt: '2024-12-22T15:00:00Z',
      updatedAt: '2024-12-22T15:00:00Z'
    },
    {
      id: '3',
      type: 'project',
      giverId: '3',
      receiverId: '2',
      title: 'Gestão eficiente do projeto Alpha',
      description: 'Michael coordenou perfeitamente o projeto Alpha, entregando antes do prazo e dentro do orçamento.',
      rating: 10,
      priority: 'high',
      status: 'in_review',
      competencies: [
        { competencyId: '5', competencyName: 'Gestão de projetos', rating: 10 },
        { competencyId: '6', competencyName: 'Organização', rating: 9 }
      ],
      createdAt: '2024-12-21T09:30:00Z',
      updatedAt: '2024-12-23T11:00:00Z'
    }
  ]);

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || feedback.type === filterType;
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateFeedback = () => {
    setSelectedFeedback(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleSaveFeedback = (feedbackData: Partial<Feedback>) => {
    if (modalMode === 'create') {
      const newFeedback: Feedback = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        ...feedbackData as Feedback
      };
      setFeedbacks([newFeedback, ...feedbacks]);
    } else if (modalMode === 'edit' && selectedFeedback) {
      setFeedbacks(feedbacks.map(f => 
        f.id === selectedFeedback.id 
          ? { ...f, ...feedbackData, updatedAt: new Date().toISOString() }
          : f
      ));
    }
    setIsModalOpen(false);
  };

  const getTypeLabel = (type: FeedbackType) => {
    const labels = {
      performance: 'Desempenho',
      behavior: 'Comportamento',
      project: 'Projeto',
      '360': '360°'
    };
    return labels[type];
  };

  const getStatusLabel = (status: FeedbackStatus) => {
    const labels = {
      pending: 'Pendente',
      in_review: 'Em análise',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    return labels[status];
  };

  if (!isModalOpen) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sistema de Feedback</h2>
            <p className="text-sm text-gray-600">{filteredFeedbacks.length} feedbacks encontrados</p>
          </div>
          <button
            onClick={handleCreateFeedback}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Feedback
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar feedbacks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FeedbackType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Todos os Tipos</option>
                <option value="performance">Desempenho</option>
                <option value="behavior">Comportamento</option>
                <option value="project">Projeto</option>
                <option value="360">360°</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="in_review">Em análise</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                onEdit={() => handleEditFeedback(feedback)}
                onView={() => handleViewFeedback(feedback)}
              />
            ))}
          </div>
        </div>

        <FeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFeedback}
          feedback={selectedFeedback}
          mode={modalMode}
        />
      </div>
    );
  }

  return null;
}