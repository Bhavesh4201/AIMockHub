import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SkillsProvider } from "./context/InterviewContext.jsx";

createRoot(document.getElementById("root")).render(
  <SkillsProvider>
    <App />
  </SkillsProvider>
);
