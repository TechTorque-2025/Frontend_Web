'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatbotService } from '@/lib/api/chatbot.service';
import {
  ChatHistoryMessage,
  RAGStatusResponse,
  DocumentFormData,
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_SOURCE_OPTIONS,
} from '@/types/chatbot.types';
import { chatbotValidation } from '@/lib/utils/chatbot-validation';
import { chatbotHelpers as typeHelpers } from '@/types/chatbot.types';

/**
 * ChatbotTab Component
 * AI-powered chatbot with RAG support
 * Available for all users
 */
export default function ChatbotTab() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragStatus, setRagStatus] = useState<RAGStatusResponse | null>(null);

  // Admin features
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [documentForm, setDocumentForm] = useState<DocumentFormData>({
    content: '',
    title: '',
    doc_type: 'general',
    source: 'manual',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.roles.includes('ADMIN') || user?.roles.includes('SUPER_ADMIN');

  useEffect(() => {
    // Load RAG status
    loadRagStatus();

    // Add welcome message
    setMessages([
      {
        id: typeHelpers.generateMessageId(),
        role: 'assistant',
        content: 'Hello! I&apos;m your TechTorque AI assistant. I can help you with:\n\n• Checking available appointment slots\n• Answering questions about our services\n• General inquiries about vehicle maintenance\n\nHow can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRagStatus = async () => {
    try {
      const status = await chatbotService.getRagStatus();
      setRagStatus(status);
    } catch (err) {
      console.error('Failed to load RAG status:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = chatbotValidation.validateMessage(inputMessage);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Add user message to chat
    const userMessage: ChatHistoryMessage = {
      id: typeHelpers.generateMessageId(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setError(null);
    setLoading(true);

    try {
      // Check if message is appointment-related
      const includeAvailability = typeHelpers.isAppointmentQuery(inputMessage);

      // Send to chatbot API
      const response = await chatbotService.chat({
        message: inputMessage,
        include_availability: includeAvailability,
      });

      // Add assistant response to chat
      const assistantMessage: ChatHistoryMessage = {
        id: typeHelpers.generateMessageId(),
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
        appointment_data: response.appointment_data,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to get response from AI assistant');
      console.error(err);

      // Add error message
      const errorMessage: ChatHistoryMessage = {
        id: typeHelpers.generateMessageId(),
        role: 'assistant',
        content: 'I apologize, but I&apos;m having trouble responding right now. Please try again later.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = chatbotValidation.validateDocument(documentForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await chatbotService.ingestDocument(documentForm);
      await loadRagStatus();
      setShowIngestModal(false);
      setDocumentForm({
        content: '',
        title: '',
        doc_type: 'general',
        source: 'manual',
      });
      setFormErrors({});
      alert('Document ingested successfully!');
    } catch (err) {
      setFormErrors({ submit: 'Failed to ingest document' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: typeHelpers.generateMessageId(),
          role: 'assistant',
          content: 'Chat cleared. How can I help you?',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">AI Assistant</h2>
          <p className="theme-text-secondary text-sm">
            Powered by Gemini 2.5 Flash {ragStatus?.vector_db_connected && '• RAG Enabled ✓'}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="theme-button-secondary text-sm"
              >
                {showAdminPanel ? 'Hide Admin' : 'Admin Panel'}
              </button>
              <button
                onClick={() => setShowIngestModal(true)}
                className="theme-button-secondary text-sm"
              >
                + Add Knowledge
              </button>
            </>
          )}
          <button onClick={handleClearChat} className="theme-button-secondary text-sm">
            Clear Chat
          </button>
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && showAdminPanel && ragStatus && (
        <div className="theme-card mb-4 p-4">
          <h3 className="font-bold theme-text-primary mb-3">RAG System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="theme-text-secondary">Status</p>
              <p className="theme-text-primary font-medium">{ragStatus.status}</p>
            </div>
            <div>
              <p className="theme-text-secondary">Vector DB</p>
              <p className="theme-text-primary font-medium">
                {ragStatus.vector_db_connected ? '✓ Connected' : '✗ Disconnected'}
              </p>
            </div>
            <div>
              <p className="theme-text-secondary">Documents</p>
              <p className="theme-text-primary font-medium">{ragStatus.total_documents}</p>
            </div>
            <div>
              <p className="theme-text-secondary">Model</p>
              <p className="theme-text-primary font-medium">{ragStatus.embedding_model}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 theme-card p-4 overflow-y-auto mb-4 max-h-[600px]">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 theme-text-primary'
                }`}
              >
                {/* Message Content */}
                <div className="whitespace-pre-wrap break-words">{message.content}</div>

                {/* Appointment Data (if available) */}
                {message.appointment_data && (
                  <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <p className="text-xs opacity-75 mb-1">Available Slots:</p>
                    <div className="flex flex-wrap gap-1">
                      {(message.appointment_data.slots as string[] | undefined)?.map((slot, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded bg-white/20 dark:bg-black/20"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-200' : 'theme-text-secondary'
                  }`}
                >
                  {typeHelpers.formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask me anything about appointments, services, or vehicle maintenance..."
          className="flex-1 theme-input"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="theme-button-primary px-6"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {/* Ingest Document Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold theme-text-primary mb-4">Add Knowledge to AI</h3>
            <form onSubmit={handleIngestDocument} className="space-y-4">
              <div>
                <label className="block theme-text-primary mb-1">Title *</label>
                <input
                  type="text"
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.title && <p className="theme-error">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block theme-text-primary mb-1">Document Type</label>
                  <select
                    value={documentForm.doc_type}
                    onChange={(e) => setDocumentForm({ ...documentForm, doc_type: e.target.value })}
                    className="w-full theme-input"
                  >
                    {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block theme-text-primary mb-1">Source</label>
                  <select
                    value={documentForm.source}
                    onChange={(e) => setDocumentForm({ ...documentForm, source: e.target.value })}
                    className="w-full theme-input"
                  >
                    {DOCUMENT_SOURCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Content *</label>
                <textarea
                  value={documentForm.content}
                  onChange={(e) => setDocumentForm({ ...documentForm, content: e.target.value })}
                  className="w-full theme-input"
                  rows={10}
                  placeholder="Enter the knowledge content that the AI should learn..."
                  required
                />
                {formErrors.content && <p className="theme-error">{formErrors.content}</p>}
                <p className="text-xs theme-text-secondary mt-1">
                  This content will be added to the AI's knowledge base for future responses.
                </p>
              </div>

              {formErrors.submit && <p className="theme-error">{formErrors.submit}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 theme-button-primary">
                  {submitting ? 'Adding...' : 'Add to Knowledge Base'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowIngestModal(false);
                    setFormErrors({});
                  }}
                  className="flex-1 theme-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
