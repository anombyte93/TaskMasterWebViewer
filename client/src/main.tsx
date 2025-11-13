import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Route, Router, Switch } from "wouter";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import { RouteLoadingFallback } from "./components/shared/LoadingFallback";
import { useWebSocketSync } from "./hooks/useWebSocketSync";

// Lazy load pages (only loaded when route matches)
const SystemDashboard = lazy(() => import("./pages/SystemDashboard"));
const NotFound = lazy(() => import("./pages/not-found"));

// Inner App component that uses WebSocket (must be inside QueryClientProvider)
function AppContent() {
  // Enable real-time WebSocket sync with React Query
  useWebSocketSync();

  return (
    <>
      <Router>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/system">
            <Suspense fallback={<RouteLoadingFallback />}>
              <SystemDashboard />
            </Suspense>
          </Route>
          <Route>
            <Suspense fallback={<RouteLoadingFallback />}>
              <NotFound />
            </Suspense>
          </Route>
        </Switch>
      </Router>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          className: 'toast-notification',
        }}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
