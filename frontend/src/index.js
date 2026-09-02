import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";

// Suppress benign ResizeObserver loop notifications from triggering Webpack dev overlay
const resizeObserverLoopRegex = /ResizeObserver loop (completed with undelivered notifications|limit exceeded)/i;

window.addEventListener("error", (e) => {
  if (e.message && resizeObserverLoopRegex.test(e.message)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (e) => {
  if (e.reason && resizeObserverLoopRegex.test(e.reason.message || String(e.reason))) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === "string" && resizeObserverLoopRegex.test(args[0])) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
