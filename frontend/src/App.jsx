import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import ChatDashboard from './components/ChatDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<ChatDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
