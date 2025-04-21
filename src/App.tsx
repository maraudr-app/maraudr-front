// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home/Home';
import DashBoard from './pages/DashBoard/DashBoard';
// ... autres pages

function App() {
  return (
    <Router>
      <Header />
      <main className="pt-16 px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DashBoard />} />
          {/* autres routes */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
