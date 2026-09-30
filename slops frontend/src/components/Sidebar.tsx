import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    createNewChat,
    isBackendConnected,
  } = useApp();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const todayChats = conversations.filter((c) => c.group === 'Today');
  const yesterdayChats = conversations.filter((c) => c.group === 'Yesterday' || c.group === 'Older');

  const navItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'chat', label: 'Chat', icon: 'chat' },
    { id: 'files', label: 'Files', icon: 'folder_open' },
    { id: 'credentials', label: 'Credentials', icon: 'vpn_key' },
  ];

  const renderChatItem = (chat: { id: string; title: string }) => {
    const isSelected = activeTab === 'chat' && activeConversationId === chat.id;
    const isConfirming = confirmDeleteId === chat.id;

    if (isConfirming) {
      return (
        <div
          key={chat.id}
          className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-error-container/40 text-on-surface transition-all my-0.5"
        >
          <span className="text-xs font-semibold text-error truncate pr-1">Delete chat?</span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(chat.id);
                setConfirmDeleteId(null);
              }}
              title="Confirm Delete"
              className="p-1 bg-error text-white rounded hover:bg-error/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px] block">check</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteId(null);
              }}
              title="Cancel"
              className="p-1 bg-surface-variant text-on-surface-variant rounded hover:bg-surface-dim transition-colors"
            >
              <span className="material-symbols-outlined text-[14px] block">close</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={chat.id} className="group relative flex items-center my-0.5">
        <button
          onClick={() => selectConversation(chat.id)}
          className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors pr-7 ${
            isSelected
              ? 'bg-primary-container/10 text-primary font-semibold'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="truncate">{chat.title}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDeleteId(chat.id);
          }}
          title="Delete Chat"
          className="absolute right-1.5 opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error p-1 rounded transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.08)] z-50 flex flex-col">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[22px]">hub</span>
        </div>
        <span className="font-bold text-xl tracking-tight text-on-surface">SLOps</span>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-4">
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Chat
        </button>
      </div>

      {/* Conversation History List */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="mb-4">
          <h3 className="px-3 text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider mb-2">
            Chat History
          </h3>
          <div className="space-y-0.5">
            {todayChats.length > 0 && (
              <>
                <div className="px-3 py-1 text-[11px] font-medium text-on-surface-variant/60 uppercase">Today</div>
                {todayChats.map(renderChatItem)}
              </>
            )}

            {yesterdayChats.length > 0 && (
              <>
                <div className="px-3 py-1 text-[11px] font-medium text-on-surface-variant/60 uppercase mt-3">Yesterday</div>
                {yesterdayChats.map(renderChatItem)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backend Status Indicator */}
      <div className="px-3 mb-2">
        {isBackendConnected ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate">FastAPI Live (:8000)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 text-[11px] font-medium border border-amber-500/20" title="Waiting for Docker / FastAPI to start on port 8000">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="truncate">Local Demo Mode</span>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="p-3 border-t border-outline-variant/40 bg-surface-container-lowest">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1 ${
                isActive
                  ? 'bg-primary-container/10 text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
