import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { Team, User } from '../../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (team: Partial<Team> & { managerId?: string; memberIds?: string[] }) => void;
  team: Team | null;
  mode: 'create' | 'edit' | 'view';
}

export function TeamModal({ isOpen, onClose, onSave, team, mode }: TeamModalProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
    status: 'active' as 'active' | 'inactive',
    memberIds: [] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/users');
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          setAllUsers(await response.json());
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (team && mode !== 'create') {
        setFormData({
          name: team.name,
          description: team.description,
          managerId: team.managerId,
          status: team.status,
          memberIds: team.members?.map(m => m.id) || [],
        });
      } else {
        setFormData({
          name: '',
          description: '',
          managerId: '',
          status: 'active',
          memberIds: [],
        });
      }
    }
  }, [team, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  const isReadonly = mode === 'view';
  const title = mode === 'create' ? 'Nova Equipe' : mode === 'edit' ? 'Editar Equipe' : 'Detalhes da Equipe';


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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Equipe
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              required
              readOnly={isReadonly}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gestor da Equipe
              </label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
                disabled={isReadonly}
              >
                <option value="">Selecione um gestor</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isReadonly}
              >
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membros da Equipe
            </label>
            <select
              multiple
              value={formData.memberIds}
              onChange={(e) => setFormData({ ...formData, memberIds: Array.from(e.target.selectedOptions, option => option.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
              disabled={isReadonly}
            >
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {mode === 'view' && team && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Membros da Equipe ({team.members?.length || 0})
                </h4>
                <div className="space-y-2">
                  {team.members?.map((member: User) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {member.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">87%</p>
                  <p className="text-sm text-blue-600">Produtividade</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">8.6</p>
                  <p className="text-sm text-green-600">Avaliação Média</p>
                </div>
              </div>
            </div>
          )}

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
                {mode === 'create' ? 'Criar Equipe' : 'Salvar Alterações'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}