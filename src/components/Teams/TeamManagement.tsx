import { useState, useEffect } from 'react';
import { Plus, Users, Crown, Star, Edit, Eye, Trash2 } from 'lucide-react';
import { Team } from '@/Types';
import { TeamModal } from './TeamModal';

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/teams');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (teamData: Partial<Team> & { managerId?: string; memberIds?: string[] }) => {
    const method = modalMode === 'create' ? 'POST' : 'PUT';
    const url = modalMode === 'create' ? 'http://localhost:3001/api/teams' : `http://localhost:3001/api/teams/${selectedTeam?.id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        throw new Error('Failed to save team');
      }

      const savedTeam = await response.json();

      if (modalMode === 'create') {
        setTeams([...teams, savedTeam]);
      } else {
        setTeams(teams.map(t => t.id === savedTeam.id ? savedTeam : t));
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/teams/${teamId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete team');
        }
        setTeams(teams.filter(t => t.id !== teamId));
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gestão de Equipes</h2>
          <p className="text-sm text-gray-600">{filteredTeams.length} equipes encontradas</p>
        </div>
        <button
          onClick={handleCreateTeam}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Equipe
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar equipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      team.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {team.status === 'active' ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewTeam(team)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditTeam(team)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Gestor:</span>
                  <div className="flex items-center space-x-1">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">{team.manager?.name || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Membros:</span>
                  <span className="font-medium text-gray-900">{team.members?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Criada em:</span>
                  <span className="text-gray-700">{new Date(team.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-gray-600">Produtividade:</span>
                  </div>
                  <span className="font-medium text-green-600">87%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTeam}
        team={selectedTeam}
        mode={modalMode}
      />
    </div>
  );
}