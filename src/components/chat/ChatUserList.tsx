import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

interface ChatUserListProps {
  conversations: any[];
}

export const ChatUserList: React.FC<ChatUserListProps> = ({ conversations }) => {
  const navigate = useNavigate();
  const { userId: activeUserId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const handleSelectUser = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="bg-white h-full overflow-y-auto">
      <div className="py-4">
        <h2 className="px-4 text-lg font-semibold text-gray-800 mb-4">Messages</h2>
        
        <div className="space-y-1">
          {conversations.length > 0 ? (
            conversations.map(conversation => {
              // The participants might be IDs or populated objects
              const otherUser = conversation.participants.find((p: any) => 
                (typeof p === 'string' ? p : p._id) !== (currentUser.id || currentUser._id)
              );
              
              if (!otherUser) return null;
              
              const otherUserId = typeof otherUser === 'string' ? otherUser : otherUser._id;
              const otherUserName = typeof otherUser === 'string' ? 'User' : otherUser.name;
              const otherUserAvatar = typeof otherUser === 'string' ? '' : otherUser.avatarUrl;
              const otherUserOnline = typeof otherUser === 'string' ? false : otherUser.isOnline;
              
              const lastMessage = conversation.lastMessage;
              const isActive = activeUserId === otherUserId;
              
              return (
                <div
                  key={conversation._id || conversation.id}
                  className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 border-l-4 border-primary-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                  onClick={() => handleSelectUser(otherUserId)}
                >
                  <Avatar
                    src={otherUserAvatar}
                    alt={otherUserName}
                    size="md"
                    status={otherUserOnline ? 'online' : 'offline'}
                    className="mr-3 flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {otherUserName}
                      </h3>
                      
                      {conversation.updatedAt && (
                        <span className="text-[10px] text-gray-500">
                          {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-600 truncate">
                        {lastMessage ? lastMessage.content : 'No messages'}
                      </p>
                      
                      {lastMessage && !lastMessage.isRead && lastMessage.sender !== (currentUser.id || currentUser._id) && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No conversations yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};