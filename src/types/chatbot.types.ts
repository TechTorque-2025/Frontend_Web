/**
 * AI Chatbot Service Types
 * Generated from OpenAPI spec - TechTorque AI Chatbot Service
 * AI-powered chatbot with RAG (Retrieval-Augmented Generation) support
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Request DTOs
// ============================================

export interface ChatMessage {
  message: string;
  include_availability?: boolean; // default: true
}

export interface DocumentIngestRequest {
  content: string;
  title: string;
  doc_type?: string; // default: "general"
  source?: string; // default: "manual"
}

export interface BatchDocumentIngestRequest {
  documents: DocumentIngestRequest[];
}

// ============================================
// Response DTOs
// ============================================

export interface ChatResponse {
  response: string;
  appointment_data?: Record<string, unknown> | null;
  timestamp: string;
}

export interface AvailabilityResponse {
  date: string;
  available_slots: string[];
  booked_slots?: string[];
}

export interface HealthResponse {
  status: string;
  service: string;
  rag_enabled?: boolean;
  timestamp: string;
}

export interface RAGStatusResponse {
  status: string;
  vector_db_connected: boolean;
  total_documents: number;
  embedding_model: string;
  last_updated?: string;
}

export interface DocumentIngestResponse {
  success: boolean;
  doc_id: string;
  message: string;
}

export interface BatchIngestResponse {
  success: boolean;
  ingested_count: number;
  failed_count: number;
  doc_ids: string[];
  errors?: string[];
}

export interface DocumentDeleteResponse {
  success: boolean;
  message: string;
}

// ============================================
// Chat History Types
// ============================================

export interface ChatHistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  appointment_data?: Record<string, unknown> | null;
}

// ============================================
// Document Types
// ============================================

export enum DocumentType {
  GENERAL = 'general',
  FAQ = 'faq',
  SERVICE_INFO = 'service_info',
  POLICY = 'policy',
  PROCEDURE = 'procedure',
}

export enum DocumentSource {
  MANUAL = 'manual',
  WEBSITE = 'website',
  PDF = 'pdf',
  DATABASE = 'database',
}

// ============================================
// Form Data Types
// ============================================

export interface ChatFormData {
  message: string;
  include_availability: boolean;
}

export interface DocumentFormData {
  content: string;
  title: string;
  doc_type: string;
  source: string;
}

export interface DocumentFormErrors {
  content?: string;
  title?: string;
  doc_type?: string;
  source?: string;
  submit?: string;
}

// ============================================
// Validation Constants
// ============================================

export const CHATBOT_VALIDATION = {
  MESSAGE_MIN_LENGTH: 1,
  MESSAGE_MAX_LENGTH: 2000,
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  CONTENT_MIN_LENGTH: 10,
  CONTENT_MAX_LENGTH: 50000,
};

// ============================================
// Config Objects
// ============================================

export const DOCUMENT_TYPE_OPTIONS = [
  { value: DocumentType.GENERAL, label: 'General' },
  { value: DocumentType.FAQ, label: 'FAQ' },
  { value: DocumentType.SERVICE_INFO, label: 'Service Information' },
  { value: DocumentType.POLICY, label: 'Policy' },
  { value: DocumentType.PROCEDURE, label: 'Procedure' },
];

export const DOCUMENT_SOURCE_OPTIONS = [
  { value: DocumentSource.MANUAL, label: 'Manual Entry' },
  { value: DocumentSource.WEBSITE, label: 'Website' },
  { value: DocumentSource.PDF, label: 'PDF Document' },
  { value: DocumentSource.DATABASE, label: 'Database' },
];

// ============================================
// Helper Functions
// ============================================

export const chatbotHelpers = {
  /**
   * Generate unique message ID
   */
  generateMessageId: (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Format chat timestamp
   */
  formatTimestamp: (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();

    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If this year, show date without year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  },

  /**
   * Check if message contains appointment-related keywords
   */
  isAppointmentQuery: (message: string): boolean => {
    const keywords = ['appointment', 'book', 'schedule', 'available', 'slot', 'time', 'date', 'when'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  },

  /**
   * Get message preview (first 50 chars)
   */
  getMessagePreview: (message: string): string => {
    return message.length > 50 ? `${message.substring(0, 50)}...` : message;
  },
};
