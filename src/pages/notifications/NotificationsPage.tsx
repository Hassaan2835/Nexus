import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, UserPlus, DollarSign, Calendar, FileText } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import * as notificationService from '../../services/notificationService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        toast.success('All marked as read');
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-primary-600" />;
      case 'connection':
        return <UserPlus size={16} className="text-secondary-600" />;
      case 'investment':
        return <DollarSign size={16} className="text-accent-600" />;
      case 'meeting':
        return <Calendar size={16} className="text-warning-600" />;
      case 'document':
        return <FileText size={16} className="text-success-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your network activity</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          Mark all as read
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <Card
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`transition-all duration-300 cursor-pointer hover:shadow-md ${
                  !notification.isRead ? 'bg-primary-50/50 border-l-4 border-primary-600 shadow-sm' : ''
                }`}
              >
                <CardBody className="flex items-start p-4">
                  <Avatar
                    src={notification.sender?.avatarUrl}
                    alt={notification.sender?.name || 'System'}
                    size="md"
                    className="flex-shrink-0 mr-4 ring-2 ring-white"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {notification.sender?.name || 'Nexus System'}
                      </span>
                      {!notification.isRead && (
                        <Badge variant="primary" size="sm" rounded className="px-2">New</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mt-1">
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      {getNotificationIcon(notification.type)}
                      <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500">You don't have any new notifications.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};