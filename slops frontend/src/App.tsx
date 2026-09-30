import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { ChatPage } from './components/chat/ChatPage';
import { FilesPage } from './components/files/FilesPage';
import { CredentialsPage } from './components/credentials/CredentialsPage';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <main className="pl-64 min-h-screen bg-surface">
        {activeTab === 'chat' && <ChatPage />}
        {activeTab === 'files' && <FilesPage />}
        {activeTab === 'credentials' && <CredentialsPage />}
      </main>
    </div>
  );
};
