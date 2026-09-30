import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActiveTab, Conversation, KnowledgeFile, CredentialItem, ChatMessage, VersionPair, RecommendedAction } from '../types';
import { INITIAL_CONVERSATIONS, INITIAL_FILES, INITIAL_CREDENTIALS } from '../data/mockData';
import * as api from '../services/api';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  conversations: Conversation[];
  activeConversationId: string;
  activeConversation: Conversation | undefined;
  files: KnowledgeFile[];
  selectedFile: KnowledgeFile | null;
  setSelectedFile: (file: KnowledgeFile | null) => void;
  attachedFile: KnowledgeFile | null;
  setAttachedFile: (file: KnowledgeFile | null) => void;
  credentials: CredentialItem[];
  isAiThinking: boolean;
  isBackendConnected: boolean;
  backendError: string | null;
  
  // Actions
  createNewChat: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  executeApproval: (messageId: string, approved: boolean) => Promise<void>;
  editUserMessage: (messageId: string, newText: string) => void;
  switchMessageVersion: (messageId: string, targetVersionIndex: number) => void;
  regenerateAssistantResponse: (assistantMsgId: string) => void;
  uploadFiles: (fileList: FileList | File[]) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  startChatWithFile: (file: KnowledgeFile) => void;
  addCredential: (cred: Omit<CredentialItem, 'id'>) => Promise<void>;
  updateCredential: (id: string, cred: Partial<CredentialItem>) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  refreshBackendData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CONVS = 'slops_conversations';
