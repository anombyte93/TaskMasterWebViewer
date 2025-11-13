import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * WebSocket message types from server
 */
interface WebSocketMessage {
  type: 'connected' | 'pong' | 'tasks:update' | 'tasks:error';
  timestamp?: string;
  message?: string;
  data?: {
    tasksCount: number;
  };
  error?: string;
}

/**
 * Custom hook for WebSocket real-time sync with React Query
 *
 * Features:
 * - Connects to WebSocket server at /ws
 * - Automatically invalidates React Query cache on tasks:update events
 * - Handles reconnection with exponential backoff
 * - Sends heartbeat ping every 30 seconds
 * - Cleans up connection on unmount
 *
 * Usage:
 * ```tsx
 * function App() {
 *   useWebSocketSync();
 *   return <Dashboard />;
 * }
 * ```
 */
export function useWebSocketSync() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  useEffect(() => {
    function connect() {
      // Determine WebSocket protocol based on current page protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log('[WebSocket] Connecting to', wsUrl);

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WebSocket] Connected successfully');
          reconnectAttemptsRef.current = 0; // Reset reconnect counter on success

          // Start heartbeat: Send ping every 30 seconds
          heartbeatIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('[WebSocket] Received:', message);

            switch (message.type) {
              case 'connected':
                console.log('[WebSocket]', message.message);
                break;

              case 'tasks:update':
                console.log('[WebSocket] Tasks updated, invalidating cache...');
                // Invalidate all task-related queries to trigger refetch
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                break;

              case 'tasks:error':
                console.error('[WebSocket] Server error:', message.error);
                // Could show toast notification here
                break;

              case 'pong':
                // Heartbeat acknowledged
                break;

              default:
                console.warn('[WebSocket] Unknown message type:', message);
            }
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] Connection error:', error);
        };

        ws.onclose = (event) => {
          console.log('[WebSocket] Connection closed:', event.code, event.reason);

          // Clear heartbeat interval
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }

          // Attempt to reconnect with exponential backoff
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          } else {
            console.error('[WebSocket] Max reconnection attempts reached');
          }
        };
      } catch (error) {
        console.error('[WebSocket] Failed to create connection:', error);
      }
    }

    // Initial connection
    connect();

    // Cleanup function
    return () => {
      console.log('[WebSocket] Cleaning up connection...');

      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [queryClient]);

  return null; // This hook doesn't render anything
}
