import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './AddProject.css';

function AddProjects() {
const { id } = useParams();
const navigate = useNavigate();

const [formData, setFormData] = useState({
title: '',
description: '',
technologies: '',
githubUrl: '',
liveDemoUrl: '',
});

const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
const { name, value } = e.target;


setFormData((prev) => ({
  ...prev,
  [name]: value,
}));


};

const handleSubmit = async (e) => {
e.preventDefault();
setError('');


if (
  !formData.title.trim() ||
  !formData.description.trim() ||
  !formData.technologies.trim() ||
  !formData.githubUrl.trim()
) {
  setError('Please fill in all required fields.');
  return;
}

const technologies = formData.technologies
  .split(',')
  .map((technology) => technology.trim())
  .filter(Boolean);

if (technologies.length === 0) {
  setError('Please enter at least one technology.');
  return;
}

const projectData = {
  userId: id,
  title: formData.title.trim(),
  description: formData.description.trim(),
  technologies,
  githubUrl: formData.githubUrl.trim(),
  liveDemoUrl: formData.liveDemoUrl.trim(),
};

try {
  setLoading(true);

  const response = await fetch(
    'http://localhost:5000/api/addproject',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    }
  );

  const responseText = await response.text();
  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to publish project.'
    );
  }

  navigate(`/feed/${id}`);
} catch (err) {
  setError(err.message || 'Something went wrong. Please try again.');
} finally {
  setLoading(false);
}

};

return ( <div className="add-project-page"> <header className="add-project-header">
<Link to={`/feed/${id}`} className="back-link">
← Back to Feed </Link>

    <h1>Publish a Project</h1>
    <p>Share what you have built with the student community.</p>
  </header>

  <form className="add-project-form" onSubmit={handleSubmit}>
    {error && <div className="form-error">{error}</div>}

    <div className="form-group">
      <label htmlFor="title">Project Name *</label>
      <input
        id="title"
        name="title"
        type="text"
        placeholder="e.g. Student Showcase Website"
        value={formData.title}
        onChange={handleChange}
        maxLength={100}
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="description">Project Description *</label>
      <textarea
        id="description"
        name="description"
        placeholder="Describe your project and what it does..."
        value={formData.description}
        onChange={handleChange}
        rows={5}
        maxLength={3000}
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="technologies">Technologies Used *</label>
      <input
        id="technologies"
        name="technologies"
        type="text"
        placeholder="React, Node.js, MongoDB"
        value={formData.technologies}
        onChange={handleChange}
        required
      />
      <small>Separate technologies with commas.</small>
    </div>

    <div className="form-group">
      <label htmlFor="githubUrl">GitHub Repository URL *</label>
      <input
        id="githubUrl"
        name="githubUrl"
        type="url"
        placeholder="https://github.com/username/project"
        value={formData.githubUrl}
        onChange={handleChange}
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="liveDemoUrl">Live Demo URL</label>
      <input
        id="liveDemoUrl"
        name="liveDemoUrl"
        type="url"
        placeholder="https://your-project.com (optional)"
        value={formData.liveDemoUrl}
        onChange={handleChange}
      />
    </div>

    <button
      type="submit"
      className="publish-project-btn"
      disabled={loading}
    >
      {loading ? 'Publishing...' : 'Publish Project'}
    </button>
  </form>
</div>


);
}

export default AddProjects;
