import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as chatService from '../../services/chatService';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useEffect, useState } from 'react';
// import { MessageCircle } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatService.getConversations();
        if (response.success) {
          setConversations(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch conversations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);
  
  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      {conversations.length > 0 ? (
        <ChatUserList conversations={conversations} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            {/* <MessageCircle size={32} className="text-gray-400" /> */}
          </div>
          <h2 className="text-xl font-medium text-gray-900">No messages yet</h2>
          <p className="text-gray-600 text-center mt-2">
            Start connecting with entrepreneurs and investors to begin conversations
          </p>
        </div>
      )}
    </div>
  );
};