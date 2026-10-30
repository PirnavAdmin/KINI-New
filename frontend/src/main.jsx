import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@app/App";
import AppProviders from "@app/providers";
import "@/index.css";
import "@styles/globals.css";
import "@styles/theme.css";
import "@styles/brand-theme.css";
import "@styles/kini-mentor.css";
import "@styles/kini-student.css";
import "@styles/sidebar-navigation.css";
import "@styles/table-header-system.css";
import "@styles/kini-student-learning.css";
import "@styles/kini-student-v13.css";
import "@styles/kini-student-v15.css";
import "@styles/app-density.css";
import "@styles/kini-mentor-v15.css";
import "@styles/kini-org-v16.css";
import "@styles/kini-mentor-v17.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
