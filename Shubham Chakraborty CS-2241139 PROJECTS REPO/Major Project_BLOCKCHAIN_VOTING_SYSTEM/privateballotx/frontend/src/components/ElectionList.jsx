// frontend/src/components/ElectionList.jsx
import React, { useState } from "react";
import VotePanel from "./VotePanel.jsx";

const FILTERS = ["All", "Live", "Upcoming", "Ended", "Paused"];

export default function ElectionList({
  elections,
  account,
  isOwner,
  txPending,
  loading,
  onVote,
  onToggle,
  onRefresh,
  checkHasVoted,
}) {
  const [filter, setFilter] = useState("All");

  const getStatus = (election) => {
    const now = Math.floor(Date.now() / 1000);
    if (!election.active)               return "Paused";
    if (now < election.startTime)       return "Upcoming";
    if (now > election.endTime)         return "Ended";
    return "Live";
  };

  const filtered = filter === "All"
    ? elections
    : elections.filter((e) => getStatus(e) === filter);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner large" />
        <p>Loading elections from chain...</p>
      </div>
    );
  }

  return (
    <section>
      <div className="list-header">
        <h2 className="section-title">
          Elections
          <span className="count-badge">{elections.length}</span>
        </h2>

        <div className="list-controls">
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                type="button"
              >
                {f}
              </button>
            ))}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={onRefresh}
            disabled={loading}
            type="button"
            title="Refresh elections from chain"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🗳️</span>
          <p>
            {elections.length === 0
              ? "No elections have been created yet."
              : `No ${filter.toLowerCase()} elections found.`}
          </p>
          {elections.length === 0 && isOwner && (
            <p className="muted">Use the admin panel above to create the first election.</p>
          )}
        </div>
      ) : (
        <div className="elections-grid">
          {filtered.map((election) => (
            <VotePanel
              key={election.id}
              election={election}
              account={account}
              isOwner={isOwner}
              txPending={txPending}
              onVote={onVote}
              onToggle={onToggle}
              checkHasVoted={checkHasVoted}
            />
          ))}
        </div>
      )}
    </section>
  );
}
