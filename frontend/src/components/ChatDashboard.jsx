import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

// Use environment variables for API and WebSocket URLs
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const WS_URL = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";

function ChatDashboard({ token, email }) {
  const [chatStarted, setChatStarted] = useState(false);
  const [chatId, setChatId] = useState('');
  const [peer, setPeer] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [status, setStatus] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      connectWebSocket(token);
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to the websocket endpoint using token query parameter
  const connectWebSocket = (token) => {
    const socket = new WebSocket(`${WS_URL}/ws/chat?token=${token}`);
    socket.onopen = () => {
      // Production-safe logging without sensitive information
      if (process.env.NODE_ENV !== 'production') {
        console.log("WebSocket connected");
      }
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Remove any console logging of data in production
      // Especially important to prevent logging emails
      
      if (data.event === "waiting") {
        setStatus(data.message);
      } else if (data.event === "chat_started") {
        setChatStarted(true);
        setChatId(data.chat_id);
        
        // Privacy enhancement: Don't display email address
        // Instead show "Anonymous User" or truncate domain part of email
        const peerName = data.peer?.includes('@') 
          ? 'Anonymous User' 
          : data.peer;
        
        setPeer(peerName);
        setStatus("Chat started with Anonymous User");
      } else if (data.event === "message") {
        // Privacy enhancement: Replace email sender with "Stranger" or "You"
        const senderName = data.sender === email 
          ? "You" 
          : "Stranger";
        
        setMessages(prev => [...prev, { 
          sender: senderName, 
          message: data.message,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      } else if (data.event === "typing") {
        // Make sure typing status doesn't show email
        setStatus("Someone is typing...");
        setIsTyping(true);
      } else if (data.event === "typing_ended") {
        setIsTyping(false);
        setStatus(chatStarted ? "Connected with Anonymous User" : "Waiting for a partner...");
      } else if (data.event === "chat_ended") {
        setStatus("Chat ended");
        setChatStarted(false);
        setIsTyping(false);
      }
    };
    socket.onerror = (err) => {
      // Less verbose error logging for production
      if (process.env.NODE_ENV !== 'production') {
        console.error("WebSocket connection error");
      }
    };
    wsRef.current = socket;
  };

  // Request to connect to chat and find a partner
  const requestChatConnection = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ event: "connect_to_chat" }));
      setStatus("Looking for a chat partner...");
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (wsRef.current && messageText.trim() !== "") {
      wsRef.current.send(JSON.stringify({ event: "message", message: messageText }));
      setMessages(prev => [...prev, { 
        sender: "You", 
        message: messageText,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setMessageText('');
    }
  };

  // Notify the peer that you're typing
  const sendTyping = () => {
    if (wsRef.current && chatStarted) {
      wsRef.current.send(JSON.stringify({ event: "typing" }));
    }
  };

  // Generate PDF from chat history
  const generatePDF = (chatData) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(66, 66, 255);
    doc.text('Chatwadi - Chat History', 105, 20, { align: 'center' });
    
    // Add date and time
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
    
    // Add chat ID
    doc.text(`Chat ID: ${chatId}`, 105, 40, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    // Set starting y position for messages
    let yPos = 55;
    const lineHeight = 7;
    
    // Add messages
    doc.setFontSize(11);
    chatData.forEach(msg => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Set different colors for You and Stranger
      if (msg.sender === "You") {
        doc.setTextColor(0, 0, 180);
      } else {
        doc.setTextColor(100, 100, 100);
      }
      
      doc.text(`${msg.sender} (${msg.timestamp}):`, 20, yPos);
      yPos += lineHeight;
      
      // Message text in black
      doc.setTextColor(0, 0, 0);
      
      // Handle long messages with wrapping
      const textLines = doc.splitTextToSize(msg.message, 150);
      doc.text(textLines, 25, yPos);
      
      yPos += lineHeight * textLines.length + 5;
    });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text('Chatwadi - Anonymous Chat for Marwadi University', 105, 285, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`chatwadi-chat-${chatId.substring(0, 8)}.pdf`);
  };

  // Download chat history via API
  const downloadChat = async () => {
    try {
      const res = await axios.get(`${API_URL}/download/${chatId}`, {
        params: { token }
      });
      
      // Privacy enhancement: Anonymize chat history before creating PDF
      const anonymizedMessages = res.data.messages.map(msg => ({
        sender: msg.sender === email ? "You" : "Stranger",
        message: msg.message,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }));
      
      // Generate and download PDF
      generatePDF(anonymizedMessages);
    } catch (error) {
      // Remove console.error for production
      alert("Failed to download chat history.");
    }
  };

  // Get number of online users
  const fetchOnlineUsers = async () => {
    try {
      // Pass token as a parameter to authenticate the request
      const res = await axios.get(`${API_URL}/online`, {
        params: { token }
      });
      
      // Remove console logging of response data in production
      alert("Online Users: " + res.data.online);
    } catch (error) {
      // Less verbose error logging for production
      alert("Failed to fetch online users.");
    }
  };

  // End current chat session
  const endChat = () => {
    if (wsRef.current) {
      wsRef.current.close();
      connectWebSocket(token);
    }
    setChatStarted(false);
    setMessages([]);
    setPeer('');
    setStatus('');
    setIsTyping(false);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col w-full h-screen">
      {/* Header - More responsive with smaller text and icons on mobile */}
      <header className="flex justify-between items-center p-3 bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="text-indigo-500">
            <img width="30" height="30" src="https://img.icons8.com/bubbles/100/chat.png" alt="chat"/>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-indigo-400">
            <span className="hidden sm:inline">Chatwadi - Stranger Chat App</span>
            <span className="sm:hidden">Chatwadi</span>
          </h2>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="p-2 md:px-4 md:py-2 bg-transparent border border-indigo-500 rounded-md hover:bg-indigo-500/20 transition-colors"
          title="Logout"
        >
          <span className="hidden md:inline">Logout</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:hidden" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.707a1 1 0 001.414-1.414l-3-3a1 1 0 10-1.414 1.414L12.586 12l-2.293 2.293a1 1 0 101.414 1.414l3-3z" clipRule="evenodd" />
          </svg>
        </button>
      </header>
      
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        {/* Sidebar - Better mobile spacing and collapsible on smaller screens */}
        <div className="w-full md:w-1/4 bg-gray-800 p-3 md:p-4 flex flex-col gap-3 md:gap-4 md:overflow-y-auto">
          <div className="bg-gray-700/50 p-2 md:p-3 rounded-md">
            <div className="flex items-center font-medium mb-1 md:mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Status</span>
            </div>
            <p className="text-gray-300 text-sm md:text-base">{isTyping ? "Someone is typing..." : status}</p>
          </div>
          
          <div className="bg-gray-700/50 p-2 md:p-3 rounded-md">
            <div className="flex items-center font-medium mb-1 md:mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Chat Partner</span>
            </div>
            <p className="text-gray-300 text-sm md:text-base">
              {chatStarted ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full mr-2"></span>
                  Anonymous User
                </span>
              ) : "Waiting for a partner..."}
            </p>
          </div>
          
          {/* Mobile action buttons using flex-row for small screens */}
          <div className="flex flex-row md:flex-col gap-2 md:gap-3 mt-auto">
            {!chatStarted ? (
              <button 
                onClick={requestChatConnection} 
                className="flex-1 md:w-full p-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                <span className="hidden md:inline">Connect to Chat</span>
                <span className="md:hidden">Connect</span>
              </button>
            ) : (
              <button 
                onClick={endChat}
                className="flex-1 md:w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
                <span className="hidden md:inline">Find New Partner</span>
                <span className="md:hidden">New Chat</span>
              </button>
            )}
            
            <button 
              onClick={fetchOnlineUsers}
              className="flex-1 md:w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center justify-center"
              title="Online Users"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="hidden md:inline">Online Users</span>
              <span className="md:hidden">Online</span>
            </button>
            
            <button 
              onClick={downloadChat} 
              disabled={!chatStarted || messages.length === 0}
              className={`flex-1 md:w-full p-2 rounded-md transition-colors flex items-center justify-center ${
                chatStarted && messages.length > 0
                  ? "bg-gray-700 hover:bg-gray-600" 
                  : "bg-gray-700/50 cursor-not-allowed"
              }`}
              title="Download Chat as PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span className="hidden md:inline">Download as PDF</span>
              <span className="md:hidden">PDF</span>
            </button>
          </div>
        </div>
        
        {/* Main Chat Area - Optimized for mobile */}
        <div className="w-full md:w-3/4 bg-gray-900 flex flex-col overflow-hidden h-[calc(100vh-64px)]">
          {/* Messages Container */}
          <div className="flex-grow p-3 md:p-4 overflow-y-auto flex flex-col gap-2 md:gap-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 my-auto flex flex-col items-center">
                {chatStarted ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Say hello!</p>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p>Waiting to connect...</p>
                  </>
                )}
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] p-2 md:p-3 rounded-lg ${
                      msg.sender === "You" 
                        ? "bg-indigo-600 rounded-tr-none" 
                        : "bg-gray-700 rounded-tl-none"
                    }`}
                  >
                    <div className="font-medium text-xs md:text-sm mb-1 opacity-75">
                      {msg.sender}
                    </div>
                    <div className="text-sm md:text-base">{msg.message}</div>
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {msg.timestamp || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="text-gray-500 text-xs md:text-sm italic ml-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Someone is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input - Fixed to bottom on mobile with better spacing */}
          <div className="p-2 md:p-4 border-t border-gray-700 bg-gray-800 sticky bottom-0 left-0 right-0 mt-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  sendTyping();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={!chatStarted}
                placeholder={chatStarted ? "Type your message..." : "Waiting for connection..."}
                className={`flex-grow p-2 md:p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:border-indigo-500 text-sm md:text-base ${
                  !chatStarted ? "cursor-not-allowed opacity-75" : ""
                }`}
              />
              <button 
                onClick={sendMessage} 
                disabled={!chatStarted || !messageText.trim()}
                className={`p-2 md:px-4 md:py-2 rounded-md flex-shrink-0 flex items-center justify-center ${
                  chatStarted && messageText.trim() 
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "bg-gray-700/50 cursor-not-allowed"
                } transition-colors`}
                title="Send Message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="hidden md:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer - Only visible on larger screens */}
      <footer className="bg-gray-800 py-4 text-center text-gray-500 text-sm w-full hidden md:block">
        <p>© 2025 Chatwadi - Anonymous chat for Marwadi University</p>
      </footer>
    </div>
  );
}

export default ChatDashboard;