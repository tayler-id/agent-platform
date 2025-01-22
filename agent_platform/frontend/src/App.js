import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { AuthProvider } from './context/AuthContext';
import Tour from './components/Tour';

// Views
import Home from './views/Home';
import Marketplace from './views/Marketplace';
import AgentDetail from './views/AgentDetail';
import CreateAgent from './views/CreateAgent';
import Profile from './views/Profile';
import Leaderboard from './views/Leaderboard';
import Auth from './views/Auth';

// Brutalist styles
import './App.css';

function App() {
  const [supabase, setSupabase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration. Please check your .env file');
      return;
    }

    const client = createClient(supabaseUrl, supabaseKey);
    setSupabase(client);
    setLoading(false);
  }, []);

  if (loading || !supabase) {
    return <div className="brutalist-loading">Initializing app...</div>;
  }
  return (
    <div className="brutalist-container">
      <Router>
        <AuthProvider supabase={supabase}>
          <Tour />
          <nav className="brutalist-nav">
            <a href="/">Home</a>
            <a href="/marketplace">Marketplace</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/profile">Profile</a>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/create" element={<CreateAgent />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
