/**
 * Enhanced WebSocket Service (V2)
 * Features: Single connection, automatic store integration, deduplication
 */

import { Client, Frame, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { localURL } from '../../localURL';
import { WebSocketMessage, IncomingMessage } from '../types/chatV2';
import { useChatStore } from '../store/chatStoreV2';

const BACKEND_URL = `${localURL}`;

interface ConnectionConfig {
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
}

/**
 * ─── WEBSOCKET SERVICE (SINGLETON) ────────────────────────────────────────
 *
 * This service:
 * 1. Maintains a SINGLE global WebSocket connection (singleton pattern)
 * 2. Automatically routes messages to Zustand store
 * 3. Handles deduplication internally
 * 4. Manages reconnection logic
 * 5. Provides connection status callbacks
 *
 * Architecture:
 * WebSocket Service (Singleton)
 *    ↓
 * Message received
 *    ↓
 * Router: Determine message type
 *    ↓
 * Store action: addWebSocketMessage() [handles dedup]
 *    ↓
 * Zustand state update + component re-render
 */
class WebSocketServiceV2 {
  private client: Client | null = null;
  private connected: boolean = false;
  private userId: string | null = null;
  private messageSubscription: StompSubscription | null = null;
  private fileSubscription: StompSubscription | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  // Callbacks for external listeners
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private messageCallbacks: ((message: IncomingMessage) => void)[] = [];

  /**
   * Connect to WebSocket server
   * Safe to call multiple times — will reuse existing connection
   */
  public connect(uid: string, config?: ConnectionConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      // Already connected for this user
      if (this.connected && this.userId === uid) {
        resolve();
        return;
      }

      // Disconnected previous user
      if (this.connected && this.userId !== uid) {
        this.disconnect();
      }

      this.userId = uid;

      // Apply config
      if (config?.reconnectDelay) this.reconnectDelay = config.reconnectDelay;
      if (config?.maxReconnectAttempts) this.maxReconnectAttempts = config.maxReconnectAttempts;

      const socket = new SockJS(`${BACKEND_URL}/ws?userId=${uid}`);

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          login: uid,
          passcode: 'password',
        },
        debug: (msg: string) => console.log('[ChatWS]', msg),
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: config?.heartbeatIncoming || 30000,
        heartbeatOutgoing: config?.heartbeatOutgoing || 30000,

        // ─── ON CONNECT ──────────────────────────────────────────────────────
        onConnect: (frame: Frame) => {
          console.log('✅ WebSocket connected for user:', uid);
          this.connected = true;
          this.reconnectAttempts = 0;

          // Update store
          useChatStore.getState().setWebSocketConnected(true);

          // Subscribe to queues for this user
          this.subscribeToQueues();

          // Notify listeners
          this.notifyConnectionStatus(true);
          resolve();
        },

        // ─── ON DISCONNECT ──────────────────────────────────────────────────
        onDisconnect: (frame: Frame) => {
          console.log('❌ WebSocket disconnected:', frame);
          this.connected = false;
          this.messageSubscription = null;
          this.fileSubscription = null;

          // Update store
          useChatStore.getState().setWebSocketConnected(false);

          // Notify listeners
          this.notifyConnectionStatus(false);
        },

        // ─── ON STOMP ERROR ──────────────────────────────────────────────────
        onStompError: (frame: Frame) => {
          console.error('❌ STOMP Error:', frame.headers['message']);
          this.handleConnectionError(frame.headers['message']);
          reject(new Error(frame.headers['message'] || 'STOMP Error'));
        },

        // ─── ON WEBSOCKET ERROR ──────────────────────────────────────────────
        onWebSocketError: (error: Event) => {
          console.error('❌ WebSocket Error:', error);
          this.handleConnectionError('WebSocket connection failed');
          reject(error);
        },
      });

      this.client.activate();

      // Timeout fallback
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      const originalOnConnect = this.client.onConnect;
      this.client.onConnect = (frame: Frame) => {
        clearTimeout(timeout);
        originalOnConnect?.call(this.client, frame);
      };
    });
  }

  /**
   * Subscribe to message and file queues
   * Called automatically after connection
   */
  private subscribeToQueues(): void {
    if (!this.client?.connected) {
      console.warn('⚠️ Client not ready for subscriptions');
      return;
    }

    // ─── MESSAGE QUEUE ──────────────────────────────────────────────────────
    this.messageSubscription = this.client.subscribe(
      `/user/hivemarket-queue/messages`,
      (frame: IMessage) => {
        try {
          const message: IncomingMessage = JSON.parse(frame.body);
          console.log('📨 Message received:', message);

          // Route through store (handles deduplication)
          useChatStore.getState().addWebSocketMessage(message);

          // Notify legacy listeners (backward compatibility)
          this.notifyMessageCallbacks(message);
        } catch (err) {
          console.error('❌ Failed to parse message:', err);
        }
      }
    );

    // ─── FILE QUEUE ─────────────────────────────────────────────────────────
    this.fileSubscription = this.client.subscribe(
      `/user/hivemarket-queue/files`,
      (frame: IMessage) => {
        try {
          const fileEvent = JSON.parse(frame.body);
          console.log('📁 File event received:', fileEvent);

          // TODO: Handle file delivery
          // useChatStore.getState().addFileEvent(fileEvent);
        } catch (err) {
          console.error('❌ Failed to parse file event:', err);
        }
      }
    );

    console.log(`✅ Subscribed to queues for user: ${this.userId}`);
  }

  /**
   * Send text message
   */
  public sendMessage(
    buyerId: string,
    sellerId: string,
    message: string
  ): void {
    if (!this.client?.connected) {
      console.error('⚠️ WebSocket not connected');
      // TODO: Queue message for retry
      return;
    }

    const payload = {
      buyerId,
      sellerId,
      message,
    };

    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(payload),
    });

    console.log('📤 Message sent:', payload);
  }

  /**
   * Send file in chunks
   */
  public async sendFile(
    buyerId: string,
    sellerId: string,
    fileName: string,
    fileType: string,
    fileData: Uint8Array
  ): Promise<void> {
    if (!this.client?.connected) {
      throw new Error('WebSocket not connected');
    }

    const CHUNK_SIZE = 512 * 1024; // 512 KB
    const totalChunks = Math.ceil(fileData.length / CHUNK_SIZE);

    console.log(
      `📁 Sending file: ${fileName} (${fileData.length} bytes, ${totalChunks} chunks)`
    );

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileData.length);
      const chunk = fileData.slice(start, end);
      const base64Chunk = btoa(String.fromCharCode(...chunk));

      const payload = {
        buyerId,
        sellerId,
        fileName,
        fileType,
        chunkIndex,
        totalChunks,
        chunkData: base64Chunk,
      };

      this.client.publish({
        destination: '/app/chat.sendFile',
        body: JSON.stringify(payload),
      });

      console.log(`📤 Chunk ${chunkIndex + 1}/${totalChunks} sent`);

      if (chunkIndex < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ File upload complete: ${fileName}`);
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): Promise<void> {
    return new Promise(resolve => {
      if (!this.client || !this.connected) {
        resolve();
        return;
      }

      console.log('Disconnecting WebSocket...');
      this.client.deactivate();

      setTimeout(() => {
        this.client = null;
        this.userId = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        resolve();
      }, 1000);
    });
  }

  /**
   * Register callback for messages (legacy)
   */
  public onMessage(callback: (message: IncomingMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  /**
   * Register callback for connection status
   */
  public onConnectionStatus(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Notify all connection status callbacks
   */
  private notifyConnectionStatus(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (err) {
        console.error('Error in connection callback:', err);
      }
    });
  }

  /**
   * Notify all message callbacks (legacy)
   */
  private notifyMessageCallbacks(message: IncomingMessage): void {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (err) {
        console.error('Error in message callback:', err);
      }
    });
  }

  /**
   * Handle connection errors with retry
   */
  private handleConnectionError(error: string): void {
    console.error('Connection error:', error);

    // Implement exponential backoff for reconnection
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.userId
    ) {
      this.reconnectAttempts++;
      const delayMs = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delayMs}ms`
      );

      setTimeout(() => {
        this.connect(this.userId!).catch(err => {
          console.error('Reconnection failed:', err);
        });
      }, delayMs);
    }
  }

  /**
   * Get current connection status
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get current user ID
   */
  public getUserId(): string | null {
    return this.userId;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connected ? 'connected' : 'disconnected';
  }
}

// ─── SINGLETON INSTANCE ───────────────────────────────────────────────────
export const chatWebSocketService = new WebSocketServiceV2();

/**
 * ─── OPTIONAL: INITIALIZE WEBSOCKET ON APP START ───────────────────────
 *
 * Call this in your root _layout.tsx after login
 * Usage: initializeWebSocket(userId)
 */
export const initializeWebSocket = async (userId: string): Promise<void> => {
  try {
    await chatWebSocketService.connect(userId);
    console.log('✅ WebSocket initialized for user:', userId);
  } catch (err) {
    console.error('❌ Failed to initialize WebSocket:', err);
  }
};

/**
 * ─── CLEANUP ON LOGOUT ────────────────────────────────────────────────────
 *
 * Call this in your logout handler
 * Usage: cleanupWebSocket()
 */
export const cleanupWebSocket = async (): Promise<void> => {
  try {
    await chatWebSocketService.disconnect();
    useChatStore.getState().clearAllCaches();
    console.log('✅ WebSocket cleaned up');
  } catch (err) {
    console.error('❌ Failed to cleanup WebSocket:', err);
  }
};
