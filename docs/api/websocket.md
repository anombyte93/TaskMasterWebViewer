# WebSocket API

Real-time updates for TaskMaster tasks using WebSocket protocol.

## Connection

### WebSocket URL

```
ws://localhost:5000/ws
```

### Establishing Connection

**JavaScript/TypeScript**:
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
};
```

**Node.js (ws library)**:
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5000/ws');

ws.on('open', () => {
  console.log('WebSocket connected');
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received:', message);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('WebSocket disconnected');
});
```

---

## Message Types

All WebSocket messages follow this format:

```typescript
{
  type: string,           // Message type identifier
  timestamp: string,      // ISO 8601 timestamp
  data?: any,            // Optional message data
  message?: string,      // Optional text message
  error?: string         // Optional error message
}
```

---

## Server-to-Client Messages

### Connection Acknowledgment

Sent immediately after connection is established.

```json
{
  "type": "connected",
  "message": "WebSocket connected"
}
```

### Task Update

Sent when `tasks.json` file changes on the server.

```json
{
  "type": "tasks:update",
  "timestamp": "2025-01-14T10:30:00.000Z",
  "data": {
    "tasksCount": 17
  }
}
```

**Trigger**: File system change detected in `.taskmaster/tasks/tasks.json`

**Debounce**: 300ms (multiple rapid changes are batched)

**Response Action**: Client should fetch updated tasks via REST API

**Example Client Handler**:
```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'tasks:update') {
    console.log(`Tasks updated: ${message.data.tasksCount} tasks`);

    // Fetch updated tasks
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        console.log('Updated tasks:', data.tasks);
        // Update UI with new tasks
      });
  }
};
```

### Task Error

Sent when TaskMasterService encounters an error.

```json
{
  "type": "tasks:error",
  "timestamp": "2025-01-14T10:30:00.000Z",
  "error": "Failed to load tasks: tasks.json not found"
}
```

**Trigger**: Error in TaskMasterService (file read error, validation error, etc.)

**Response Action**: Display error to user, attempt reconnection

### Pong Response

Sent in response to client ping messages.

```json
{
  "type": "pong"
}
```

---

## Client-to-Server Messages

### Ping

Send a ping to check connection health.

**Request**:
```json
{
  "type": "ping"
}
```

**Response**:
```json
{
  "type": "pong"
}
```

**Example**:
```javascript
// Send ping every 30 seconds
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);
```

---

## Connection Management

### Heartbeat

The server automatically sends WebSocket ping frames every 30 seconds to keep connections alive. Clients should respond with pong frames (handled automatically by most WebSocket libraries).

### Reconnection

Clients should implement automatic reconnection with exponential backoff:

```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const baseDelay = 1000; // 1 second

function connect() {
  const ws = new WebSocket('ws://localhost:5000/ws');

  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0; // Reset on successful connection
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');

    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = baseDelay * Math.pow(2, reconnectAttempts);
      console.log(`Reconnecting in ${delay}ms...`);

      setTimeout(() => {
        reconnectAttempts++;
        connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    ws.close();
  };

  return ws;
}

const ws = connect();
```

### Connection States

WebSocket connections have four states:

| State | Value | Description |
|-------|-------|-------------|
| `CONNECTING` | `0` | Connection is being established |
| `OPEN` | `1` | Connection is open and ready |
| `CLOSING` | `2` | Connection is closing |
| `CLOSED` | `3` | Connection is closed |

Check connection state before sending:
```javascript
if (ws.readyState === WebSocket.OPEN) {
  ws.send(JSON.stringify({ type: 'ping' }));
}
```

---

## Full Example: React Hook

```typescript
import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  timestamp?: string;
  data?: any;
  error?: string;
}

export function useTaskMasterWebSocket(url: string) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message);
          setLastMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setConnected(false);

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < 10) {
          const delay = 1000 * Math.pow(2, reconnectAttempts.current);
          console.log(`[WebSocket] Reconnecting in ${delay}ms...`);

          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };
    }

    connect();

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  // Send ping every 30 seconds
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [connected]);

  return {
    connected,
    lastMessage,
    send: (message: any) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
      }
    }
  };
}
```

**Usage**:
```typescript
function TaskDashboard() {
  const { connected, lastMessage } = useTaskMasterWebSocket('ws://localhost:5000/ws');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (lastMessage?.type === 'tasks:update') {
      // Fetch updated tasks
      fetch('/api/tasks')
        .then(res => res.json())
        .then(data => setTasks(data.tasks));
    }
  }, [lastMessage]);

  return (
    <div>
      <div>Status: {connected ? 'Connected' : 'Disconnected'}</div>
      <div>Tasks: {tasks.length}</div>
    </div>
  );
}
```

---

## Best Practices

1. **Always Handle Disconnections**: Implement automatic reconnection with exponential backoff
2. **Validate Messages**: Parse and validate all incoming messages
3. **Check Connection State**: Verify `readyState === OPEN` before sending
4. **Implement Heartbeat**: Send periodic pings to detect stale connections
5. **Fetch Full Data on Update**: WebSocket only notifies of changes, use REST API to fetch updated data
6. **Handle Errors Gracefully**: Display user-friendly error messages
7. **Clean Up**: Close WebSocket connections when components unmount

---

## Debugging

### Enable Debug Logging

**Server-side** (already implemented):
```
[WebSocket] Client connected
[WebSocket] Broadcasting tasks update to 3 clients
[WebSocket] Client disconnected
```

**Client-side**:
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onopen = () => console.log('[WS] Connected');
ws.onmessage = (e) => console.log('[WS] Message:', JSON.parse(e.data));
ws.onerror = (e) => console.error('[WS] Error:', e);
ws.onclose = () => console.log('[WS] Closed');
```

### Test WebSocket Connection

**Using wscat** (CLI tool):
```bash
npm install -g wscat
wscat -c ws://localhost:5000/ws
```

**Using curl** (WebSocket upgrade):
```bash
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: $(echo $RANDOM | base64)" \
  http://localhost:5000/ws
```

---

## Performance

- **Connection Limit**: No hard limit, scales with system resources
- **Message Size**: No size limit, but keep messages small for performance
- **Latency**: Typically <50ms for local connections
- **Debouncing**: File changes debounced at 300ms to prevent spam
- **Heartbeat**: Server pings every 30 seconds

---

## Security

- **No Authentication**: Currently no authentication is implemented
- **CORS**: WebSocket server accepts all origins in development
- **Message Validation**: All messages should be validated by clients
- **XSS Prevention**: Sanitize and validate all message content before rendering

**Future Enhancements**:
- Add JWT-based authentication
- Implement message signing
- Add rate limiting per connection
- Enable HTTPS/WSS in production
