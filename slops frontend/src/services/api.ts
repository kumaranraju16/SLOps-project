export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

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
// Health Probe
// -------------------------------------------------------------
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// Conversations & Chat
// -------------------------------------------------------------
export async function getConversations(): Promise<BackendConversation[]> {
  const res = await fetch(`${API_BASE_URL}/conversations`);
  if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.statusText}`);
  return res.json();
}

export async function createConversation(): Promise<BackendConversation> {
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to create conversation: ${res.statusText}`);
  return res.json();
}

export async function getConversation(conversationId: number): Promise<BackendConversation> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}`);
  if (!res.ok) throw new Error(`Failed to get conversation: ${res.statusText}`);
  return res.json();
}

export async function getMessages(conversationId: number): Promise<BackendMessage[]> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessage(
  conversationId: number,
  params: { message?: string; approved?: boolean }
): Promise<BackendChatResponse> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
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
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete conversation: ${res.statusText}`);
}

// -------------------------------------------------------------
// Documents / Knowledge Base RAG
// -------------------------------------------------------------
export async function getDocuments(): Promise<BackendDocument[]> {
  const res = await fetch(`${API_BASE_URL}/documents`);
  if (!res.ok) throw new Error(`Failed to fetch documents: ${res.statusText}`);
  return res.json();
}

export async function uploadDocument(file: File): Promise<BackendDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/documents`, {
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
  return `${API_BASE_URL}/documents/${documentId}/download`;
}

export async function deleteDocument(documentId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete document: ${res.statusText}`);
}

// -------------------------------------------------------------
// Credentials Management
// -------------------------------------------------------------
export async function getCredentials(): Promise<BackendCredential[]> {
  const res = await fetch(`${API_BASE_URL}/credentials`);
  if (!res.ok) throw new Error(`Failed to fetch credentials: ${res.statusText}`);
  return res.json();
}

export async function createCredential(data: BackendCredentialCreate): Promise<BackendCredential> {
  const res = await fetch(`${API_BASE_URL}/credentials`, {
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
  const res = await fetch(`${API_BASE_URL}/credentials/${credentialId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update credential: ${res.statusText}`);
  return res.json();
}

export async function deleteCredential(credentialId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/credentials/${credentialId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete credential: ${res.statusText}`);
}
