import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/Context/AuthContext';
import { LoginForm } from '@/components/Auth/LoginForm';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { UserManagement } from '@/components/Users/UserManagemenr';
import { FeedbackManagement } from '@/components/Feedback/FeedbackManagement';
import { TeamManagement } from '@/components/Teams/TeamManagement';
import { Reports } from '@/components/Reports/Reports';
import { UserProfile } from '@/components/Profile/UserProfile';
import { AuditLogs } from '@/components/audit/AuditLogs';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const getSectionTitle = (section: string) => {
    const titles = {
      dashboard: 'Dashboard',
      feedback: 'Sistema de Feedback',
      users: 'Gestão de Usuários',
      teams: 'Gestão de Equipes',
      reports: 'Relatórios e Análises',
      audit: 'Logs de Auditoria',
      profile: 'Meu Perfil',
      settings: 'Configurações do Sistema'
    };
    return titles[section as keyof typeof titles] || 'FeedbackHub';
  };

  const getSectionSubtitle = (section: string) => {
    const subtitles = {
      dashboard: 'Visão geral do sistema e estatísticas principais',
      feedback: 'Gerencie feedbacks e avaliações de desempenho',
      users: 'Administre usuários, papéis e permissões',
      teams: 'Organize e gerencie equipes de trabalho',
      reports: 'Relatórios detalhados e análises de performance',
      audit: 'Histórico de ações e segurança do sistema',
      profile: 'Gerencie suas informações pessoais e estatísticas',
      settings: 'Configurações gerais da plataforma'
    };
    return subtitles[section as keyof typeof subtitles];
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'users':
        return <UserManagement />;
      case 'teams':
        return <TeamManagement />;
      case 'reports':
        return <Reports />;
      case 'audit':
        return <AuditLogs />;
      case 'profile':
        return <UserProfile />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações do Sistema</h3>
              <p className="text-gray-600">Painel de configurações em desenvolvimento</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getSectionTitle(activeSection)}
          subtitle={getSectionSubtitle(activeSection)}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;