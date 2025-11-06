/**
 * Chatbot Form Validation Utilities
 * Matches backend validation requirements
 */

import { DocumentFormErrors, CHATBOT_VALIDATION } from '@/types/chatbot.types';

export const chatbotValidation = {
  /**
   * Validate chat message
   */
  validateMessage: (message: string): string | null => {
    if (!message || message.trim().length < CHATBOT_VALIDATION.MESSAGE_MIN_LENGTH) {
      return 'Message is required';
    }

    if (message.length > CHATBOT_VALIDATION.MESSAGE_MAX_LENGTH) {
      return `Message must be less than ${CHATBOT_VALIDATION.MESSAGE_MAX_LENGTH} characters`;
    }

    return null;
  },

  /**
   * Validate document form
   */
  validateDocument: (data: {
    content: string;
    title: string;
    doc_type: string;
    source: string;
  }): DocumentFormErrors => {
    const errors: DocumentFormErrors = {};

    if (!data.title || data.title.trim().length < CHATBOT_VALIDATION.TITLE_MIN_LENGTH) {
      errors.title = 'Title is required';
    }

    if (data.title.length > CHATBOT_VALIDATION.TITLE_MAX_LENGTH) {
      errors.title = `Title must be less than ${CHATBOT_VALIDATION.TITLE_MAX_LENGTH} characters`;
    }

    if (!data.content || data.content.trim().length < CHATBOT_VALIDATION.CONTENT_MIN_LENGTH) {
      errors.content = 'Content is required (minimum 10 characters)';
    }

    if (data.content.length > CHATBOT_VALIDATION.CONTENT_MAX_LENGTH) {
      errors.content = `Content must be less than ${CHATBOT_VALIDATION.CONTENT_MAX_LENGTH} characters`;
    }

    return errors;
  },
};

// ============================================
// Helper Functions
// ============================================

export const chatbotHelpers = {
  /**
   * Parse appointment data from chat response
   */
  parseAppointmentData: (appointmentData?: Record<string, unknown> | null): {
    hasAppointmentInfo: boolean;
    slots?: string[];
    date?: string;
  } => {
    if (!appointmentData) {
      return { hasAppointmentInfo: false };
    }

    return {
      hasAppointmentInfo: true,
      slots: appointmentData.slots as string[] | undefined,
      date: appointmentData.date as string | undefined,
    };
  },

  /**
   * Format date for availability query
   */
  formatDateForQuery: (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  },

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Check if chatbot is available (health check)
   */
  isChatbotHealthy: (health: { status: string }): boolean => {
    return health.status === 'healthy' || health.status === 'ok';
  },
};
