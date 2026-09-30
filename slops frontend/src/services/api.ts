let currentBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000';

export const getApiBaseUrl = () => currentBaseUrl;

export interface BackendConversation {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface BackendChatResponse {
  response: string | null;
  approval_required: boolean;
  approval_request: {
    type?: string;
    tool_name?: string;
    tool_args?: Record<string, any>;
    message?: string;
  } | null;
}

export interface BackendDocument {
  id: number;
  filename: string;
  content_type: string;
  file_size: number;
  created_at: string;
}

export interface BackendCredential {
  id: number;
  name: string;
  type: string;
  username: string;
  host: string;
  port: number;
}

export interface BackendCredentialCreate {
  name: string;
  type: string;
  username: string;
  password: string;
  host: string;
  port: number;
}

// -------------------------------------------------------------
// Health Probe (checks 127.0.0.1 & localhost automatically)
// -------------------------------------------------------------
export async function checkBackendConnection(): Promise<boolean> {
  const candidates = [
    (import.meta as any).env?.VITE_API_URL,
    'http://127.0.0.1:8000',
    'http://localhost:8000',
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      const res = await fetch(`${url}/conversations`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        currentBaseUrl = url;
        return true;
      }
    } catch {
      // continue to next URL candidate
    }
  }
  return false;
}

const API_BASE = () => currentBaseUrl;

// -------------------------------------------------------------
// Conversations & Chat
// -------------------------------------------------------------
export async function getConversations(): Promise<BackendConversation[]> {
  const res = await fetch(`${API_BASE()}/conversations`);
  if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.statusText}`);
  return res.json();
}

export async function createConversation(): Promise<BackendConversation> {
  const res = await fetch(`${API_BASE()}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to create conversation: ${res.statusText}`);
  return res.json();
}

export async function getConversation(conversationId: number): Promise<BackendConversation> {
  const res = await fetch(`${API_BASE()}/conversations/${conversationId}`);
  if (!res.ok) throw new Error(`Failed to get conversation: ${res.statusText}`);
  return res.json();
}

export async function getMessages(conversationId: number): Promise<BackendMessage[]> {
  const res = await fetch(`${API_BASE()}/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessage(
  conversationId: number,
  params: { message?: string; approved?: boolean }
): Promise<BackendChatResponse> {
  const res = await fetch(`${API_BASE()}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function deleteConversation(conversationId: number): Promise<void> {
  const res = await fetch(`${API_BASE()}/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete conversation: ${res.statusText}`);
}

// -------------------------------------------------------------
// Documents / Knowledge Base RAG
// -------------------------------------------------------------
export async function getDocuments(): Promise<BackendDocument[]> {
  const res = await fetch(`${API_BASE()}/documents`);
  if (!res.ok) throw new Error(`Failed to fetch documents: ${res.statusText}`);
  return res.json();
}

export async function uploadDocument(file: File): Promise<BackendDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE()}/documents`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `Failed to upload document (${res.status})`);
  }
  return res.json();
}

export function getDocumentDownloadUrl(documentId: number): string {
  return `${API_BASE()}/documents/${documentId}/download`;
}

export async function deleteDocument(documentId: number): Promise<void> {
  const res = await fetch(`${API_BASE()}/documents/${documentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete document: ${res.statusText}`);
}

// -------------------------------------------------------------
// Credentials Management
// -------------------------------------------------------------
export async function getCredentials(): Promise<BackendCredential[]> {
  const res = await fetch(`${API_BASE()}/credentials`);
  if (!res.ok) throw new Error(`Failed to fetch credentials: ${res.statusText}`);
  return res.json();
}

export async function createCredential(data: BackendCredentialCreate): Promise<BackendCredential> {
  const res = await fetch(`${API_BASE()}/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `Failed to create credential (${res.status})`);
  }
  return res.json();
}

export async function updateCredential(
  credentialId: number,
  data: Partial<BackendCredentialCreate>
): Promise<BackendCredential> {
  const res = await fetch(`${API_BASE()}/credentials/${credentialId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update credential: ${res.statusText}`);
  return res.json();
}

export async function deleteCredential(credentialId: number): Promise<void> {
  const res = await fetch(`${API_BASE()}/credentials/${credentialId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete credential: ${res.statusText}`);
}
