import React, { useState, useEffect } from 'react';
import { X, Star, Plus, Trash2 } from 'lucide-react';
import { Feedback, FeedbackType, Priority, CompetencyRating } from '@/Types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feedback: Partial<Feedback>) => void;
  feedback: Feedback | null;
  mode: 'create' | 'edit' | 'view';
}

export function FeedbackModal({ isOpen, onClose, onSave, feedback, mode }: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    type: 'performance' as FeedbackType,
    giverId: '1',
    receiverId: '',
    title: '',
    description: '',
    rating: 5,
    priority: 'medium' as Priority,
    competencies: [] as CompetencyRating[]
  });

  useEffect(() => {
    if (feedback && mode !== 'create') {
      setFormData({
        type: feedback.type,
        giverId: feedback.giverId,
        receiverId: feedback.receiverId,
        title: feedback.title,
        description: feedback.description,
        rating: feedback.rating,
        priority: feedback.priority,
        competencies: feedback.competencies
      });
    } else {
      setFormData({
        type: 'performance',
        giverId: '1',
        receiverId: '',
        title: '',
        description: '',
        rating: 5,
        priority: 'medium',
        competencies: []
      });
    }
  }, [feedback, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSave(formData);
    }
  };

  const addCompetency = () => {
    setFormData({
      ...formData,
      competencies: [
        ...formData.competencies,
        {
          competencyId: Date.now().toString(),
          competencyName: '',
          rating: 5,
          comments: ''
        }
      ]
    });
  };

  const updateCompetency = (index: number, field: keyof CompetencyRating, value: string | number) => {
    const updatedCompetencies = formData.competencies.map((comp, i) =>
      i === index ? { ...comp, [field]: value } : comp
    );
    setFormData({ ...formData, competencies: updatedCompetencies });
  };

  const removeCompetency = (index: number) => {
    setFormData({
      ...formData,
      competencies: formData.competencies.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  const isReadonly = mode === 'view';
  const title = mode === 'create' ? 'Novo Feedback' : mode === 'edit' ? 'Editar Feedback' : 'Detalhes do Feedback';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Feedback
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as FeedbackType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isReadonly}
              >
                <option value="performance">Desempenho</option>
                <option value="behavior">Comportamento</option>
                <option value="project">Projeto</option>
                <option value="360">360°</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isReadonly}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para (Usuário)
            </label>
            <select
              value={formData.receiverId}
              onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={isReadonly}
            >
              <option value="">Selecione um usuário</option>
              <option value="2">Michael Chen</option>
              <option value="3">Emma Davis</option>
              <option value="4">Robert Wilson</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              readOnly={isReadonly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              required
              readOnly={isReadonly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação Geral (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isReadonly}
              />
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-lg font-bold text-gray-900">{formData.rating}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Competências Específicas
              </label>
              {!isReadonly && (
                <button
                  type="button"
                  onClick={addCompetency}
                  className="inline-flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </button>
              )}
            </div>

            <div className="space-y-3">
              {formData.competencies.map((comp, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="text"
                      placeholder="Nome da competência"
                      value={comp.competencyName}
                      onChange={(e) => updateCompetency(index, 'competencyName', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      readOnly={isReadonly}
                    />
                    {!isReadonly && (
                      <button
                        type="button"
                        onClick={() => removeCompetency(index)}
                        className="ml-2 p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Avaliação (1-10)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={comp.rating}
                          onChange={(e) => updateCompetency(index, 'rating', parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          disabled={isReadonly}
                        />
                        <span className="text-sm font-medium text-gray-700 w-8">{comp.rating}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Comentários
                      </label>
                      <textarea
                        value={comp.comments || ''}
                        onChange={(e) => updateCompetency(index, 'comments', e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="Comentários opcionais..."
                        readOnly={isReadonly}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isReadonly && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === 'create' ? 'Criar Feedback' : 'Salvar Alterações'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}