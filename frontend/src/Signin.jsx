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
            name: name.trim(),
            email: email.trim(),
            rollNumber: rollNumber.trim(),
            password,
          }),
        }
      );

      const result = await response.json();

  
      if (!response.ok) {
        console.error('Signup failed:', result);
        setMessage(result.message || 'Signup failed.');
        return;
      }

      // Get the user ID returned by the backend
      const userId = result.user?._id || result.user?.id;

      if (!userId) {
        setMessage(
          'Account created, but the server did not return a user ID. Please log in.'
        );
        return;
      }

      // Save the JWT token
      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      // Save the user with a consistent ID field
      const user = {
        ...result.user,
        id: userId,
      };

      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to the user's feed
      navigate(`/feed/${userId}`, { replace: true });
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
              minLength={8}
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
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signin;