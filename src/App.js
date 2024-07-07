import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminView from './components/AdminView';
import PlayerView from './components/PlayerView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminView />} />
        <Route path="/player/:name" element={<PlayerView />} />
      </Routes>
    </Router>
  );
}

export default App;
