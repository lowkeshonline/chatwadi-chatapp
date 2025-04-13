import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

// Get API URL from environment variables - no hardcoded values
const API_URL = import.meta.env.VITE_API_BASE_URL;
// Removed hardcoded Google Client ID and ensured it uses environment variables only
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AuthPage({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setAuthError('');
    
    try {
      console.log('Attempting Google login...');
      // Send the token ID to your backend for verification
      const res = await axios.post(`${API_URL}/google-login`, {
        token: credentialResponse.credential
      });
      
      // Check if the email is from marwadiuniversity.ac.in
      if (res.data.success) {
        setAuthSuccess(true);
        // After a brief success message, call the parent component's onLogin function
        setTimeout(() => {
          onLogin(res.data.token, res.data.email);
        }, 1500);
      } else {
        console.error('Login failed:', res.data.message);
        setAuthError(res.data.message || "Only Marwadi University emails are allowed");
      }
    } catch (error) {
      console.error('Login error:', error);
      // Production-safe error handling without logging sensitive data
      setAuthError(error.response?.data?.detail || 
                  "Login failed. Only Marwadi University emails are allowed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google OAuth Error:', error);
    setAuthError("Google Sign-In failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-gray-900">
        <div className="flex itemsCenter gap-2">
          {/* Logo */}
          <div className="text-indigo-500">
            <img width="40" height="40" src="https://img.icons8.com/bubbles/100/chat.png" alt="chat"/>
          </div>
          <h1 className="text-3xl font-bold bg-white-400 bg-clip-text">
            Chatwadi - Talk to Strangers
          </h1>
        </div>
      </header>

      {/* Auth Section */}
      <div className="flex-grow flex items-center justify-center px-6 py-12 bg-gray-900">
        <div className="w-full max-w-md">
          {authSuccess ? (
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">Welcome back!</h2>
              <p className="text-gray-300 mb-8">
                You have successfully logged in to your account.
              </p>
              <div className="text-center">
                <p>Redirecting to chat dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              {/* Auth Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-800/40 to-purple-800/40">
                <h2 className="text-3xl font-bold text-center">
                  Welcome back
                </h2>
                <p className="mt-2 text-center text-gray-300">
                  Log in with your Marwadi University account
                </p>
              </div>

              {/* Auth Form */}
              <div className="p-6 sm:p-8">
                {authError && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
                    <p className="text-red-300">{authError}</p>
                  </div>
                )}
                
                <div className="flex flex-col items-center space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2">Logging in...</span>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="mb-4 pl-10 text-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleError}
                          useOneTap={false}
                          auto_select={false}
                          prompt="select_account"
                          ux_mode="popup"
                          hosted_domain="marwadiuniversity.ac.in"
                          context="signin"
                          theme="filled_blue"
                          size="large"
                          shape="pill"
                          text="signin_with"
                          width={300}
                        />
                      </div>
                      <p className="text-center text-sm text-gray-400 mt-4">
                        Only accounts with @marwadiuniversity.ac.in domain are allowed
                      </p>
                    </div>
                  )}
                </div>

                {/* Information block */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-400">
                    This chat application is exclusively for Marwadi University students.
                    <br />
                    Sign in with your university Google account to continue.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Terms and Privacy */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to Chatwadi's {' '}
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
            {' '} and {' '}
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed -z-10 top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="fixed -z-10 bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
    </div>
  );
}

export default AuthPage;