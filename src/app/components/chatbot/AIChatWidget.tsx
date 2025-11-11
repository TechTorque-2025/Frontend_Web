import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Bolt } from 'lucide-react'; 

// --- Theme Simulation & Constants ---
// NOTE: These theme classes are defined here for self-containment.
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

// --- TypeScript Interface Definitions (CRITICAL for TSX) ---
interface Message {
    text: string;
    sender: 'user' | 'ai' | 'system';
}

interface ChatResponse {
    reply: string;
    session_id: string;
    tool_executed?: string | null; // Added tool_executed matching Python model
}

// Mocking the user authentication hook
interface AuthHook {
    token: string | null;
    isLoggedIn: boolean;
}

// NOTE: Using localhost:8091 to test against the locally running FastAPI service
const API_ENDPOINT = 'http://localhost:8091/api/v1/ai/chat';

// --- MOCK AUTH HOOK ---
// Provides a mock token; replace this with your actual useAuth hook
const useAuth = (): AuthHook => ({
    token: "mock-jwt-token-for-user-12345", 
    isLoggedIn: true
});

const AIChatWidget: React.FC = () => {
    // 1. State Management
    const { token: userToken } = useAuth();
    
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

    // 2. The Core Logic
    const sendMessage = useCallback(async (message: string) => {
        // Ensure token exists before proceeding with any action
        if (!message.trim() || isLoading || !userToken) return; 

        // Add user message to history
        const userMessage: Message = { text: message, sender: 'user' };
        setConversationHistory(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // 3. API Payload (Must match the Python ChatRequest model!)
            const payload = {
                query: message,
                session_id: sessionId, 
                token: userToken, // Sent in body for Agent_Bot context
            };

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`, // Sent in header for Gateway validation
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Handle non-200 responses (e.g., 401, 500)
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP Error ${response.status}`);
            }

            const data: ChatResponse = await response.json();

            // 4. Update state with AI response and new session ID
            let replyText = data.reply;
            if (data.tool_executed) {
                // Indicate tool execution for debugging/clarity
                replyText = `⚙️ (Tool used: ${data.tool_executed}) ${replyText}`;
            }

            const aiResponse: Message = { text: replyText, sender: 'ai' };
            setConversationHistory(prev => [...prev, aiResponse]);
            setSessionId(data.session_id); // CRITICAL: Save the session ID

        } catch (error: any) {
            console.error("Chat Error:", error);
            const errorMessage: Message = { 
                text: "Sorry, I'm having trouble connecting to the services. Please try again later.", 
                sender: 'system' 
            };
            setConversationHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, sessionId, userToken]); 

    // 5. Handler for form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputMessage);
    };

    // --- RENDER FUNCTION (JSX) ---
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
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${theme['theme-bg-primary']}`}>
                {conversationHistory.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] md:max-w-[70%] px-4 py-2 rounded-xl text-sm break-words shadow-sm ${
                            msg.sender === 'user' 
                                ? `${theme['theme-button-primary']} rounded-br-none` 
                                : `${theme['theme-button-secondary']} ${theme['theme-text-primary']} rounded-tl-none`
                        }`}>
                            {msg.sender === 'ai' && <Sparkles className="w-4 h-4 inline mr-1" />}
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${theme['theme-button-secondary']} ${theme['theme-text-muted']} rounded-tl-none animate-pulse`}>
                            <Sparkles className="w-4 h-4 inline mr-1" /> Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} /> 
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className={`p-4 border-t ${theme['theme-border']} flex space-x-2 ${theme['theme-bg-primary']} rounded-b-xl`}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={!userToken ? "Please sign in to chat..." : "Ask about status, scheduling, or services..."}
                    className={`${theme['theme-input']} flex-1 w-full`} 
                    disabled={isLoading || !userToken}
                />
                <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg font-semibold transition duration-150 ${theme['theme-button-primary']} ${
                        isLoading || !inputMessage.trim() || !userToken
                            ? 'opacity-60 cursor-not-allowed'
                            : ''
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