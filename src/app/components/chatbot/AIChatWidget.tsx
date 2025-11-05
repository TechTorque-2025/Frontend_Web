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
        { text: "Hello! I'm TechTorque Assistant. How can I help you with your services or appointments?", sender: 'ai' }
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
                    ? "Your session has expired. Please log in again."
                    : "Sorry, I'm having trouble with the services. Try again later.", 
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
        <div className="flex flex-col h-full bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-indigo-700">TechTorque AI Assistant</h3>
            </div>

            {/* Message Display Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversationHistory.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                            msg.sender === 'user' 
                                ? 'bg-indigo-500 text-white rounded-br-none' 
                                : 'bg-gray-200 text-gray-800 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {/* Typing Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-2 rounded-xl text-sm bg-gray-200 text-gray-800 rounded-tl-none animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} /> {/* Auto-scroll reference */}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t flex space-x-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about appointments, status, or services..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg font-semibold transition duration-150 ${
                        isLoading || !inputMessage.trim()
                            ? 'bg-indigo-300 text-white cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
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