import { Suspense } from "react";
import AppRoutes from "./routes/appRoutes.jsx";

function App() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>Loading...</div>
          <div style={{ width: "40px", height: "40px", margin: "0 auto", border: "3px solid rgba(56,189,248,0.2)", borderTop: "3px solid #38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <AppRoutes />
    </Suspense>
  );
}

export default App; 