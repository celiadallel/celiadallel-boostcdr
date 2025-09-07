import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Simple wrapper pour éviter les problèmes de contexte
// L'authentification est déjà gérée dans useAuth via les hooks
function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <AuthWrapper>
    <App />
  </AuthWrapper>
);