import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/query-client";
import App from "./App";
import "./index.css";
import ToastProvider from "./components/ui/Toast";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <App />
            </ToastProvider>
        </QueryClientProvider>
    </StrictMode>,
);