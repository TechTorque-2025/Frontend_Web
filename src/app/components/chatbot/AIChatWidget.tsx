import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Bolt } from 'lucide-react';
import Cookies from 'js-cookie';
import apiClient from '@/lib/apiClient';

// --- Theme Simulation & Constants ---
const theme = {
    'theme-text-primary': 'text-gray-900 dark:text-gray-100',
    'theme-text-muted': 'text-gray-500 dark:text-gray-400',
    'theme-bg-primary': 'bg-gray-50 dark:bg-gray-800',
    'theme-button-primary': 'bg-indigo-600 hover:bg-indigo-700 text-white',
    'theme-button-secondary': 'bg-gray-200 dark:bg-gray-700',
    'theme-border': 'border-gray-300 dark:border-gray-700',
    'theme-input': 'bg-white dark:bg-gray-600 border theme-border p-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500',
    'automotive-card': 'bg-white dark:bg-gray-800'
};

// --- TypeScript Interface Definitions ---
interface Message {
    text: string;
    sender: 'user' | 'ai' | 'system';
}

interface ChatResponse {
    reply: string;
    session_id: string;
    tool_executed?: string | null;
}

// Use the shared API client with a baseURL of `${API_BASE_URL}/api/v1`.
// Then call the `ai/chat` endpoint relative to that base.

const AIChatWidget: React.FC = () => {
    // State Management
    const [userToken, setUserToken] = useState<string | null>(null);
    
    const [conversationHistory, setConversationHistory] = useState<Message[]>([
        { text: "👋 Hello! I'm TechTorque Assistant, your friendly car service companion! 🚗\n\nI can help you with:\n✅ Booking appointments\n✅ Checking service status\n✅ Vehicle information\n✅ Pricing & estimates\n\nWhat can I do for you today? 😊", sender: 'ai' }
    ]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Check for cookie on mount
    useEffect(() => {
        const token = Cookies.get('tt_access_token');
        setUserToken(token || null);
    }, []);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationHistory]);

    // Core Logic
    const sendMessage = useCallback(async (message: string) => {
        const currentToken = Cookies.get('tt_access_token');
        
        if (!message.trim() || isLoading || !currentToken) return;

        const userMessage: Message = { text: message, sender: 'user' };
        setConversationHistory(prev => [...prev, userMessage]);
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
            setConversationHistory(prev => [...prev, aiResponse]);
            setSessionId(data.session_id);

        } catch (error: unknown) {
            console.error("Chat Error:", error);
            const errorMessage: Message = {
                // If axios/our apiClient already stripped the token on 401 it
                // will redirect to /auth/login via the interceptor. Otherwise
                // check HTTP status if available.
                text: (error instanceof Error && error.message.includes('401'))
                    ? "🔒 Your session has expired. Please log in again to continue chatting!"
                    : "⚠️ Oops! I'm having trouble connecting to my services right now. Please try again in a moment! 🔄",
                sender: 'system'
            };
            setConversationHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, sessionId]);

    // Handler for form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputMessage);
    };

    return (
        <div className={`flex flex-col h-full ${theme['automotive-card']} shadow-lg border ${theme['theme-border']} rounded-xl max-w-lg mx-auto md:max-w-xl`}>
            
            {/* Header */}
            <div className={`p-4 ${theme['theme-bg-primary']} border-b ${theme['theme-border']} rounded-t-xl flex items-center`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md mr-3">
                    <Bolt className="w-4 h-4 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${theme['theme-text-primary']}`}>
                    TechTorque AI Assistant
                </h3>
            </div>

            {/* Message Display Area */}
            <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${theme['theme-bg-primary']}`}>
                {conversationHistory.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-base leading-relaxed ${
                            msg.sender === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                                : msg.sender === 'system'
                                ? 'bg-red-100 text-red-800 border border-red-300 rounded-tl-none'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
                        }`}>
                            {msg.sender === 'ai' && <Sparkles className="w-4 h-4 inline mr-1" />}
                            <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                        </div>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] px-5 py-3 rounded-2xl text-base bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm animate-pulse">
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

            {/* Input Form */}
            <form onSubmit={handleSubmit} className={`p-4 border-t ${theme['theme-border']} flex space-x-3 ${theme['theme-bg-primary']} rounded-b-xl`}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={!userToken ? "Please sign in to chat..." : "Ask about appointments, status, or services..."}
                    className="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    disabled={isLoading || !userToken}
                />
                <button
                    type="submit"
                    className={`px-6 py-3 rounded-xl font-semibold text-base transition duration-150 ${
                        isLoading || !inputMessage.trim() || !userToken
                            ? 'bg-indigo-300 text-white cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                    disabled={isLoading || !inputMessage.trim() || !userToken}
                >
                    Send
                </button>
            </form>
            
            {/* Login Warning Message */}
            {!userToken && (
                <div className={`p-2 text-center text-xs text-red-500 ${theme['theme-bg-primary']} border-t ${theme['theme-border']}`}>
                    <p className='text-xs'>Please log in to start using the AI assistant.</p>
                </div>
            )}
        </div>
    );
};

export default AIChatWidget;