import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon, FaceSmileIcon, PaperClipIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { TeamMember } from '../../services/teamService';
import { useAuthStore } from '../../store/authStore';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'image' | 'file';
    isRead: boolean;
}

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatType: 'private' | 'group';
    recipient?: TeamMember; // Pour chat privé
    members: TeamMember[]; // Pour chat de groupe
    associationName?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ 
    isOpen, 
    onClose, 
    chatType, 
    recipient, 
    members, 
    associationName 
}) => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Messages de démonstration
    useEffect(() => {
        if (isOpen) {
            const demoMessages: Message[] = [
                {
                    id: '1',
                    senderId: chatType === 'private' ? recipient?.id || '' : 'demo-user-1',
                    senderName: chatType === 'private' ? `${recipient?.firstname} ${recipient?.lastname}` : 'Marie Dubois',
                    content: chatType === 'private' 
                        ? `Salut ${user?.firstName} ! Comment ça va ?` 
                        : 'Bonjour l\'équipe ! Réunion demain à 10h pour préparer la prochaine maraude.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30),
                    type: 'text',
                    isRead: true
                },
                {
                    id: '2',
                    senderId: user?.sub || '',
                    senderName: `${user?.firstName} ${user?.lastName}`,
                    content: chatType === 'private' 
                        ? 'Salut ! Ça va bien, merci. Et toi ?' 
                        : 'Parfait ! Je serai là. Avez-vous une idée du secteur à couvrir ?',
                    timestamp: new Date(Date.now() - 1000 * 60 * 25),
                    type: 'text',
                    isRead: true
                },
                {
                    id: '3',
                    senderId: chatType === 'group' ? 'demo-user-2' : recipient?.id || '',
                    senderName: chatType === 'group' ? 'Pierre Martin' : `${recipient?.firstname} ${recipient?.lastname}`,
                    content: chatType === 'private' 
                        ? 'Ça va super ! Au fait, tu as vu les nouvelles disponibilités dans l\'équipe ?' 
                        : 'Je propose le quartier République, j\'y ai repéré plusieurs personnes en difficulté la semaine dernière.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 20),
                    type: 'text',
                    isRead: true
                }
            ];
            setMessages(demoMessages);
        }
    }, [isOpen, chatType, recipient, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && user) {
            const message: Message = {
                id: Date.now().toString(),
                senderId: user.sub || '',
                senderName: `${user.firstName} ${user.lastName}`,
                content: newMessage.trim(),
                timestamp: new Date(),
                type: 'text',
                isRead: false
            };
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            
            // Simulation de réponse automatique pour la démo
            setTimeout(() => {
                if (chatType === 'private' && recipient) {
                    const autoReply: Message = {
                        id: (Date.now() + 1).toString(),
                        senderId: recipient.id,
                        senderName: `${recipient.firstname} ${recipient.lastname}`,
                        content: 'Message reçu ! Je te réponds dès que possible 👍',
                        timestamp: new Date(),
                        type: 'text',
                        isRead: false
                    };
                    setMessages(prev => [...prev, autoReply]);
                }
            }, 2000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const messageDate = new Date(date);
        
        if (messageDate.toDateString() === today.toDateString()) {
            return 'Aujourd\'hui';
        }
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Hier';
        }
        
        return messageDate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long' 
        });
    };

    const isCurrentUser = (senderId: string) => senderId === user?.sub;

    const getChatTitle = () => {
        if (chatType === 'private' && recipient) {
            return `${recipient.firstname} ${recipient.lastname}`;
        }
        return `💬 Chat de groupe - ${associationName || 'Équipe'}`;
    };

    const getChatSubtitle = () => {
        if (chatType === 'private') {
            return 'En ligne';
        }
        return `${members.length} membres`;
    };

    const getAvatarInitials = (name: string) => {
        const names = name.split(' ');
        return names.map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header du chat */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-green-500 to-emerald-500">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            {chatType === 'private' ? (
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">
                                        {recipient ? getAvatarInitials(`${recipient.firstname} ${recipient.lastname}`) : 'U'}
                                    </span>
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <UserGroupIcon className="w-6 h-6 text-white" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{getChatTitle()}</h3>
                            <p className="text-white/80 text-sm">{getChatSubtitle()}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {messages.map((message, index) => {
                        const showDate = index === 0 || 
                            formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
                        
                        return (
                            <div key={message.id}>
                                {showDate && (
                                    <div className="text-center my-4">
                                        <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400 shadow-sm">
                                            {formatDate(message.timestamp)}
                                        </span>
                                    </div>
                                )}
                                
                                <div className={`flex ${isCurrentUser(message.senderId) ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                                        isCurrentUser(message.senderId)
                                            ? 'bg-green-500 text-white rounded-br-sm'
                                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                    }`}>
                                        {chatType === 'group' && !isCurrentUser(message.senderId) && (
                                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                                {message.senderName}
                                            </p>
                                        )}
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 ${
                                            isCurrentUser(message.senderId) 
                                                ? 'text-white/70' 
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {formatTime(message.timestamp)}
                                            {isCurrentUser(message.senderId) && (
                                                <span className="ml-1">
                                                    {message.isRead ? '✓✓' : '✓'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                            <PaperClipIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Écrivez votre message...`}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        
                        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                            <FaceSmileIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className={`p-2 rounded-full transition-colors ${
                                newMessage.trim()
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Appuyez sur Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
                    </div>
                </div>
            </div>
        </div>
    );
}; 