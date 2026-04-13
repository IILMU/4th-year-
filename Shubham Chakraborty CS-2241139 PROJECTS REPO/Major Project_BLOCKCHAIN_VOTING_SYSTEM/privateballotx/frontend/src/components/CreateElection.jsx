// frontend/src/components/CreateElection.jsx
import React, { useState } from "react";

const DEFAULT_CANDIDATES = ["", ""];

export default function CreateElection({ onSubmit, txPending }) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [candidates,  setCandidates]  = useState([...DEFAULT_CANDIDATES]);
  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");
  const [expanded,    setExpanded]    = useState(false);

  const addCandidate = () => {
    if (candidates.length < 10) setCandidates([...candidates, ""]);
  };

  const removeCandidate = (index) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const updateCandidate = (index, value) => {
    const updated = [...candidates];
    updated[index] = value;
    setCandidates(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validCandidates = candidates.map((c) => c.trim()).filter(Boolean);
    if (validCandidates.length < 2) {
      alert("Please enter at least 2 candidate names.");
      return;
    }
    if (!title.trim()) {
      alert("Please enter an election title.");
      return;
    }

    const startUnix = Math.floor(new Date(startDate).getTime() / 1000);
    const endUnix   = Math.floor(new Date(endDate).getTime() / 1000);
    const nowUnix   = Math.floor(Date.now() / 1000);

    if (startUnix >= endUnix) {
      alert("Start time must be before end time.");
      return;
    }
    if (endUnix <= nowUnix) {
      alert("End time must be in the future.");
      return;
    }

    onSubmit(title.trim(), description.trim(), validCandidates, startUnix, endUnix);

    // Reset form on success
    setTitle("");
    setDescription("");
    setCandidates([...DEFAULT_CANDIDATES]);
    setStartDate("");
    setEndDate("");
    setExpanded(false);
  };

  return (
    <section className="card admin-card">
      <button
        className="admin-toggle"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <span className="admin-icon">🛡️</span>
        <span>Admin — Create New Election</span>
        <span className="toggle-arrow">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="election-title">Election Title *</label>
            <input
              id="election-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Board of Directors 2025"
              required
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label htmlFor="election-desc">Description</label>
            <textarea
              id="election-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are voters deciding on? (optional)"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date">Start Date & Time *</label>
              <input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date">End Date & Time *</label>
              <input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Candidates * (min 2, max 10)</label>
            <div className="candidates-list">
              {candidates.map((c, i) => (
                <div key={i} className="candidate-row">
                  <span className="candidate-num">{i + 1}.</span>
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => updateCandidate(i, e.target.value)}
                    placeholder={`Candidate ${i + 1} name`}
                    maxLength={80}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-remove"
                    onClick={() => removeCandidate(i)}
                    disabled={candidates.length <= 2}
                    title="Remove candidate"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {candidates.length < 10 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={addCandidate}
              >
                + Add Candidate
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={txPending}
          >
            {txPending ? (
              <><span className="spinner" /> Creating Election...</>
            ) : (
              "🗳️ Create Election"
            )}
          </button>
        </form>
      )}
    </section>
  );
}
