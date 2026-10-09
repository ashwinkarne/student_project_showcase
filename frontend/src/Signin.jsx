import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signin.css';
function Signin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            rollNumber,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || 'Signup failed.');
        return;
      }

      // Save the JWT for future authenticated API requests
      localStorage.setItem('token', result.token);

      // Save basic user information
      localStorage.setItem('user', JSON.stringify(result.user));

      // Redirect after successful signup
      navigate('/profile');
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('Cannot connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="signin-page">
    <div className="signin-card">
      <h1>Sign Up</h1>

      <p className="signin-description">
        Create your account to showcase your projects
        and connect with other students.
      </p>

      <form className="signin-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Roll Number
          <input
            type="text"
            placeholder="Enter your roll number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        {message && (
          <p className="signin-message" role="alert">
            {message}
          </p>
        )}

        <button
          className="signin-button"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p className="signin-footer">
        Already have an account?
        <Link to="/login">Login</Link>
      </p>
    </div>
  </div>
  );
}

export default Signin;