import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ProjectDetails.css";

const API_BASE = "http://localhost:5000/api";

function ProjectDetails() {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !user || id !== user.id) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadProject() {
      try {
        // The current projects API returns the signed-in user's feed. Find only
        // the project whose MongoDB _id matches the URL parameter.
        const response = await fetch(`${API_BASE}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
          }
          throw new Error(data.message || "Could not load projects.");
        }

        const projects = Array.isArray(data) ? data : data.projects || [];
        const selectedProject = projects.find(
          (item) => String(item._id) === String(projectId)
        );

        if (!selectedProject) {
          throw new Error("This project could not be found in the feed.");
        }
        if (!cancelled) setProject(selectedProject);
      } catch (err) {
        if (!cancelled) setError(err.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProject();
    return () => { cancelled = true; };
  }, [id, projectId, navigate, token]);

  useEffect(() => {
    if (!token || !projectId) return;
    let cancelled = false;

    async function loadComments() {
      try {
        const response = await fetch(`${API_BASE}/projects/${projectId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load comments.");
        if (!cancelled) setComments(Array.isArray(data) ? data : data.comments || []);
      } catch (err) {
        if (!cancelled) setCommentError(err.message || "Could not load comments.");
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }

    loadComments();
    return () => { cancelled = true; };
  }, [projectId, token]);

  async function handleCommentSubmit(event) {
    event.preventDefault();
    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      setCommentError("Write a comment before posting.");
      return;
    }
    if (trimmedComment.length > 1000) {
      setCommentError("Comments must be 1,000 characters or fewer.");
      return;
    }

    setSubmitting(true);
    setCommentError("");
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: trimmedComment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not post your comment.");
      const savedComment = data.comment || data;
      setComments((current) => [...current, savedComment]);
      setCommentText("");
    } catch (err) {
      setCommentError(err.message || "Could not post your comment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user || id !== user.id) return null;

  if (loading) {
    return <div className="project-details-page"><p className="details-status">Loading project details...</p></div>;
  }

  if (error || !project) {
    return (
      <div className="project-details-page">
        <main className="details-main">
          <Link to={`/feed/${id}`} className="back-to-feed">← Back to feed</Link>
          <div className="details-error">{error || "Project not found."}</div>
        </main>
      </div>
    );
  }

  const publisher = project.user || project.publishedBy || {};
  const technologies = Array.isArray(project.technologies) ? project.technologies : [];

  return (
    <div className="project-details-page">
      <header className="details-header">
        <Link to={`/feed/${id}`} className="details-brand">Student Project Showcase</Link>
        <Link to={`/feed/${id}/profile`} className="details-profile-link">My profile</Link>
      </header>

      <main className="details-main">
        <Link to={`/feed/${id}`} className="back-to-feed">← Back to feed</Link>

        <section className="project-detail-hero">
          <p className="details-eyebrow">PROJECT SPOTLIGHT</p>
          <h1>{project.title}</h1>
          <p className="details-byline">
            Shared by <strong>{publisher.name || "Student"}</strong>
          </p>
          <div className="detail-links">
            {project.githubUrl && (
              <a className="detail-link detail-link-primary" href={project.githubUrl} target="_blank" rel="noreferrer">
                View source on GitHub <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.liveDemoUrl && (
              <a className="detail-link" href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                Open live demo <span aria-hidden="true">↗</span>
              </a>
            )}
            {!project.githubUrl && !project.liveDemoUrl && (
              <p className="no-links-note">The author has not added source-code or demo links yet.</p>
            )}
          </div>
        </section>

        <div className="details-layout">
          <div className="details-primary-column">
            <section className="details-panel about-project-panel">
              <div className="panel-heading">
                <span className="panel-number">01</span>
                <div>
                  <p className="details-eyebrow">THE STORY</p>
                  <h2>About this project</h2>
                </div>
              </div>
              <p className="project-long-description">
                {project.description || "The project author has not added a description yet."}
              </p>
              {project.description && project.description.trim().split(/\s+/).filter(Boolean).length < 100 && (
                <p className="description-hint">
                  This description currently has {project.description.trim().split(/\s+/).filter(Boolean).length} words. The author can expand it to at least 100 words to share more context, goals, and implementation details.
                </p>
              )}
            </section>

            <section className="details-panel comments-panel">
              <div className="panel-heading">
                <span className="panel-number">02</span>
                <div>
                  <p className="details-eyebrow">COMMUNITY FEEDBACK</p>
                  <h2>Ideas & encouragement <span className="comment-count">{comments.length}</span></h2>
                </div>
              </div>
              <p className="comments-intro">Share a useful suggestion, ask a thoughtful question, or let the creator know what you like about their work.</p>

              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <label htmlFor="project-comment">Add to the conversation</label>
                <textarea
                  id="project-comment"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="I like this idea because... One suggestion could be..."
                  rows={4}
                  maxLength={1000}
                  required
                />
                <div className="comment-form-footer">
                  <span>{commentText.length}/1000 characters</span>
                  <button type="submit" disabled={submitting || !commentText.trim()}>
                    {submitting ? "Posting..." : "Post comment →"}
                  </button>
                </div>
              </form>

              {commentError && <p className="comment-error">{commentError}</p>}

              <div className="comments-list">
                {commentsLoading ? (
                  <p className="comments-empty">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <div className="comments-empty">
                    <span className="empty-comment-mark" aria-hidden="true">✳</span>
                    <h3>Start the conversation</h3>
                    <p>Be the first to share encouragement or an idea for this project.</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <article className="comment-item" key={comment._id || comment.id}>
                      <div className="comment-avatar" aria-hidden="true">
                        {(comment.user?.name || comment.author?.name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-body">
                        <div className="comment-meta">
                          <strong>{comment.user?.name || comment.author?.name || comment.userName || "Student"}</strong>
                          <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Just now"}</span>
                        </div>
                        <p>{comment.text || comment.content}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="details-sidebar">
            <section className="details-panel tech-panel">
              <p className="details-eyebrow">BUILT WITH</p>
              <h2>Tech stack</h2>
              {technologies.length > 0 ? (
                <div className="detail-tech-list">
                  {technologies.map((technology) => <span className="detail-tech-tag" key={technology}>{technology}</span>)}
                </div>
              ) : (
                <p className="sidebar-muted">No technologies listed yet.</p>
              )}
            </section>
            <section className="details-note-card">
              <span className="note-spark" aria-hidden="true">✳</span>
              <h3>Good projects grow with good feedback.</h3>
              <p>A thoughtful comment can help someone solve a problem, improve an idea, or keep building.</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ProjectDetails;
