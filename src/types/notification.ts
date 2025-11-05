// Notification TypeScript Interfaces

export interface NotificationResponse {
  notificationId: string;
  type: string;
  message: string;
  details?: string;
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface SubscribeRequest {
  token: string;
  platform: 'WEB' | 'IOS' | 'ANDROID';
}

export interface SubscriptionResponse {
  subscriptionId: string;
  message: string;
}

export interface MarkAsReadRequest {
  read: boolean;
}

export interface UnsubscribeRequest {
  subscriptionId: string;
}

export interface ApiResponse {
  message: string;
  data?: unknown;
}
