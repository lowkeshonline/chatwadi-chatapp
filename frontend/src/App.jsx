import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import ChatDashboard from './components/ChatDashboard';

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (token, email) => {
    setToken(token);
    setEmail(email);
    setLoggedIn(true);
  };

  return (
    <Router>
      <div className="container mx-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/auth" 
            element={
              loggedIn ? 
                <Navigate to="/chat" /> : 
                <AuthPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/chat" 
            element={
              loggedIn ? 
                <ChatDashboard token={token} email={email} /> : 
                <Navigate to="/auth" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
