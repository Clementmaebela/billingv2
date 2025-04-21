import React, { useState } from 'react';
import { BellIcon, CheckCircle2, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification, useNotifications } from '@/contexts/NotificationsContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const NotificationItem = ({ notification, onRead }: { notification: Notification, onRead: () => void }) => {
  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <DropdownMenuItem 
      className={cn(
        "flex flex-col items-start p-3 cursor-default",
        !notification.read && "bg-gray-50"
      )}
      onClick={onRead}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center">
          <CheckCircle2 className={cn("h-4 w-4 mr-2", getIconColor(notification.type))} />
          <span className="font-medium">{notification.title}</span>
        </div>
        {!notification.read && (
          <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
        )}
      </div>
      {notification.description && (
        <p className="text-sm text-gray-500 mt-1 pl-6">{notification.description}</p>
      )}
      <p className="text-xs text-gray-400 mt-1 pl-6">
        {format(notification.timestamp, 'MMM d, h:mm a')}
      </p>
    </DropdownMenuItem>
  );
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAllNotifications 
  } = useNotifications();

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      // When opening, automatically mark all as read after a delay
      setTimeout(() => {
        markAllAsRead();
      }, 2000);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full h-9 w-9">
          <BellIcon className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" 
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead} 
              disabled={unreadCount === 0}
              className="text-xs h-7"
            >
              Mark all as read
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className="text-xs h-7"
            >
              Clear all
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <ScrollArea className="h-[300px]">
            {notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onRead={() => handleNotificationClick(notification.id)}
              />
            ))}
          </ScrollArea>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No notifications</p>
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link to="/notifications" className="w-full">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <ListFilter className="mr-2 h-4 w-4" />
              View all notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
