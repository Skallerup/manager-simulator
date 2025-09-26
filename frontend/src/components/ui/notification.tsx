"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface NotificationProps {
  notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
    timestamp: string;
  };
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Notification({ 
  notification, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close if enabled
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(closeTimer);
      };
    }
    
    return () => clearTimeout(showTimer);
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'player_sold':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'player_sold':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className={cn(
        "rounded-lg border p-4 shadow-lg",
        getBgColor()
      )}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {notification.message}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: any[]; 
  onRemove: (index: number) => void; 
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <Notification
          key={`${notification.timestamp}-${index}`}
          notification={notification}
          onClose={() => onRemove(index)}
          autoClose={true}
          duration={5000}
        />
      ))}
    </div>
  );
}



