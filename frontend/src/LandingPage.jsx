import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
return ( <div className="home-page"> <nav className="home-navbar"> <div className="home-logo">Student Showcase</div> </nav>
  <main className="home-hero">
    <p className="home-label">STUDENT PROJECT SHOWCASE</p>

    <h1>
      Your Ideas.
      <br />
      Your Projects.
      <br />
      <span>Your Showcase.</span>
    </h1>

    <p className="home-description">
      A dedicated space for students to share their projects,
      showcase their skills, and turn their ideas into something
      meaningful. Discover student creativity and celebrate
      the work you create.
    </p>

    <div className="home-buttons">
      <Link to="/signin" className="home-btn home-btn-primary">
        Get Started
      </Link>

      <Link to="/login" className="home-btn home-btn-secondary">
        Login
      </Link>
    </div>

    <p className="home-footer">
      Build something great. Share it with the world.
    </p>
  </main>
</div>

);
}

export default LandingPage;
