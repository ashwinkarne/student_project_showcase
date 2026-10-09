
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Feed.css";

function Feed() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user || id !== user.id) {
      navigate("/login", { replace: true });
      return;
    }

    async function fetchProjects() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
          }

          throw new Error(
            data.message || "Failed to fetch projects"
          );
        }

        setProjects(
          Array.isArray(data) ? data : data.projects || []
        );
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [id, navigate]);

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  if (!user || id !== user.id) {
    return null;
  }

  return (
    <div className="feed-page">
      <header className="feed-header">
        <Link to={`/feed/${user.id}`} className="feed-brand">
          Student Project Showcase
        </Link>

        <div className="feed-header-actions">
          <Link
            to={`/feed/${user._id}/profile`}
            className="profile-button"
          >
            Profile
          </Link>
          


          <button
            onClick={handleSignOut}
            className="signout-button"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="feed-main">
        <section className="feed-intro">
          <p className="feed-eyebrow">STUDENT COMMUNITY</p>
          <h1>Ideas become projects.</h1>
          <p className="feed-intro-copy">
            Welcome, {user.name}. Explore what fellow students are building,
            get inspired, and share something of your own.
          </p>
        </section>

        <section className="projects-section">
          <div className="projects-heading">
            <div>
              <p className="section-eyebrow">EXPLORE THE COMMUNITY</p>
              <h2>Student projects</h2>
              <p className="projects-subtitle">
                Discover ideas, technologies, and work from fellow students.
              </p>
            </div>
            <Link
            to={`/feed/${user.id}/add_project`}
            className="publish-project-button">
          <span aria-hidden="true">＋</span> Publish project
          </Link>
            
          </div>

          {loading && <p className="feed-message">Loading projects...</p>}

          {error && <p className="feed-error">{error}</p>}

          {!loading && !error && projects.length === 0 && (
            <div className="empty-projects">
              <div className="empty-projects-mark" aria-hidden="true">＋</div>
              <h3>Be the first to share a project</h3>
              <p>Publish your work and give the community something new to discover.</p>
              <Link to="/projects/new" className="publish-project-button">
                Publish your project
              </Link>
            </div>
          )}

          <div className="project-list">
            {projects.map((project) => {
              const publisher =
                project.user || project.publishedBy || {};

              return (
                <article
                  className="project-card"
                  key={project._id}
                >
                  {project.coverImage ? (
                    <div className="project-image-wrap">
                      <img
                        src={project.coverImage}
                        alt={`${project.title} cover`}
                        className="project-image"
                      />
                    </div>
                  ) : (
                    <div className="project-image-placeholder">
                      <span>PROJECT</span>
                    </div>
                  )}

                  <div className="project-content">
                    <div className="project-card-heading">
                      <h3>{project.title}</h3>
                    </div>

                    <p className="project-description">
                      {project.description}
                    </p>

                    {project.technologies?.length > 0 && (
                      <div className="project-technologies">
                        {project.technologies.map((technology) => (
                          <span className="technology-tag" key={technology}>
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="project-card-footer">
                      <div className="project-publisher">
                        <span className="publisher-label">PUBLISHED BY</span>
                        <span className="publisher-name">
                          {publisher.name || "Student"}
                        </span>
                      </div>

                      <div className="project-card-actions">
                        {publisher._id && (
                          <Link
                            to={`/profile/${publisher._id}`}
                            className="project-action secondary-action"
                          >
                            View profile
                          </Link>
                        )}

                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="project-action primary-action"
                          >
                            GitHub <span aria-hidden="true">↗</span>
                          </a>
                        )}

                        {project.liveDemoUrl && (
                          <a
                            href={project.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="project-action secondary-action"
                          >
                            Live demo <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Feed;