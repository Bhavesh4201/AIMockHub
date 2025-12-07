import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { InterviewProvider } from "./context/InterviewContext";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <InterviewProvider>     
        <App />
      </InterviewProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
