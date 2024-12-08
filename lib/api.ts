// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
}

export interface Document {
  id: string;
  content_hash: string;
  storage_path: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  status: string;
  error?: string;
  error_message?: string;
  processing_status: string;
  embedding_model?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
  chunk_overlap?: number;
  chunk_size?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  error?: string;
}

export interface StatusSummary {
  total: number;
  by_status: Record<string, number>;
}

export interface StatusSummaryResponse {
  success: boolean;
  error?: string;
  data?: {
    total: number;
    by_status: Record<string, number>;
  };
}

export async function sendMessage(message: string): Promise<ChatMessage> {
  console.log('🟦 API - sendMessage called with message:', message);

  try {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content: message,
        role: 'user'
      }),
    });

    if (!response.ok) {
      console.error('🔴 Failed to send message:', response.status, response.statusText);
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('🔴 Error in sendMessage:', error);
    throw error;
  }
}

export async function uploadDocument(formData: FormData): Promise<any> {
  console.log('🟦 API - uploadDocument (single) called');

  try {
    const response = await fetch(`${API_BASE_URL}/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('🔴 Upload failed:', response.status, response.statusText);
      throw new Error('Failed to upload document');
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    console.error('🔴 Error in uploadDocument:', error);
    throw error;
  }
}

export async function uploadDocumentsBulk(formData: FormData): Promise<any> {
  console.log('🟦 API - uploadDocument (bulk) called');

  try {
    const response = await fetch(`${API_BASE_URL}/storage/upload/bulk`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('🔴 Bulk upload failed:', response.status, response.statusText);
      throw new Error('Failed to upload documents');
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    console.error('🔴 Error in uploadDocumentsBulk:', error);
    throw error;
  }
}

export async function getDocuments(): Promise<DocumentsResponse> {
  console.log('🟦 API - Fetching documents from:', `${API_BASE_URL}/storage/documents`);

  try {
    const response = await fetch(`${API_BASE_URL}/storage/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    }).catch(error => {
      console.error('🔴 Network error:', error);
      throw new Error('Failed to connect to server. Please check if the server is running.');
    });

    console.log('🟦 Response status:', response.status);

    if (!response.ok) {
      console.error('🔴 Failed to fetch documents:', response.status, response.statusText);
      throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
    }

    const data = await response.json().catch(error => {
      console.error('🔴 Invalid JSON response:', error);
      throw new Error('Server returned invalid data');
    });
    
    console.log('🟦 Documents response:', data);

    // Handle both old and new response formats
    if (Array.isArray(data)) {
      return {
        success: true,
        documents: data,
        error: undefined
      };
    }

    if (!data) {
      console.error('🔴 Empty response from server');
      return {
        success: false,
        documents: [],
        error: 'Empty response from server'
      };
    }

    return {
      success: data.success ?? true,
      documents: Array.isArray(data.documents) ? data.documents : [],
      error: data.error
    };
  } catch (error) {
    console.error('🔴 Error in getDocuments:', error);
    return {
      success: false,
      documents: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deleteDocument(id: string): Promise<void> {
  console.log('🟦 API - Deleting document:', id);

  try {
    const response = await fetch(`${API_BASE_URL}/storage/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('🔴 Delete failed:', response.status, response.statusText);
      throw new Error('Failed to delete document');
    }
  } catch (error) {
    console.error('🔴 Error in deleteDocument:', error);
    throw error;
  }
}

export async function getDocumentStatus(): Promise<StatusSummaryResponse> {
  console.log('🟦 API - Fetching document status');

  try {
    const response = await fetch(`${API_BASE_URL}/storage/documents/status-summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    console.log('🟦 Status response:', response.status);

    if (!response.ok) {
      console.error('🔴 Failed to fetch status:', response.status, response.statusText);
      throw new Error('Failed to fetch status');
    }

    const data = await response.json();
    console.log('🟦 Status data:', data);

    if (!data) {
      return {
        success: false,
        error: 'Empty response from server',
        data: {
          total: 0,
          by_status: {}
        }
      };
    }

    return {
      success: data.success ?? true,
      error: data.error,
      data: data.data ?? {
        total: 0,
        by_status: {}
      }
    };
  } catch (error) {
    console.error('🔴 Error fetching status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        total: 0,
        by_status: {}
      }
    };
  }
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<ApiResponse<Document>> {
  console.log('🟦 API - Updating document:', id);

  try {
    const response = await fetch(`${API_BASE_URL}/storage/documents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('🔴 Failed to update document:', response.status, response.statusText);
      throw new Error('Failed to update document');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('🔴 Error in updateDocument:', error);
    throw error;
  }
}