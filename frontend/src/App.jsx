import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import LandingPage from './LandingPage';
import Login from './Login';
import Signin from './Signin';
import Profile from './Profile';
import AddProjects from './AddProjects';
import Feed from "./Feed";
function App() {

  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed/:id" element={<Feed />} />
        <Route path="/feed/:id/profile" element={<Profile />} />
        <Route path="/feed/:id/add_project" element={<AddProjects />} />
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
