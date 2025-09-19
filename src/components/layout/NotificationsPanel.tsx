import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  X, 
  AlertTriangle, 
  User, 
  MessageSquare, 
  Settings,
  Check
} from 'lucide-react';
import { mockNotifications } from '../../utils/mockData';
import { Notification } from '@/types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'user_verification':
        return <User className="h-4 w-4" />;
      case 'machine_issue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'query_submitted':
        return <MessageSquare className="h-4 w-4" />;
      case 'system_alert':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = () => {
    return 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/40 dark:border-l-amber-500 dark:border-t-amber-500';
  };

  const getIconBackground = (priority: Notification['priority']) => {
    if (priority === 'high') return 'bg-red-100 text-red-600 dark:bg-red-800/60 dark:text-red-200';
    if (priority === 'medium') return 'bg-amber-100 text-amber-600 dark:bg-amber-800/60 dark:text-amber-200';
    return 'bg-blue-100 text-blue-600 dark:bg-blue-800/60 dark:text-blue-200';
  };

  const getBadgeVariant = () => {
    // Use outline for all to let our custom classes take precedence
    return 'outline' as const;
  };

  const getBadgeClasses = (priority: Notification['priority']) => {
    const base = "text-xs border";
    if (priority === 'high') return `${base} bg-red-100 text-red-800 border-red-300 dark:bg-red-800/80 dark:text-red-100 dark:border-red-600`;
    if (priority === 'medium') return `${base} bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-800/80 dark:text-amber-100 dark:border-amber-600`;
    return `${base} bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/80 dark:text-blue-100 dark:border-blue-600`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return time.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      <div className="bg-background w-full max-w-md h-full shadow-xl border-l border-border dark:border-l-2 dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-gray-700 dark:bg-gray-900/95">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 dark:text-gray-200" />
            <h2 className="dark:text-gray-100 font-medium">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="dark:bg-red-600 dark:text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800">
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          <div className="p-4 dark:bg-gray-900">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="h-12 w-12 mx-auto text-muted-foreground dark:text-gray-500 mb-4" />
                <p className="text-muted-foreground dark:text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer transition-all duration-200 border-l-4 border-t-2 hover:shadow-lg ${
                      getNotificationColor()
                    } ${!notification.read ? 'shadow-md dark:shadow-lg' : 'opacity-75'} dark:border-r dark:border-b dark:border-gray-600 dark:shadow-xl dark:hover:shadow-2xl`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4 dark:bg-transparent">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-1.5 rounded-full ${getIconBackground(notification.priority)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium truncate text-foreground dark:text-white">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-gray-200 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground dark:text-gray-300">
                                {formatTime(notification.timestamp)}
                              </p>
                              <Badge 
                                variant={getBadgeVariant()}
                                className={getBadgeClasses(notification.priority)}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}