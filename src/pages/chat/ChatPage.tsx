import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, MessageCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socketService';
import * as chatService from '../../services/chatService';
import * as userService from '../../services/userService';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  // Local state for partner info if we don't have it from a conversation yet
  const [chatPartner, setChatPartner] = useState<any>(null);
  
  useEffect(() => {
    if (currentUser) {
      loadConversations();
      const socket = socketService.getSocket();
      
      socket.on('receive-message', (message: any) => {
        if (message.sender === userId || message.receiver === userId) {
          setMessages(prev => [...prev, message]);
          loadConversations();
        }
      });

      return () => {
        socket.off('receive-message');
      };
    }
  }, [currentUser, userId]);
  
  useEffect(() => {
    if (currentUser && userId) {
      loadMessages();
      // Fetch partner info from backend
      const fetchPartner = async () => {
        try {
          const res = await userService.getUserById(userId);
          if (res.success) setChatPartner(res.data);
        } catch (error) {
          console.error('Failed to fetch partner info');
        }
      };
      fetchPartner();
    } else {
      setMessages([]);
      setChatPartner(null);
    }
  }, [currentUser, userId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const loadConversations = async () => {
    try {
      const response = await chatService.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading conversations', error);
    }
  };

  const loadMessages = async () => {
    if (!userId) return;
    try {
      const response = await chatService.getMessages(userId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading messages', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !userId) return;
    
    try {
      const response = await chatService.sendMessage({
        receiverId: userId,
        content: newMessage
      });
      
      if (response.success) {
        const msg = response.data;
        setMessages([...messages, msg]);
        setNewMessage('');
        
        // Emit socket event
        socketService.emit('send-message', {
          ...msg,
          receiverId: userId
        });
        
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message', error);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in shadow-sm">
      {/* Conversations sidebar */}
      <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-gray-200 bg-gray-50/30">
        <ChatUserList conversations={conversations} />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat header */}
        {chatPartner ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10">
              <div className="flex items-center">
                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                  className="mr-3 ring-2 ring-primary-50"
                />
                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">{chatPartner.name}</h2>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                    {chatPartner.isOnline ? 'Active Now' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-600">
                  <Phone size={18} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-600"
                  onClick={() => {
                    const roomId = [currentUser.id, userId].sort().join('-');
                    navigate(`/video-call/${roomId}`);
                  }}
                >
                  <Video size={18} />
                </Button>
                
                <Button variant="ghost" size="sm" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-600">
                  <Info size={18} />
                </Button>
              </div>
            </div>
            
            {/* Messages container */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-6">
              {messages.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {messages.map(message => (
                    <ChatMessage
                      key={message._id || message.id}
                      message={{
                        id: message._id || message.id,
                        content: message.content,
                        senderId: message.sender?._id || message.sender,
                        receiverId: message.receiver?._id || message.receiver,
                        timestamp: message.createdAt,
                        isRead: message.isRead || false
                      }}
                      isCurrentUser={(message.sender?._id || message.sender) === currentUser.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-60">
                  <div className="bg-white p-6 rounded-full shadow-lg mb-4">
                    <MessageCircle size={48} className="text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Start the conversation</h3>
                  <p className="text-gray-500 mt-2">Send a message to {chatPartner.name} to get started.</p>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 h-14">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-primary-600"
                >
                  <Smile size={22} />
                </Button>
                
                <input
                  type="text"
                  placeholder="Type your message here..."
                  className="bg-transparent border-none focus:ring-0 flex-1 text-sm text-gray-800 placeholder-gray-400"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="rounded-xl w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gray-50 p-10 rounded-full mb-6 border border-gray-100 shadow-inner">
              <MessageCircle size={64} className="text-primary-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Messages</h2>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              Select a conversation from the sidebar or find a connection to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};