import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importing from your specific folder structure
import FacultyDashboard from './pages/FacultyDashboard.jsx'; 
import Submit from './components/Submit.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        <Routes>
          {/* Main Faculty Command Center */}
          <Route path="/" element={<FacultyDashboard />} />

          {/* Student Mobile Submission Portal */}
          <Route path="/submit" element={<Submit />} />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;