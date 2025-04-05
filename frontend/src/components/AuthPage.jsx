import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState('');

  const toggleAuthMode = () => {
    // Reset errors when switching modes
    setEmailError('');
    setPasswordError('');
    setUsernameError('');
    setAuthError('');
    setIsLogin(!isLogin);
  };

  const validateEmail = (email) => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    // Domain validation for signup
    if (!isLogin) {
      const domain = email.split('@')[1];
      if (domain !== 'marwadiuniversity.ac.in') {
        setEmailError('Only Marwadi University emails (@marwadiuniversity.ac.in) are allowed to register');
        return false;
      }
    }
    
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (!isLogin && password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const validateUsername = (username) => {
    if (!isLogin && !username) {
      setUsernameError('Username is required');
      return false;
    }
    
    if (!isLogin && username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return false;
    }
    
    setUsernameError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isUsernameValid = isLogin ? true : validateUsername(username);
    
    if (!isEmailValid || !isPasswordValid || !isUsernameValid) {
      return;
    }
    
    // Simulate API call
    setIsLoading(true);
    setAuthError('');
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock authentication
      if (isLogin) {
        // In login mode, simulate success or failure based on some condition
        if (email && password) {
          setAuthSuccess(true);
          // Log success but don't redirect yet (we'll handle it in the UI)
          console.log('Login successful', { email, password, rememberMe });
        } else {
          setAuthError('Invalid email or password');
        }
      } else {
        // In signup mode, always succeed if we got here (email validation passed)
        setAuthSuccess(true);
        console.log('Registration successful', { email, password, username });
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle dashboard navigation
  const navigateToDashboard = () => {
    navigate('/dashboard'); // Use the navigate function to redirect to dashboard
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white w-full flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="text-indigo-500">
            <img width="40" height="40" src="https://img.icons8.com/bubbles/100/chat.png" alt="chat"/>
          </div>
          <h1 className="text-3xl font-bold bg-white-400 bg-clip-text">
            Chatwadi
          </h1>
        </div>
      </header>

      {/* Auth Section */}
      <div className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {authSuccess ? (
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">{isLogin ? 'Welcome back!' : 'Registration Complete!'}</h2>
              <p className="text-gray-300 mb-8">
                {isLogin 
                  ? 'You have successfully logged in to your account.' 
                  : 'Your account has been created successfully. Welcome to Chatwadi!'}
              </p>
              <button 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200"
                onClick={navigateToDashboard} // Use the navigation function
              >
                {isLogin ? 'Go to Dashboard' : 'Get Started'}
              </button>
            </div>
          ) : (
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              {/* Auth Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-800/40 to-purple-800/40">
                <h2 className="text-3xl font-bold text-center">
                  {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="mt-2 text-center text-gray-300">
                  {isLogin 
                    ? 'Log in to continue your conversations' 
                    : 'Join our community with your Marwadi University email'}
                </p>
              </div>

              {/* Auth Form */}
              <div className="p-6 sm:p-8">
                {authError && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
                    <p className="text-red-300">{authError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (formSubmitted) validateUsername(e.target.value);
                        }}
                        className={`w-full bg-gray-700 border ${
                          usernameError ? 'border-red-500' : 'border-none'
                        } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white`}
                        placeholder="Choose a username"
                      />
                      {usernameError && (
                        <p className="mt-1 text-sm text-red-400">{usernameError}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formSubmitted) validateEmail(e.target.value);
                      }}
                      onBlur={() => validateEmail(email)}
                      className={`w-full bg-gray-700 border ${
                        emailError ? 'border-red-500' : 'border-none'
                      } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white`}
                      placeholder={isLogin ? "you@example.com" : "you@marwadiuniversity.ac.in"}
                    />
                    {emailError && (
                      <p className="mt-1 text-sm text-red-400">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-medium">Password</label>
                      {isLogin && (
                        <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                      )}
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formSubmitted) validatePassword(e.target.value);
                      }}
                      className={`w-full bg-gray-700 border ${
                        passwordError ? 'border-red-500' : 'border-none'
                      } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white`}
                      placeholder={isLogin ? "Enter your password" : "Create a strong password (8+ characters)"}
                    />
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-400">{passwordError}</p>
                    )}
                  </div>

                  {isLogin && (
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                        Remember me
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isLogin ? 'Logging in...' : 'Signing up...'}
                      </span>
                    ) : (
                      <>{isLogin ? 'Log In' : 'Sign Up'}</>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                  </div>
                </div>

                {/* Toggle Login/Signup */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="ml-1 text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      {isLogin ? 'Sign up' : 'Log in'}
                    </button>
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
};

export default AuthPage;