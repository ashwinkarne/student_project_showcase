import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signin from './Signin';
import Profile from './Profile';
import AddProjects from './AddProjects';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-projects" element={<AddProjects />} />
      </Routes>
    </Router>
  );
}

export default App
