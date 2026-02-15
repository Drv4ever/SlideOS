
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router-dom";

  import App from "./app/App.jsx";
  import "./styles/index.css";
 
// for the routing purpose
  createRoot(document.getElementById("root")).render(
    <BrowserRouter>
    
    <App />

    </BrowserRouter>


);
  