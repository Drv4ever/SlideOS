
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router-dom";
  import { GoogleOAuthProvider } from "@react-oauth/google";

  import App from "./App.jsx";
  import "./styles/index.css";

// for the routing purpose
  createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>

    <App />

    </BrowserRouter>
    </GoogleOAuthProvider>


);

