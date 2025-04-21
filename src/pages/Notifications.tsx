import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  Trash2, 
  Filter, 
  Search, 
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useNotifications, NotificationType } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Notifications = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAllNotifications 
  } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(notification => {
      // Filter by type
      if (filterType !== 'all' && notification.type !== filterType) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          notification.title.toLowerCase().includes(searchLower) ||
          (notification.description && notification.description.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by timestamp
      if (sortBy === 'newest') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        return a.timestamp.getTime() - b.timestamp.getTime();
      }
    });
  
  // Get icon based on notification type
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Get badge color based on notification type
  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage and view all your notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={markAllAsRead} 
            disabled={unreadCount === 0}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          <Button 
            variant="destructive" 
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter and sort your notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as NotificationType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {filteredNotifications.length === 0 
            ? 'No notifications found' 
            : `Showing ${filteredNotifications.length} notification${filteredNotifications.length === 1 ? '' : 's'}`}
        </h2>
        
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={cn(
                  "transition-colors",
                  !notification.read && "border-l-4 border-l-primary"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          <Badge variant="outline" className={cn("text-xs", getTypeBadge(notification.type))}>
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        {notification.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(notification.timestamp, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark as read
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'You don\'t have any notifications yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications; 