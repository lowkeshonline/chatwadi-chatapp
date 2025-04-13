import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import ChatDashboard from './components/ChatDashboard';

// Wrapper component to handle auth redirects
function AuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Only redirect if we're not already on the auth page and have OAuth params
    if (!location.pathname.includes('/auth')) {
      const params = new URLSearchParams(location.search);
      if (params.has('code') || params.has('token') || params.has('state')) {
        navigate('/auth', { replace: true });
      }
    }
  }, [location.pathname]); // Only depend on pathname changes
  
  return null;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('user_email') || '');
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('auth_token'));

  const handleLogin = (token, email) => {
    if (!token || !email) return; // Guard against invalid login attempts
    
    // Store auth info in localStorage for persistence
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    
    setToken(token);
    setEmail(email);
    setLoggedIn(true);
  };
  
  const handleLogout = () => {
    // Clear auth info
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    
    setToken('');
    setEmail('');
    setLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            loggedIn ? (
              <Navigate to="/chat" replace />
            ) : (
              <HomePage />
            )
          } 
        />
        <Route 
          path="/auth" 
          element={
            loggedIn ? (
              <Navigate to="/chat" replace />
            ) : (
              <AuthPage onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/chat" 
          element={
            loggedIn ? (
              <ChatDashboard 
                token={token} 
                email={email} 
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        {/* Catch all other routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Component to handle OAuth redirects */}
      <AuthRedirect />
    </Router>
  );
}

export default App;
