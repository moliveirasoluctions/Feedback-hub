import React from 'react';
import { 
  Home, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  UserCheck, 
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user, hasRole } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['admin', 'manager', 'user']
    },
    {
      id: 'feedback',
      label: 'Feedbacks',
      icon: MessageSquare,
      roles: ['admin', 'manager', 'user']
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      roles: ['admin']
    },
    {
      id: 'teams',
      label: 'Equipes',
      icon: UserCheck,
      roles: ['admin', 'manager']
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      roles: ['admin', 'manager']
    },
    {
      id: 'audit',
      label: 'Auditoria',
      icon: Shield,
      roles: ['admin']
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: Activity,
      roles: ['admin', 'manager', 'user']
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const filteredItems = menuItems.filter(item => 
    hasRole(item.roles as any)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FeedbackHub</h1>
            <p className="text-sm text-gray-500">Gestão de Feedback</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3">
          <img
            src={user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}