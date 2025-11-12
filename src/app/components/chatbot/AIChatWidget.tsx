// components/AIChatWidget.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

// --- TypeScript Interface Definitions ---
interface Message {
    text: string;
    sender: 'user' | 'ai' | 'system';
}

interface ChatResponse {
    reply: string;
    session_id: string;
}

const API_ENDPOINT = '/api/v1/ai/chat'; // This will be routed by your API Gateway

const AIChatWidget: React.FC = () => {
    // 1. State Management
    const [conversationHistory, setConversationHistory] = useState<Message[]>([
        { text: "👋 Hello! I'm TechTorque Assistant, your friendly car service companion! 🚗\n\nI can help you with:\n✅ Booking appointments\n✅ Checking service status\n✅ Vehicle information\n✅ Pricing & estimates\n\nWhat can I do for you today? 😊", sender: 'ai' }
    ]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationHistory]);

    // 3. The Core Logic (Memoized for performance)
    const sendMessage = useCallback(async (message: string) => {
        // Get token directly from cookies
        const userToken = Cookies.get('tt_access_token');
        
        if (!message.trim() || isLoading || !userToken) return;

        // Add user message to history
        const userMessage: Message = { text: message, sender: 'user' };
        setConversationHistory(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // 4. API Payload (Must match the Python ChatRequest model!)
            const payload = {
                query: message,
                session_id: sessionId, 
                token: userToken, // Passed in body for Agent_Bot context retrieval
            };

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`, // Passed in header for Gateway validation
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // If 401/403, log out or show an error
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to get a reply.');
            }

            const data: ChatResponse = await response.json();

            // 5. Update state with AI response and new session ID
            const aiResponse: Message = { text: data.reply, sender: 'ai' };
            setConversationHistory(prev => [...prev, aiResponse]);
            setSessionId(data.session_id); // CRITICAL: Save the session ID for the next turn

        } catch (error: unknown) {
            console.error("Chat Error:", error);
            const errorMessage: Message = {
                text: (error instanceof Error && error.message.includes('401'))
                    ? "🔒 Your session has expired. Please log in again to continue chatting!"
                    : "⚠️ Oops! I'm having trouble connecting to my services right now. Please try again in a moment! 🔄",
                sender: 'system'
            };
            setConversationHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, sessionId]); // Dependencies for useCallback

    // 6. Handler for form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputMessage);
    };

    // --- RENDER FUNCTION (JSX) ---
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg">
            {/* Message Display Area - Increased padding and spacing */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                            <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                        </div>
                    </div>
                ))}
                {/* Typing Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] px-5 py-3 rounded-2xl text-base bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm animate-pulse">
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
                <div ref={messagesEndRef} /> {/* Auto-scroll reference */}
            </div>

            {/* Input Form - Larger and more visible */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3 bg-gray-50 dark:bg-gray-900">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about appointments, status, or services..."
                    className="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={`px-6 py-3 rounded-xl font-semibold text-base transition duration-150 ${
                        isLoading || !inputMessage.trim()
                            ? 'bg-indigo-300 text-white cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                    disabled={isLoading || !inputMessage.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default AIChatWidget;