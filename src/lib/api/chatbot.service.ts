/**
 * AI Chatbot Service API
 * All endpoints for AI chatbot with RAG support
 * Uses Gemini 2.5 Flash for AI responses
 */

import apiClient from './axios-config';
import {
  ChatMessage,
  ChatResponse,
  DocumentIngestRequest,
  AvailabilityResponse,
  HealthResponse,
  RAGStatusResponse,
  DocumentIngestResponse,
  BatchIngestResponse,
  DocumentDeleteResponse,
} from '@/types/chatbot.types';

// ============================================
// Chatbot Service
// ============================================

export const chatbotService = {
  /**
   * POST /api/v1/chatbot/chat
   * Main chat endpoint with RAG support
   * Processes user messages and returns AI responses
   */
  chat: async (data: ChatMessage, authToken?: string): Promise<ChatResponse> => {
    const headers: Record<string, string> = authToken ? { authorization: authToken } : {};
    const response = await apiClient.post<ChatResponse>('/api/v1/chatbot/chat', data, {
      headers,
    });
    return response.data;
  },

  /**
   * GET /api/v1/chatbot/availability
   * Get available appointment slots
   */
  getAvailability: async (date?: string, authToken?: string): Promise<AvailabilityResponse> => {
    const headers: Record<string, string> = authToken ? { authorization: authToken } : {};
    const response = await apiClient.get<AvailabilityResponse>(
      '/api/v1/chatbot/availability',
      {
        params: date ? { date } : undefined,
        headers,
      }
    );
    return response.data;
  },

  /**
   * GET /api/v1/chatbot/health
   * Health check for chatbot service with RAG status
   */
  healthCheck: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/api/v1/chatbot/health');
    return response.data;
  },

  /**
   * POST /api/v1/chatbot/documents/ingest
   * Ingest a document into the knowledge base
   * Requires admin privileges
   */
  ingestDocument: async (
    data: DocumentIngestRequest,
    authToken?: string
  ): Promise<DocumentIngestResponse> => {
    const headers: Record<string, string> = authToken ? { authorization: authToken } : {};

    // Convert to form data format
    const formData = new URLSearchParams();
    formData.append('content', data.content);
    formData.append('title', data.title);
    if (data.doc_type) formData.append('doc_type', data.doc_type);
    if (data.source) formData.append('source', data.source);

    const response = await apiClient.post<DocumentIngestResponse>(
      '/api/v1/chatbot/documents/ingest',
      formData,
      {
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },

  /**
   * POST /api/v1/chatbot/documents/batch-ingest
   * Ingest multiple documents at once
   * Requires admin privileges
   */
  batchIngestDocuments: async (
    documents: DocumentIngestRequest[],
    authToken?: string
  ): Promise<BatchIngestResponse> => {
    const headers: Record<string, string> = authToken ? { authorization: authToken } : {};
    const response = await apiClient.post<BatchIngestResponse>(
      '/api/v1/chatbot/documents/batch-ingest',
      documents,
      { headers }
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/chatbot/documents/{doc_id}
   * Delete a document from the knowledge base
   * Requires admin privileges
   */
  deleteDocument: async (
    docId: string,
    authToken?: string
  ): Promise<DocumentDeleteResponse> => {
    const headers: Record<string, string> = authToken ? { authorization: authToken } : {};
    const response = await apiClient.delete<DocumentDeleteResponse>(
      `/api/v1/chatbot/documents/${docId}`,
      { headers }
    );
    return response.data;
  },

  /**
   * GET /api/v1/chatbot/rag/status
   * Get RAG system status and statistics
   */
  getRagStatus: async (): Promise<RAGStatusResponse> => {
    const response = await apiClient.get<RAGStatusResponse>('/api/v1/chatbot/rag/status');
    return response.data;
  },

  /**
   * GET /
   * Root endpoint
   */
  root: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>('/');
    return response.data;
  },

  /**
   * GET /health
   * General health check
   */
  generalHealth: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>('/health');
    return response.data;
  },
};
