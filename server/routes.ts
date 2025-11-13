import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { storage } from "./storage";
import tasksRouter from "./src/routes/tasks";
import issuesRouter from "./src/routes/issues";
import systemRouter from "./src/routes/system";
import { taskMasterService } from "./src/services/TaskMasterService";
import { issueService } from "./services/IssueService";
import { errorHandler } from "./src/middleware/errorHandler";
import { requestLogger } from "./src/middleware/requestLogger";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  console.log("[Server] Initializing services...");
  await taskMasterService.initialize();
  await issueService.initialize();
  console.log("[Server] Services initialized successfully");

  // Apply request logger middleware
  app.use(requestLogger);

  // Register API routes
  app.use("/api/tasks", tasksRouter);
  app.use("/api/issues", issuesRouter);
  app.use("/api/system", systemRouter);

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
    clientTracking: true
  });

  // Track active connections
  const clients = new Set<WebSocket>();

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket) => {
    console.log('[WebSocket] Client connected');
    clients.add(ws);

    // Send initial connection acknowledgment
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));

    // Heartbeat: Respond to ping with pong
    ws.on('ping', () => {
      ws.pong();
    });

    // Handle client messages
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('[WebSocket] Received message:', data);

        // Handle ping from client
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    });

    // Handle connection close
    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      clients.delete(ws);
    });
  });

  // Connect TaskMasterService change events to WebSocket broadcast
  taskMasterService.on('change', (tasks) => {
    console.log(`[WebSocket] Broadcasting tasks update to ${clients.size} clients`);

    const message = JSON.stringify({
      type: 'tasks:update',
      timestamp: new Date().toISOString(),
      data: { tasksCount: tasks.length }
    });

    // Broadcast to all connected clients
    clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('[WebSocket] Error sending to client:', error);
          clients.delete(client);
        }
      }
    });
  });

  // Handle TaskMasterService errors
  taskMasterService.on('error', (error) => {
    console.error('[WebSocket] TaskMasterService error:', error);

    const message = JSON.stringify({
      type: 'tasks:error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Broadcast error to all clients
    clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  });

  // Heartbeat interval: Send ping every 30 seconds to keep connections alive
  const heartbeatInterval = setInterval(() => {
    clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.ping();
      } else {
        clients.delete(client);
      }
    });
  }, 30000);

  // Clean up on server close
  httpServer.on('close', () => {
    console.log('[WebSocket] Cleaning up WebSocket server...');
    clearInterval(heartbeatInterval);
    wss.close();
  });

  console.log('[WebSocket] Server initialized on /ws');

  return httpServer;
}
