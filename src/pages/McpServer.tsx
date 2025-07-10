import React, { useState, useRef, useEffect } from 'react';
import { chatService, ChatMessage } from '../services/chatService';
import { 
    PaperAirplaneIcon, 
    ArrowPathIcon,
    ChatBubbleLeftRightIcon,
    Cog6ToothIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAssoStore } from '../store/assoStore';

const McpServer: React.FC = () => {
    const [message, setMessage] = useState('');
    const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingResponse, setStreamingResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { sidebarCollapsed } = useAssoStore();
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    // Auto-scroll vers le bas quand de nouveaux messages arrivent
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversationHistory, streamingResponse]);

    // Focus sur l'input au chargement
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim() || loading) return;
        const userMessage: ChatMessage = {
            role: 'user',
            content: message.trim()
        };
        // Ajouter le message utilisateur à l'historique
        const updatedHistory = chatService.manageConversationHistory(conversationHistory, userMessage);
        setConversationHistory(updatedHistory);
        const currentMessage = message.trim();
        setMessage('');
        setLoading(true);
        setStreamingResponse('');
        try {
            setIsStreaming(true);
            await chatService.sendMessageStream(
                {
                    message: currentMessage,
                    conversationHistory: updatedHistory
                },
                (chunk: string) => {
                    setStreamingResponse(prev => prev + chunk);
                },
                (fullResponse: string) => {
                    const assistantMessage: ChatMessage = {
                        role: 'assistant',
                        content: fullResponse
                    };
                    setConversationHistory(prev => chatService.manageConversationHistory(prev, assistantMessage));
                    setStreamingResponse('');
                    setIsStreaming(false);
                    setLoading(false);
                },
                (error: string) => {
                    toast.error(`Erreur: ${error}`);
                    setIsStreaming(false);
                    setLoading(false);
                }
            );
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'envoi du message');
            setLoading(false);
            setIsStreaming(false);
        }
    };

    const clearHistory = () => {
        setConversationHistory([]);
        setStreamingResponse('');
        toast.success('Historique effacé');
    };

    const handleQuickAction = (action: string) => {
        setMessage(action);
    };

    // Actions rapides dynamiques basées sur les capacités de l'API
    const quickActions = [
        { label: 'Voir le stock', value: 'Peux-tu me dire ce qu\'il y a dans le stock de mon association ?' },
        { label: 'Voir le planning', value: 'Quels sont les événements prévus cette semaine ?' },
        { label: 'Afficher la map', value: 'Peux-tu me montrer les points d\'intérêt sur la carte ?' },
        { label: 'Voir les disponibilités', value: 'Qui est disponible pour les maraudes ce weekend ?' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900">
            {/* Navbar Assistance IA, style StockNavbar */}
            <nav
                className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300 border-b border-gray-200 dark:border-gray-800"
                style={{ left: sidebarWidth }}
            >
                <div className="flex items-center justify-between h-16 px-7">
                    <div className="flex items-center gap-3">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-maraudr-blue dark:text-maraudr-orange" />
                        <span className="text-gray-900 dark:text-white text-lg font-bold">Assistance IA</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={clearHistory}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Effacer l'historique"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>
            {/* Main content scrolls under the navbar, with correct padding */}
            <div className="pt-16" />
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Quick Actions */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Actions rapides
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map(action => (
                            <button
                                key={action.value}
                                onClick={() => handleQuickAction(action.value)}
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                disabled={loading}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="h-96 overflow-y-auto p-4">
                        {conversationHistory.length === 0 && !isStreaming ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 mb-4" />
                                <p className="text-center">
                                    Bonjour ! Je suis Dog, votre assistant spécialisé dans la gestion d'association.<br />
                                    Posez-moi vos questions sur les stocks, le planning, ou la géolocalisation.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {conversationHistory.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                msg.role === 'user'
                                                    ? 'bg-maraudr-blue text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Streaming response */}
                                {isStreaming && streamingResponse && (
                                    <div className="flex justify-start">
                                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                                            <p className="text-sm whitespace-pre-wrap">
                                                {streamingResponse}
                                                <span className="animate-pulse">▋</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Loading indicator */}
                                {loading && !isStreaming && (
                                    <div className="flex justify-start">
                                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-maraudr-blue"></div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Dog réfléchit...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Form */}
                <form onSubmit={sendMessage} className="flex space-x-3">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Posez votre question à Dog..."
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-maraudr-blue dark:focus:ring-maraudr-orange focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-maraudr-blue to-maraudr-orange text-white rounded-lg font-semibold hover:from-maraudr-orange hover:to-maraudr-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                <span>Envoi...</span>
                            </>
                        ) : (
                            <>
                                <PaperAirplaneIcon className="w-5 h-5" />
                                <span>Envoyer</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Status */}
                <div className="mt-4 text-center">
                    <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span>
                            {loading 
                                ? 'Streaming en cours...'
                                : 'Prêt'
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default McpServer; 