
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setUser(null);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${encodeURIComponent(id)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile"
          );
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="profile-status">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-status">{error}</div>;
  }

  return (
    <main className="profile-page">
      <Link to={`/feed/${id}`} className="profile-back">
        &larr; Back to feed
      </Link>

      <section className="profile-card">
        <div className="profile-heading">
          <div className="profile-initial">
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="profile-label">STUDENT PROFILE</p>
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <div className="profile-divider" />

        <div className="profile-details">
          <div className="profile-detail">
            <span>Full name</span>
            <strong>{user.name || "Not provided"}</strong>
          </div>

          <div className="profile-detail">
            <span>Roll number</span>
            <strong>
              {user.rollNumber || user.rollNo || "Not provided"}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Email address</span>
            <strong>{user.email || "Not provided"}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;