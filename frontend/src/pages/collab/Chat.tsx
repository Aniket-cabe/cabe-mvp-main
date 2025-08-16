import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
// import { toast } from 'react-hot-toast';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface ChatMessage {
  messageId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  avatarUrl?: string;
}

interface ChatProps {
  roomId: string;
  currentUserId: string;
  currentUsername: string;
}

export const CollaborationChat: React.FC<ChatProps> = ({
  // roomId,
  currentUserId,
  currentUsername,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { sendMessage, isConnected } = useWebSocket({
    url: `${import.meta.env.VITE_WS_URL || 'ws://localhost:8081'}?token=${localStorage.getItem('authToken')}`,
    handlers: {
      chatMessage: (data) => {
        setMessages((prev) => [...prev, data.message]);
      },
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // function handleWebSocketMessage(event: any) {
  //   const message = JSON.parse(event.data);

  //   switch (message.type) {
  //     case 'room_state':
  //       if (message.chat) {
  //         setMessages(message.chat);
  //       }
  //       break;

  //     case 'chat_message':
  //       setMessages((prev) => [...prev, message.message]);
  //       break;

  //     case 'user_joined':
  //       addSystemMessage(`${message.user.username} joined the chat 👋`);
  //       break;

  //     case 'user_left':
  //       addSystemMessage(`${message.username || 'Someone'} left the chat 👋`);
  //       break;
  //   }
  // }

  // function addSystemMessage(content: string) {
  //   const systemMessage: ChatMessage = {
  //     messageId: `system-${Date.now()}`,
  //     userId: 'system',
  //     username: 'System',
  //     content,
  //     timestamp: new Date(),
  //   };
  //   setMessages((prev) => [...prev, systemMessage]);
  // }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!newMessage.trim() || !isConnected) return;

    const message: ChatMessage = {
      messageId: `temp-${Date.now()}`,
      userId: currentUserId,
      username: currentUsername,
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Send to server
    sendMessage({
      type: 'chat_message',
      content: message.content,
    });

    // Focus input for next message
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  function getUserInitials(username: string): string {
    return username
      .split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function getUserColor(userId: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">💬</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Collaboration Chat
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Start the conversation!
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Send a message to begin collaborating with your team.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.messageId}
              className={`flex space-x-3 ${
                message.userId === currentUserId
                  ? 'flex-row-reverse space-x-reverse'
                  : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.userId === 'system' ? (
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🤖</span>
                  </div>
                ) : message.avatarUrl ? (
                  <img
                    src={message.avatarUrl}
                    alt={message.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: getUserColor(message.userId) }}
                  >
                    {getUserInitials(message.username)}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div
                className={`flex-1 max-w-xs lg:max-w-md ${
                  message.userId === currentUserId ? 'text-right' : ''
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    message.userId === 'system'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-center'
                      : message.userId === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.userId !== 'system' &&
                    message.userId !== currentUserId && (
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {message.username}
                      </div>
                    )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                <div
                  className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                    message.userId === currentUserId
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? 'Type your message...' : 'Connecting...'}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-2 text-xs text-red-500 flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Reconnecting to chat...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationChat;