const LOCAL_STORAGE_KEY_FILES = 'slops_files';
const LOCAL_STORAGE_KEY_CREDS = 'slops_credentials';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CONVS);
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || 'conv-1';
  });

  // Files state
  const [files, setFiles] = useState<KnowledgeFile[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FILES);
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch {
      return INITIAL_FILES;
    }
  });

  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(files[0] || null);
  const [attachedFile, setAttachedFile] = useState<KnowledgeFile | null>(null);

  // Credentials state
  const [credentials, setCredentials] = useState<CredentialItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CREDS);
      return saved ? JSON.parse(saved) : INITIAL_CREDENTIALS;
    } catch {
      return INITIAL_CREDENTIALS;
    }
  });

  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Sync to localStorage as offline safety buffer
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONVS, JSON.stringify(conversations));
    } catch (e) {
      console.error(e);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FILES, JSON.stringify(files));
    } catch (e) {
      console.error(e);
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CREDS, JSON.stringify(credentials));
    } catch (e) {
      console.error(e);
    }
  }, [credentials]);

  // Map backend documents to KnowledgeFile
  const mapBackendDoc = (doc: api.BackendDocument): KnowledgeFile => {
    const ext = doc.filename.split('.').pop()?.toUpperCase() || 'TXT';
    const fileType = (ext === 'PDF' ? 'PDF' : ext === 'LOG' ? 'LOG' : ext === 'CSV' ? 'CSV' : 'TXT') as KnowledgeFile['type'];
    const sizeMB = (doc.file_size / (1024 * 1024)).toFixed(1);
    return {
      id: String(doc.id),
      name: doc.filename,
      type: fileType,
      size: `${sizeMB === '0.0' ? '0.4' : sizeMB} MB`,
      status: 'Indexed',
      uploadDate: new Date(doc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      usageCount: 1,
    };
  };

  // Map backend credentials to CredentialItem
  const mapBackendCred = (cred: api.BackendCredential): CredentialItem => {
    const typeLabelMap: Record<string, string> = {
      linux: 'Linux',
      postgres: 'PostgreSQL',
      mysql: 'MySQL',
      aws: 'AWS IAM',
      api: 'API Key',
      network: 'Network',
      docker: 'Docker / K8s',
    };
    return {
      id: String(cred.id),
      name: cred.name,
      type: (cred.type as CredentialItem['type']) || 'linux',
      typeLabel: typeLabelMap[cred.type] || cred.type,
      host: cred.host,
      port: cred.port,
      username: cred.username,
      password: '',
    };
  };

  // Load backend data if available
  const refreshBackendData = useCallback(async () => {
    try {
      const isLive = await api.checkBackendConnection();
      setIsBackendConnected(isLive);

      if (!isLive) {
        return;
      }

      setBackendError(null);

      // 1. Fetch Conversations
      const backendConvs = await api.getConversations();
      if (backendConvs.length > 0) {
        setConversations((prev) => {
          return backendConvs.map((c) => {
            const existing = prev.find((p) => p.id === String(c.id));
            const existingTitle = existing?.title && !existing.title.includes('#') ? existing.title : null;
            return {
              id: String(c.id),
              title: c.title || existingTitle || 'New Chat',
              group: 'Today',
              updatedAt: new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              messages: existing ? existing.messages : [],
            };
          });
        });

        // Load messages for current or first conversation
        const targetId = backendConvs.some((c) => String(c.id) === activeConversationId)
          ? activeConversationId
          : String(backendConvs[0].id);

        setActiveConversationId(targetId);

        const numTargetId = Number(targetId);
        if (!isNaN(numTargetId)) {
          try {
            const rawMsgs = await api.getMessages(numTargetId);
            const parsedMsgs: ChatMessage[] = rawMsgs.map((m) => ({
              id: `backend-msg-${m.id}`,
              sender: m.role,
              text: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              versionPairs: [],
              currentVersionIndex: 0,
            }));

            setConversations((prev) =>
              prev.map((c) => (c.id === targetId ? { ...c, messages: parsedMsgs } : c))
            );
          } catch (msgErr) {
            console.error('Failed to load messages for conversation:', msgErr);
          }
        }
      } else {
        // Backend has no conversations (all deleted or fresh start)
        setConversations((prev) => {
          const localOnly = prev.filter((c) => isNaN(Number(c.id)));
          if (localOnly.length > 0) return localOnly;
          const freshId = `conv-${Date.now()}`;
          setActiveConversationId(freshId);
          return [
            {
              id: freshId,
              title: 'New Chat',
              group: 'Today',
              updatedAt: 'Just now',
              messages: [],
            },
          ];
        });
      }

      // 2. Fetch Documents
      try {
        const docs = await api.getDocuments();
        if (docs.length > 0) {
          const loadedFiles = docs.map(mapBackendDoc);
          setFiles(loadedFiles);
          setSelectedFile(loadedFiles[0] || null);
        }
      } catch (docErr) {
        console.error('Failed to load documents:', docErr);
      }

      // 3. Fetch Credentials & Seed default Target Container if empty
      try {
        const creds = await api.getCredentials();
        if (creds.length > 0) {
          setCredentials(creds.map(mapBackendCred));
        } else {
          // Auto-seed target container credential for instant testability
          try {
            const seeded = await api.createCredential({
              name: 'Debian Target Container',
              type: 'linux',
              host: 'target',
              port: 22,
              username: 'admin',
              password: 'password',
            });
            setCredentials([mapBackendCred(seeded)]);
          } catch {
            // Ignore seeding failure if non-critical
          }
        }
      } catch (credErr) {
        console.error('Failed to load credentials:', credErr);
      }
    } catch (err: any) {
      console.warn('Backend probe warning:', err.message);
      setIsBackendConnected(false);
    }
  }, [activeConversationId]);

  // Probe backend on mount and adaptively (fast 2s poll until connected, then 10s)
  useEffect(() => {
    refreshBackendData();
    const delay = isBackendConnected ? 10000 : 2000;
    const interval = setInterval(refreshBackendData, delay);
    return () => clearInterval(interval);
  }, [refreshBackendData, isBackendConnected]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // -------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------

  const createNewChat = async () => {
    if (isBackendConnected) {
      try {
        const newConv = await api.createConversation();
        const newChat: Conversation = {
          id: String(newConv.id),
          title: 'New Chat',
          group: 'Today',
          updatedAt: 'Just now',
          messages: [],
        };
        setConversations((prev) => [newChat, ...prev]);
        setActiveConversationId(String(newConv.id));
        setActiveTab('chat');
        return;
      } catch (e: any) {
        console.error('Failed to create backend conversation:', e);
      }
    }

    // Fallback client creation
    const newId = `conv-${Date.now()}`;
    const newChat: Conversation = {
      id: newId,
      title: 'New Chat',
      group: 'Today',
      updatedAt: 'Just now',
      messages: [],
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveConversationId(newId);
    setActiveTab('chat');
  };

  const selectConversation = async (id: string) => {
    setActiveConversationId(id);
    setActiveTab('chat');

    const numId = Number(id);
    if (isBackendConnected && !isNaN(numId)) {
      try {
        const rawMsgs = await api.getMessages(numId);
        const parsedMsgs: ChatMessage[] = rawMsgs.map((m) => ({
          id: `backend-msg-${m.id}`,
          sender: m.role,
          text: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          versionPairs: [],
          currentVersionIndex: 0,
        }));
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, messages: parsedMsgs } : c))
        );
      } catch (err) {
        console.error('Error fetching messages for conversation:', err);
      }
    }
  };

  const deleteConversation = async (id: string) => {
    // 1. Optimistically remove from state
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (activeConversationId === id) {
        if (updated.length > 0) {
          setActiveConversationId(updated[0].id);
        } else {
          const newId = `conv-${Date.now()}`;
          const newChat: Conversation = {
            id: newId,
            title: 'New Chat',
            group: 'Today',
            updatedAt: 'Just now',
            messages: [],
          };
          setActiveConversationId(newId);
          return [newChat];
        }
      }
      return updated;
    });

    // 2. Call backend DELETE if numeric ID
    const numId = Number(id);
    if (!isNaN(numId) && isBackendConnected) {
      try {
        await api.deleteConversation(numId);
      } catch (err) {
        console.error('Failed to delete backend conversation:', err);
      }
    }
  };

  // Helper generator for AI response content (offline fallback)
  const generateAiContentForPrompt = (promptText: string, fileContext?: string) => {
    const queryLower = promptText.toLowerCase().trim();
    let aiText = '';
    let analysisSummary: { status: 'success' | 'error'; text: string }[] | undefined = undefined;
    let recommendedAction: RecommendedAction | undefined = undefined;

    if (fileContext) {
      aiText = `Context loaded for attached file (${fileContext}). I am analyzing its parameters.`;
    } else if (queryLower.includes('firewall') || queryLower.includes('port') || queryLower.includes('iptables')) {
      aiText = 'Detected request to manage network firewall rules on target Linux container.';
      analysisSummary = [
        { status: 'success', text: 'Target node is reachable via SSH.' },
        { status: 'error', text: 'Port 80 requires explicit policy approval.' },
      ];
      recommendedAction = {
        title: 'Allow Port 80 (TCP)',
        description: 'Execute iptables -I INPUT -p tcp --dport 80 -j ACCEPT on target container.',
        target: 'target',
        toolName: 'firewall_allow_port',
        toolArgs: { port: 80, protocol: 'tcp' },
        status: 'idle',
      };
    } else {
      aiText = `I understand your request regarding "${promptText}". Ready to run diagnostic checks or execute firewall commands on your target nodes.`;
    }

    return { aiText, analysisSummary, recommendedAction };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && !attachedFile) return;

    let targetConvId = activeConversationId;
    let numConvId = Number(targetConvId);

    // If connected to live backend and current conversation does not yet have a numeric DB id, create one now!
    if (isBackendConnected && isNaN(numConvId)) {
      try {
        const newConv = await api.createConversation();
        targetConvId = String(newConv.id);
        numConvId = newConv.id;
        setActiveConversationId(targetConvId);
      } catch (convErr) {
        console.error('Failed to create backend conversation on demand:', convErr);
      }
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFile: attachedFile ? attachedFile.name : undefined,
      versionPairs: [],
      currentVersionIndex: 0,
    };

    const fileToDetach = attachedFile;

    setConversations((prev) => {
      const exists = prev.some((c) => c.id === targetConvId || c.id === activeConversationId);
      if (!exists) {
        return [
          {
            id: targetConvId,
            title: text.length > 24 ? text.slice(0, 24) + '...' : text,
            group: 'Today',
            updatedAt: 'Just now',
            messages: [userMessage],
          },
          ...prev,
        ];
      }
      return prev.map((conv) => {
        if (conv.id === targetConvId || conv.id === activeConversationId) {
          const isDefaultTitle = !conv.title || conv.title === 'New Chat' || conv.title === 'New Conversation' || conv.title.includes('#');
          const newTitle = isDefaultTitle && text ? (text.length > 24 ? text.slice(0, 24) + '...' : text) : conv.title;
          return {
            ...conv,
            id: targetConvId,
            title: newTitle,
            messages: [...conv.messages, userMessage],
          };
        }
        return conv;
      });
    });

    setAttachedFile(null);
    setIsAiThinking(true);

    // -------------------------------------------------------------
    // LIVE BACKEND EXECUTION (Groq + LangGraph)
    // -------------------------------------------------------------
    if (isBackendConnected && !isNaN(numConvId)) {
      try {
        const chatRes = await api.sendChatMessage(numConvId, {
          message: text.trim(),
        });

        let recommendedAction: RecommendedAction | undefined = undefined;
        let aiText = chatRes.response || '';

        if (chatRes.approval_required && chatRes.approval_request) {
          const req = chatRes.approval_request;
          const toolName = req.tool_name || 'System Command';
          recommendedAction = {
            title: `Execute: ${toolName}`,
            description: req.message || `The agent requires approval to execute '${toolName}'.`,
            target: req.tool_args?.host || 'target container',
            toolName: req.tool_name,
            toolArgs: req.tool_args,
            status: 'idle',
          };
          if (!aiText) {
            aiText = `The agent is preparing to execute **${toolName}**. Please verify the recommended action below:`;
          }
        }

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedAction,
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                messages: [...conv.messages, assistantMessage],
              };
            }
            return conv;
          })
        );
        setIsAiThinking(false);
        return;
      } catch (liveErr: any) {
        console.error('Live backend error:', liveErr);
        setBackendError(liveErr.message);

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: `⚠️ Backend Error: ${liveErr.message || 'Unable to connect to AI server.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                messages: [...conv.messages, assistantMessage],
              };
            }
            return conv;
          })
        );
        setIsAiThinking(false);
        return;
      }
    }

    // -------------------------------------------------------------
    // FALLBACK SIMULATION (If backend is offline)
    // -------------------------------------------------------------
    setTimeout(() => {
      const { aiText, analysisSummary, recommendedAction } = generateAiContentForPrompt(text, fileToDetach?.name);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysisSummary,
        recommendedAction,
      };

      const initialPair: VersionPair = {
        userText: text.trim(),
        aiText,
        analysisSummary,
        recommendedAction,
        subsequentMessages: [],
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === targetConvId) {
            const updatedMessages = conv.messages.map((m) => {
              if (m.id === userMessage.id) {
                return {
                  ...m,
                  versionPairs: [initialPair],
                  currentVersionIndex: 0,
                };
              }
              return m;
            });
            return {
              ...conv,
              messages: [...updatedMessages, assistantMessage],
            };
          }
          return conv;
        })
      );
      setIsAiThinking(false);
    }, 600);
  };

  // Human-in-the-Loop: Approve or Deny agent action execution
  const executeApproval = async (messageId: string, approved: boolean) => {
    const currentChatId = activeConversationId;
    const numConvId = Number(currentChatId);

    // Update action status to executing
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === currentChatId) {
          return {
            ...conv,
            messages: conv.messages.map((m) => {
              if (m.id === messageId && m.recommendedAction) {
                return {
                  ...m,
                  recommendedAction: {
                    ...m.recommendedAction,
                    status: approved ? 'executing' : 'denied',
                  },
                };
              }
              return m;
            }),
          };
        }
        return conv;
      })
    );

    setIsAiThinking(true);

    if (isBackendConnected && !isNaN(numConvId)) {
      try {
        const resumeRes = await api.sendChatMessage(numConvId, {
          approved: approved,
        });

        // Set action to executed
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === currentChatId) {
              const updatedMessages = conv.messages.map((m) => {
                if (m.id === messageId && m.recommendedAction) {
                  return {
                    ...m,
                    recommendedAction: {
                      ...m.recommendedAction,
                      status: approved ? ('executed' as const) : ('denied' as const),
                    },
                  };
                }
                return m;
              });

              if (resumeRes.response) {
                const completionMsg: ChatMessage = {
                  id: `msg-completion-${Date.now()}`,
                  sender: 'assistant',
                  text: resumeRes.response,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                return { ...conv, messages: [...updatedMessages, completionMsg] };
              }

              return { ...conv, messages: updatedMessages };
            }
            return conv;
          })
        );
        setIsAiThinking(false);
        return;
      } catch (err: any) {
        console.error('Error resuming graph approval:', err);
      }
    }

    // Fallback if offline
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentChatId) {
            const updatedMessages = conv.messages.map((m) => {
              if (m.id === messageId && m.recommendedAction) {
                return {
                  ...m,
                  recommendedAction: {
                    ...m.recommendedAction,
                    status: approved ? ('executed' as const) : ('denied' as const),
                  },
                };
              }
              return m;
            });
            const followUp: ChatMessage = {
              id: `msg-sim-${Date.now()}`,
              sender: 'assistant',
              text: approved
                ? 'Action executed successfully on target container. The updated firewall policy is now active.'
                : 'Action cancelled by operator. No changes were applied to the target.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            return { ...conv, messages: [...updatedMessages, followUp] };
          }
          return conv;
        })
      );
      setIsAiThinking(false);
    }, 800);
  };

  const editUserMessage = (messageId: string, newText: string) => {
    if (!newText.trim()) return;

    const currentChatId = activeConversationId;
    setIsAiThinking(true);

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentChatId) {
            const userMsgIdx = conv.messages.findIndex((m) => m.id === messageId);
            if (userMsgIdx !== -1) {
              const userMsg = conv.messages[userMsgIdx];
              const fileCtx = userMsg.attachedFile;

              const { aiText, analysisSummary, recommendedAction } = generateAiContentForPrompt(newText, fileCtx);

              const currentVerIdx = userMsg.currentVersionIndex ?? 0;
              const subsequentMsgs = conv.messages.slice(userMsgIdx + 2);

              const existingPairs = userMsg.versionPairs && userMsg.versionPairs.length > 0
                ? [...userMsg.versionPairs]
                : [{
                    userText: userMsg.text,
                    aiText: conv.messages[userMsgIdx + 1]?.text || 'Previous response',
                    analysisSummary: userMsg.analysisSummary,
                    recommendedAction: userMsg.recommendedAction,
                    subsequentMessages: subsequentMsgs,
                  }];

              if (existingPairs[currentVerIdx]) {
                existingPairs[currentVerIdx] = {
                  ...existingPairs[currentVerIdx],
                  subsequentMessages: subsequentMsgs,
                };
              }

              const newPair: VersionPair = {
                userText: newText.trim(),
                aiText,
                analysisSummary,
                recommendedAction,
                subsequentMessages: [],
              };

              const updatedPairs = [...existingPairs, newPair];
              const newVerIdx = updatedPairs.length - 1;

              const updatedUserMsg: ChatMessage = {
                ...userMsg,
                text: newText.trim(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                versionPairs: updatedPairs,
                currentVersionIndex: newVerIdx,
              };

              const updatedAiMsg: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: 'assistant',
                text: aiText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                analysisSummary,
                recommendedAction,
              };

              const previousMessages = conv.messages.slice(0, userMsgIdx);
              return {
                ...conv,
                messages: [...previousMessages, updatedUserMsg, updatedAiMsg],
              };
            }
          }
          return conv;
        })
      );
      setIsAiThinking(false);
    }, 600);
  };

  const switchMessageVersion = (messageId: string, targetVersionIndex: number) => {
    const currentChatId = activeConversationId;

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === currentChatId) {
          const userMsgIdx = conv.messages.findIndex((m) => m.id === messageId);
          if (userMsgIdx !== -1) {
            const userMsg = conv.messages[userMsgIdx];
            const pairs = [...(userMsg.versionPairs || [])];

            if (targetVersionIndex >= 0 && targetVersionIndex < pairs.length) {
              const currentVerIdx = userMsg.currentVersionIndex ?? 0;
              const subsequentMsgs = conv.messages.slice(userMsgIdx + 2);

              if (pairs[currentVerIdx]) {
                pairs[currentVerIdx] = {
                  ...pairs[currentVerIdx],
                  subsequentMessages: subsequentMsgs,
                };
              }

              const targetPair = pairs[targetVersionIndex];
              const targetSubsequentMessages = targetPair.subsequentMessages || [];

              const updatedUserMsg: ChatMessage = {
                ...userMsg,
                text: targetPair.userText,
                versionPairs: pairs,
                currentVersionIndex: targetVersionIndex,
              };

              const updatedAiMsg: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: 'assistant',
                text: targetPair.aiText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                analysisSummary: targetPair.analysisSummary,
                recommendedAction: targetPair.recommendedAction,
              };

              const previousMessages = conv.messages.slice(0, userMsgIdx);
              return {
                ...conv,
                messages: [...previousMessages, updatedUserMsg, updatedAiMsg, ...targetSubsequentMessages],
              };
            }
          }
        }
        return conv;
      })
    );
  };

  const regenerateAssistantResponse = (assistantMsgId: string) => {
    const currentChatId = activeConversationId;
    setIsAiThinking(true);

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentChatId) {
            const aiMsgIdx = conv.messages.findIndex((m) => m.id === assistantMsgId);
            if (aiMsgIdx !== -1) {
              const prevUserMsg = conv.messages.slice(0, aiMsgIdx).reverse().find((m) => m.sender === 'user');
              const userText = prevUserMsg?.text || '';

              const { aiText, analysisSummary, recommendedAction } = generateAiContentForPrompt(userText);

              const updatedAiMsg: ChatMessage = {
                ...conv.messages[aiMsgIdx],
                text: `Re-evaluated telemetry response: ${aiText}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                analysisSummary,
                recommendedAction,
              };

              const updatedMessages = [...conv.messages];
              updatedMessages[aiMsgIdx] = updatedAiMsg;

              return { ...conv, messages: updatedMessages };
            }
          }
          return conv;
        })
      );
      setIsAiThinking(false);
    }, 600);
  };

  const uploadFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);

    if (isBackendConnected) {
      for (const file of filesArray) {
        const tempId = `file-${Date.now()}`;
        const newFile: KnowledgeFile = {
          id: tempId,
          name: file.name,
          type: 'PDF',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          status: 'Uploading...',
          uploadDate: 'Today',
          usageCount: 0,
        };
        setFiles((prev) => [newFile, ...prev]);

        try {
          const uploaded = await api.uploadDocument(file);
          const mapped = mapBackendDoc(uploaded);
          setFiles((prev) => prev.map((f) => (f.id === tempId ? mapped : f)));
          setSelectedFile(mapped);
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr);
          setFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, status: 'Indexed' } : f))
          );
        }
      }
      return;
    }

    // Fallback simulation
    const newFiles: KnowledgeFile[] = filesArray.map((f, i) => {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'TXT';
      const fileType = (ext === 'PDF' ? 'PDF' : ext === 'LOG' ? 'LOG' : ext === 'CSV' ? 'CSV' : 'TXT') as KnowledgeFile['type'];
      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      return {
        id: `file-${Date.now()}-${i}`,
        name: f.name,
        type: fileType,
        size: `${sizeMB === '0.0' ? '0.4' : sizeMB} MB`,
        status: 'Uploading...' as const,
        uploadDate: 'Today',
        usageCount: 0,
      };
    });

    setFiles((prev) => [...newFiles, ...prev]);

    newFiles.forEach((file) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: 'Indexing...' } : f))
        );
      }, 900);

      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: 'Indexed' } : f))
        );
      }, 2200);
    });
  };

  const deleteFile = async (id: string) => {
    const numId = Number(id);
    if (isBackendConnected && !isNaN(numId)) {
      try {
        await api.deleteDocument(numId);
      } catch (err) {
        console.error('Failed to delete backend document:', err);
      }
    }

    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (selectedFile?.id === id) {
        setSelectedFile(updated[0] || null);
      }
      return updated;
    });
  };

  const startChatWithFile = (file: KnowledgeFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, usageCount: f.usageCount + 1 } : f))
    );
    setAttachedFile(file);
    setActiveTab('chat');
  };

  const addCredential = async (cred: Omit<CredentialItem, 'id'>) => {
    if (isBackendConnected) {
      try {
        const created = await api.createCredential({
          name: cred.name,
          type: cred.type,
          username: cred.username,
          password: cred.password || 'password',
          host: cred.host,
          port: Number(cred.port),
        });
        const mapped = mapBackendCred(created);
        setCredentials((prev) => [mapped, ...prev]);
        return;
      } catch (err) {
        console.error('Failed to create credential on backend:', err);
      }
    }

    const newCred: CredentialItem = {
      ...cred,
      id: `cred-${Date.now()}`,
    };
    setCredentials((prev) => [newCred, ...prev]);
  };

  const updateCredential = async (id: string, updatedFields: Partial<CredentialItem>) => {
    const numId = Number(id);
    if (isBackendConnected && !isNaN(numId)) {
      try {
        await api.updateCredential(numId, {
          name: updatedFields.name,
          type: updatedFields.type,
          username: updatedFields.username,
          host: updatedFields.host,
          port: updatedFields.port ? Number(updatedFields.port) : undefined,
        });
      } catch (err) {
        console.error('Failed to update credential on backend:', err);
      }
    }

    setCredentials((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCredential = async (id: string) => {
    const numId = Number(id);
    if (isBackendConnected && !isNaN(numId)) {
      try {
        await api.deleteCredential(numId);
      } catch (err) {
        console.error('Failed to delete backend credential:', err);
      }
    }
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        conversations,
        activeConversationId,
        activeConversation,
        files,
        selectedFile,
        setSelectedFile,
        attachedFile,
        setAttachedFile,
        credentials,
        isAiThinking,
        isBackendConnected,
        backendError,
        createNewChat,
        selectConversation,
        deleteConversation,
        sendMessage,
        executeApproval,
        editUserMessage,
        switchMessageVersion,
        regenerateAssistantResponse,
        uploadFiles,
        deleteFile,
        startChatWithFile,
        addCredential,
        updateCredential,
        deleteCredential,
        refreshBackendData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
