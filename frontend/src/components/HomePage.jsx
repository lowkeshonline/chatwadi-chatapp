import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white w-full overflow-x-hidden">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-gray-900">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="text-indigo-500">
            <img width="40" height="40" src="https://img.icons8.com/bubbles/100/chat.png" alt="chat"/>
          </div>
          <h1 className="text-3xl font-bold bg-white-400 bg-clip-text">
            Chatwadi
          </h1>
        </div>
        
        <Link to="/auth" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
          Join Now
        </Link>
      </header>

      {/* Hero Section */}
      <section className="w-full px-6 py-12 md:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:space-x-12">
          {/* Text content */}
          <div className="md:w-1/2 space-y-6 mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Connect with people around the marwadi university
            </h2>
            <p className="text-lg text-gray-300">
              Chatwadi brings strangers together in meaningful conversations. 
              Make new friends, practice languages, or just chat about shared interests
              in a safe and friendly environment.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link to="/auth" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium">
                Log In with University Email
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-gray-900 flex items-center justify-center text-xs font-medium">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p>+80 users online now</p>
            </div>
          </div>
          
          {/* Image/Illustration */}
          <div className="md:w-1/2 relative">
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {/* Chat UI mockup */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                  <div>
                    <p className="font-medium">Random Friend</p>
                    <p className="text-xs text-green-400">Online now</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4 h-80 overflow-y-auto">
                {/* Messages */}
                <div className="space-y-4">
                  <div className="flex">
                    <div className="bg-gray-700 rounded-lg rounded-tl-none p-3 max-w-xs">
                      <p>Hi there! How's your day going?</p>
                      <p className="text-xs text-gray-400 mt-1">12:42 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 rounded-lg rounded-tr-none p-3 max-w-xs">
                      <p>Hey! Pretty good, thanks. Just browsing around. What brings you to Chatwadi?</p>
                      <p className="text-xs text-indigo-300 mt-1">12:45 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-gray-700 rounded-lg rounded-tl-none p-3 max-w-xs">
                      <p>I'm looking to practice my English with native speakers. Do you mind chatting for a bit?</p>
                      <p className="text-xs text-gray-400 mt-1">12:48 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 rounded-lg rounded-tr-none p-3 max-w-xs">
                      <p>Not at all! Happy to help. Your English seems great already!</p>
                      <p className="text-xs text-indigo-300 mt-1">12:50 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-grow bg-gray-700 border-none rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button className="ml-2 bg-indigo-600 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full px-6 py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-12">Why choose Chatwadi?</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 p-6 rounded-xl hover:bg-gray-800 transition duration-300">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">Instant Matching</h4>
              <p className="text-gray-400">Connect with people who share your interests in seconds. Our smart algorithm pairs you with the perfect chat partners.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-800/50 p-6 rounded-xl hover:bg-gray-800 transition duration-300">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">Safe & Secure</h4>
              <p className="text-gray-400">Your privacy matters. End-to-end encryption and a strict code of conduct ensures a safe environment for everyone.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-800/50 p-6 rounded-xl hover:bg-gray-800 transition duration-300">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.5" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">Student Community</h4>
              <p className="text-gray-400">Meet people from our own university. Practice languages, learn about new cultures, and make friends around the world.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full px-6 py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-indigo-800/50 to-purple-800/50 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to start chatting?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join hundreds of Marwadi University students already connecting on Chatwadi. Your next meaningful conversation is just a click away.</p>
          <Link to="/auth" className="bg-white text-indigo-900 hover:bg-gray-100 font-medium px-4 py-3 rounded-lg">
            Log In with University Email
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="text-indigo-500">
                <img width="35" height="35" src="https://img.icons8.com/bubbles/100/chat.png" alt="chat"/>
              </div>
              <span className="text-xl font-medium">Chatwadi</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition duration-200">Terms</a>
              <a href="#" className="hover:text-white transition duration-200">Privacy</a>
              <a href="#" className="hover:text-white transition duration-200">Help</a>
              <a href="#" className="hover:text-white transition duration-200">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Chatwadi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;