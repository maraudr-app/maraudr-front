import axios from 'axios';
import { tokenManager } from './tokenManager';
import { getModuleApiUrl } from '../config/api';

const CHAT_API_URL = getModuleApiUrl('mcp');

// Instance API spécifique pour le chat sur le port 8086
const chatApi = axios.create({
    baseURL: CHAT_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Intercepteur pour ajouter le token d'authentification
chatApi.interceptors.request.use(async (config) => {
    try {
        const token = await tokenManager.ensureValidToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
    }
    return config;
});

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatRequest {
    message: string;
    conversationHistory: ChatMessage[] | null;
}

export interface ChatResponse {
    response: string;
    conversationHistory: ChatMessage[];
}

export const chatService = {
    // Envoyer un message sans streaming (réponse complète)
    sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
        try {
            const response = await chatApi.post('/chat', request);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de l\'envoi du message:', error);
            throw new Error(error.response?.data?.message || 'Erreur de communication avec le serveur');
        }
    },

    // Envoyer un message avec streaming
    sendMessageStream: async (
        request: ChatRequest,
        onChunk: (chunk: string) => void,
        onComplete: (fullResponse: string) => void,
        onError: (error: string) => void
    ): Promise<void> => {
        try {
            const token = await tokenManager.ensureValidToken();
            const response = await fetch(`${CHAT_API_URL}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify(request),
            });

            if (response.ok) {
                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('No response body reader available');
                }

                const decoder = new TextDecoder();
                let fullResponse = '';

                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        onComplete(fullResponse);
                        break;
                    }

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6); // Enlever 'data: '
                            if (data.trim()) {
                                onChunk(data);
                                fullResponse += data;
                            }
                        }
                    }
                }
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error: any) {
            console.error('Erreur lors du streaming:', error);
            onError(error.message || 'Erreur de communication avec le serveur');
        }
    },

    // Gérer l'historique de conversation (stack de taille 10)
    manageConversationHistory: (history: ChatMessage[], newMessage: ChatMessage): ChatMessage[] => {
        const maxHistorySize = 10;
        const updatedHistory = [...history, newMessage];
        
        // Si l'historique dépasse la taille maximale, supprimer les plus anciens
        if (updatedHistory.length > maxHistorySize) {
            return updatedHistory.slice(-maxHistorySize);
        }
        
        return updatedHistory;
    }
}; 