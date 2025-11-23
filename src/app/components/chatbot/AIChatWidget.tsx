"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import apiClient from '@/lib/apiClient';
import { Bolt, Sparkles } from 'lucide-react';

// Local helper types used only in this component
type MessageSender = 'ai' | 'user' | 'system';
type Message = { text: string; sender: MessageSender };

interface ChatResponse {
  reply: string;
  session_id?: string;
  tool_executed?: string;
}

const AIChatWidget: React.FC = () => {
  // State Management


  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    {
      text:
        "👋 Hello! I'm TechTorque Assistant, your friendly car service companion! 🚗\n\nI can help you with:\n✅ Booking appointments\n✅ Checking service status\n✅ Vehicle information\n✅ Pricing & estimates\n\nWhat can I do for you today? 😊",
      sender: 'ai',
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);



  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Core Logic
  const sendMessage = useCallback(
    async (message: string) => {
      const currentToken = Cookies.get('tt_access_token');

      if (!message.trim() || isLoading || !currentToken) return;

      const userMessage: Message = { text: message, sender: 'user' };
      setConversationHistory((prev) => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const payload = {
          query: message,
          session_id: sessionId,
          token: currentToken,
        };

        // Let the shared `apiClient` add auth headers via request interceptor
        const { data } = await apiClient.post<ChatResponse>('/ai/chat', payload);

        let replyText = data.reply;
        if (data.tool_executed) {
          replyText = `⚙️ (Tool used: ${data.tool_executed}) ${replyText}`;
        }

        const aiResponse: Message = { text: replyText, sender: 'ai' };
        setConversationHistory((prev) => [...prev, aiResponse]);
        // session_id may be undefined from the server — convert to null so it matches our state type
        setSessionId(data.session_id ?? null);
      } catch (error: unknown) {
        console.error('Chat Error:', error);
        const errorMessage: Message = {
          text:
            error instanceof Error && error.message.includes('401')
              ? "🔒 Your session has expired. Please log in again to continue chatting!"
              : "⚠️ Oops! I'm having trouble connecting to my services right now. Please try again in a moment! 🔄",
          sender: 'system',
        };
        setConversationHistory((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId]
  );

  // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className="flex flex-col h-full automotive-card shadow-lg border theme-border rounded-xl max-w-lg mx-auto md:max-w-xl">
      {/* Header */}
      <div className="p-4 theme-bg-primary border-b theme-border rounded-t-xl flex items-center">
        <div className="w-8 h-8 rounded-full bg-linear-to-r from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md mr-3">
          <Bolt className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-bold theme-text-primary">TechTorque AI Assistant</h3>
      </div>

      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 theme-bg-primary">
        {conversationHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-5 py-3 rounded-2xl text-base leading-relaxed ${
                msg.sender === 'user'
                  ? 'theme-button-primary rounded-br-none shadow-md'
                  : msg.sender === 'system'
                  ? 'theme-alert-danger rounded-tl-none'
                  : 'theme-bg-secondary theme-text-primary rounded-tl-none shadow-sm'
              }`}
            >
              {msg.sender === 'ai' && <Sparkles className="w-4 h-4 inline mr-1" />}
              <span className="whitespace-pre-wrap wrap-break-word">{msg.text}</span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-5 py-3 rounded-2xl text-base theme-bg-secondary theme-text-primary rounded-tl-none shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 inline mr-1" />
              <span className="flex items-center gap-1">
                <span>Thinking</span>
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t theme-border rounded-b-xl theme-bg-primary">
        <div className="flex items-center gap-3">
          <textarea
            aria-label="Chat message"
            className="flex-1 resize-none border theme-border rounded-md px-3 py-2 text-sm focus:outline-none theme-bg-secondary theme-text-primary"
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about booking, services or your vehicle..."
          />
          <button type="submit" className="theme-button-primary px-4 py-2 rounded-md disabled:opacity-50" disabled={isLoading || !inputMessage.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChatWidget;
