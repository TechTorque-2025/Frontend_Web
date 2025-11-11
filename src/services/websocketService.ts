"use client";
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type NotificationCallback = (notification: unknown) => void;
export type UnreadCountCallback = (count: number) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private userId: string | null = null;
  private notificationSubscription: StompSubscription | null = null;
  private countSubscription: StompSubscription | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.client = null;
  }

  connect(userId: string, onNotification: NotificationCallback, onUnreadCount: UnreadCountCallback): void {
    if (this.connected && this.userId === userId) {
      console.log('WebSocket already connected for user:', userId);
      return;
    }

    this.userId = userId;
    const wsUrl = process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL || 'http://localhost:8088/ws/notifications';

    this.client = new Client({
  // SockJS returns a WebSocket-like object; assert to WebSocket compatible type to satisfy the STOMP client
  webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[STOMP Debug]:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('WebSocket connected successfully');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Subscribe to user-specific notification queue
        this.notificationSubscription = this.client!.subscribe(
          `/user/${userId}/queue/notifications`,
          (message: IMessage) => {
            const notification = JSON.parse(message.body);
            console.log('Received notification:', notification);
            onNotification(notification);
          }
        );

        // Subscribe to user-specific unread count updates
        this.countSubscription = this.client!.subscribe(
          `/user/${userId}/queue/notifications/count`,
          (message: IMessage) => {
            const count = parseInt(message.body);
            console.log('Received unread count:', count);
            onUnreadCount(count);
          }
        );

        console.log('Subscribed to notifications for user:', userId);
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.connected = false;
      },

      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        this.connected = false;
      },

      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this.handleReconnect(userId, onNotification, onUnreadCount);
      },
    });

    this.client.activate();
  }

  private handleReconnect(userId: string, onNotification: NotificationCallback, onUnreadCount: UnreadCountCallback): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect(userId, onNotification, onUnreadCount);
      }, 5000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached. Please refresh the page.');
    }
  }

  disconnect(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = null;
    }

    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
      this.countSubscription = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.connected = false;
    this.userId = null;
    this.reconnectAttempts = 0;
    console.log('WebSocket disconnected and cleaned up');
  }

  isConnected(): boolean {
    return this.connected;
  }

  getUserId(): string | null {
    return this.userId;
  }
}

// Singleton instance
const websocketService = new WebSocketService();
export default websocketService;
