import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { findUserById } from '../../data/users';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 self-end flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase">
          {message.senderId.substring(0, 2)}
        </div>
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
            isCurrentUser
              ? 'bg-primary-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        
        <span className="text-[10px] text-gray-400 mt-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
      
      {isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-primary-100 ml-2 self-end flex items-center justify-center text-[10px] text-primary-600 font-bold uppercase">
          Me
        </div>
      )}
    </div>
  );
};