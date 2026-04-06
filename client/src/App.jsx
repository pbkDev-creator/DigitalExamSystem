import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FacultyDashboard from './pages/FacultyDashboard';
import Submit from './components/Submit';

function App() {
  return (
    <Router>
      <Routes>
        /* The main URL will now lead straight to your Professional Dashboard */
        <Route path="/" element={<FacultyDashboard />} />
        <Route path="/dashboard" element={<FacultyDashboard />} />
        
        /* The Student Portal */
        <Route path="/submit" element={<Submit />} />
      </Routes>
    </Router>
  );
}

export default App;