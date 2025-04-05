// src/pages/ChatDashboard.jsx
import React, { useState } from 'react';

const ChatDashboard = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [stranger, setStranger] = useState(null);

  // Sample strangers data (in a real app, this would come from an API)
  const possibleStrangers = [
    { id: 1, name: 'Anonymous User', isOnline: true, avatar: 'AU' },
    { id: 2, name: 'Random Person', isOnline: true, avatar: 'RP' },
    { id: 3, name: 'Mystery Chatter', isOnline: true, avatar: 'MC' },
  ];

  const startChat = () => {
    // Randomly select a stranger
    const randomStranger = possibleStrangers[Math.floor(Math.random() * possibleStrangers.length)];
    setStranger(randomStranger);
    setIsChatActive(true);
    setMessages([
      {
        id: 1,
        text: "Hi there! I've been connected with you for a chat. How are you doing today?",
        sender: 'stranger',
        timestamp: new Date()
      }
    ]);
  };

  const endChat = () => {
    setIsChatActive(false);
    setMessages([]);
    setStranger(null);
  };

  const nextStranger = () => {
    // Show a system message that the current chat ended
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: "Chat ended. Connecting you with a new person...",
      sender: 'system',
      timestamp: new Date()
    }]);
    
    // End current chat and start a new one
    setTimeout(() => {
      endChat();
      startChat();
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    // Add user message
    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simulate stranger response (in a real app, this would be from the actual connection)
    setTimeout(() => {
      const responses = [
        "Hello, How are you",
        "Nothing new, What about you?",
        "Haha, that's funny! 😄",
        "I am from Andhra pradesh.",
        "I have been pursuing mca in Marwadi university ryt now."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: randomResponse,
        sender: 'stranger',
        timestamp: new Date()
      }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-indigo-500">
            <img width="35" height="35" src="https://img.icons8.com/bubbles/100/chat.png" alt="chat"/>
          </div>
          <h1 className="text-2xl font-bold text-white bg-clip-text text-transparent">
            Chatwadi
          </h1>
        </div>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-transparent border border-indigo-500 hover:bg-indigo-900/30 px-4 py-2 rounded-lg font-medium transition-all duration-300"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chat Rules Panel */}
          <div className="lg:w-1/4 bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
              Chat Rules
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <span>Be respectful and kind to others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <span>Protect your privacy - don't share personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <span>Keep conversations appropriate for all ages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <span>Report any offensive behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <span>Engage in meaningful conversations</span>
              </li>
            </ul>
            
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-lg">Connect with Strangers</h3>
              <div className="space-y-3">
                {!isChatActive ? (
                  <button 
                    onClick={startChat}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    Start New Chat
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={nextStranger}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-3 rounded-lg font-medium transition-all duration-300"
                    >
                      Next Stranger
                    </button>
                    <button 
                      onClick={endChat}
                      className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-medium transition-all duration-300"
                    >
                      End Chat Session
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="lg:w-3/4 bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gray-700 p-4 flex justify-between items-center border-b border-gray-600">
              <div className="flex items-center space-x-3">
                {isChatActive && stranger ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                      {stranger.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{stranger.name}</div>
                      <div className="text-xs text-green-400">Online</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                      <span>?</span>
                    </div>
                    <div>
                      <div className="font-medium">No Active Chat</div>
                      <div className="text-xs text-gray-400">Start a chat to connect</div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-800 space-y-4">
              {!isChatActive && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <div className="text-6xl mb-4">👋</div>
                  <h3 className="text-xl font-semibold mb-2">Welcome to Chatwadi</h3>
                  <p className="max-w-md">Click "Start New Chat" to connect with a random stranger and start a conversation</p>
                </div>
              ) : (
                messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'system' ? (
                      <div className="bg-gray-700 text-gray-300 rounded-lg px-4 py-2 max-w-xs mx-auto text-center text-sm">
                        {message.text}
                      </div>
                    ) : (
                      <div 
                        className={`${
                          message.sender === 'user' 
                            ? 'bg-indigo-600 rounded-lg rounded-tr-none' 
                            : 'bg-gray-600 rounded-lg rounded-tl-none'
                        } px-4 py-2 max-w-xs`}
                      >
                        {message.text}
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-600 bg-gray-700">
              <form onSubmit={sendMessage} className="flex items-center">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isChatActive ? "Type a message..." : "Start a chat to send messages"}
                  disabled={!isChatActive}
                  className="flex-1 bg-gray-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  disabled={!isChatActive}
                  className={`ml-2 ${isChatActive ? 'text-indigo-400 hover:text-indigo-300' : 'text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-gray-400 text-sm mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 Chatwadi. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatDashboard;