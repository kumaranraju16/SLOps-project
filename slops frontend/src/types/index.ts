export type ActiveTab = 'chat' | 'files' | 'credentials';

export interface AnalysisPoint {
  status: 'success' | 'error';
  text: string;
}

export interface RecommendedAction {
  title: string;
  description: string;
  target?: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
  status?: 'idle' | 'executing' | 'executed' | 'denied';
}

export interface VersionPair {
  userText: string;
  aiText: string;
  analysisSummary?: AnalysisPoint[];
  recommendedAction?: RecommendedAction;
  subsequentMessages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachedFile?: string;
  analysisSummary?: AnalysisPoint[];
  recommendedAction?: RecommendedAction;
  versionPairs?: VersionPair[];
  currentVersionIndex?: number;
}

export interface Conversation {
  id: string;
  title: string;
  group: 'Today' | 'Yesterday' | 'Older';
  updatedAt: string;
  messages: ChatMessage[];
  associatedFile?: string;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  type: 'PDF' | 'LOG' | 'TXT' | 'CSV';
  size: string;
  status: 'Indexed' | 'Indexing...' | 'Uploading...';
  uploadDate: string;
  usageCount: number;
}

export interface CredentialItem {
  id: string;
  name: string;
  type: 'linux' | 'postgres' | 'mysql' | 'aws' | 'api' | 'network' | 'docker';
  typeLabel: string;
  host: string;
  port: number;
  username: string;
  password?: string;
}
