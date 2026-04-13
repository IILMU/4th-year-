// frontend/src/components/VotePanel.jsx
import React, { useState, useEffect } from "react";
import { formatTimestamp, getElectionStatus } from "../utils/contract.js";

export default function VotePanel({
  election,
  account,
  isOwner,
  txPending,
  onVote,
  onToggle,
  checkHasVoted,
}) {
  const [selected,  setSelected]  = useState(null);
  const [hasVoted,  setHasVoted]  = useState(false);
  const [checking,  setChecking]  = useState(true);
  const [showResult,setShowResult]= useState(false);

  const status = getElectionStatus(election);

  const isLive = status.label === "Live";
  const totalVotes = election.candidates.reduce((s, c) => s + c.voteCount, 0);
  const winner = election.candidates.reduce(
    (best, c) => (c.voteCount > best.voteCount ? c : best),
    election.candidates[0]
  );

  useEffect(() => {
    let cancelled = false;
    async function check() {
      setChecking(true);
      const voted = await checkHasVoted(election.id);
      if (!cancelled) {
        setHasVoted(voted);
        setChecking(false);
      }
    }
    if (account) check();
    else { setChecking(false); setHasVoted(false); }
    return () => { cancelled = true; };
  }, [account, election.id, checkHasVoted]);

  const handleVote = () => {
    if (selected === null) return;
    onVote(election.id, selected);
    setSelected(null);
  };

  const getVotePercent = (voteCount) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  return (
    <div className="vote-panel">
      <div className="vote-panel-header">
        <div className="vote-panel-meta">
          <span className={`status-badge ${status.color}`}>{status.label}</span>
          <span className="election-id">#{election.id}</span>
        </div>

        <h3 className="vote-panel-title">{election.title}</h3>

        {election.description && (
          <p className="vote-panel-desc">{election.description}</p>
        )}

        <div className="time-info">
          <span>🕐 {formatTimestamp(election.startTime)}</span>
          <span className="time-sep">→</span>
          <span>🕐 {formatTimestamp(election.endTime)}</span>
        </div>

        <div className="vote-stats">
          <span className="stat">
            <strong>{totalVotes}</strong> total vote{totalVotes !== 1 ? "s" : ""}
          </span>
          <span className="stat">
            <strong>{election.candidateCount}</strong> candidates
          </span>
        </div>
      </div>

      {/* Results toggle */}
      <button
        className="btn btn-ghost btn-sm results-toggle"
        onClick={() => setShowResult(!showResult)}
        type="button"
      >
        {showResult ? "Hide Results" : "📊 View Results"}
      </button>

      {/* Candidates */}
      <div className="candidates-vote-list">
        {election.candidates.map((candidate) => {
          const pct     = getVotePercent(candidate.voteCount);
          const isWinning = candidate.id === winner.id && totalVotes > 0;

          return (
            <div
              key={candidate.id}
              className={`candidate-option
                ${selected === candidate.id ? "selected" : ""}
                ${hasVoted || !isLive || !account ? "non-interactive" : "interactive"}
              `}
              onClick={() => {
                if (!hasVoted && isLive && account && !txPending)
                  setSelected(candidate.id);
              }}
            >
              <div className="candidate-option-top">
                <div className="candidate-option-name">
                  {isWinning && totalVotes > 0 && (
                    <span className="leading-icon" title="Currently leading">🏆</span>
                  )}
                  <span>{candidate.name}</span>
                </div>

                {selected === candidate.id && (
                  <span className="selected-check">✓</span>
                )}

                {showResult && (
                  <span className="vote-pct">{pct}%</span>
                )}
              </div>

              {showResult && (
                <div className="vote-bar-wrap">
                  <div
                    className="vote-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                  <span className="vote-count-label">
                    {candidate.voteCount} vote{candidate.voteCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vote action */}
      <div className="vote-action-area">
        {!account && (
          <p className="action-hint">Connect your wallet to vote.</p>
        )}

        {account && checking && (
          <p className="action-hint">Checking vote status...</p>
        )}

        {account && !checking && hasVoted && (
          <div className="voted-badge">
            <span>✅</span> You have voted in this election.
          </div>
        )}

        {account && !checking && !hasVoted && isLive && (
          <button
            className="btn btn-primary btn-full"
            onClick={handleVote}
            disabled={selected === null || txPending}
          >
            {txPending ? (
              <><span className="spinner" /> Submitting Vote...</>
            ) : selected ? (
              `🗳️ Vote for ${election.candidates.find((c) => c.id === selected)?.name}`
            ) : (
              "Select a candidate above"
            )}
          </button>
        )}

        {account && !checking && !hasVoted && !isLive && (
          <p className="action-hint muted">
            {status.label === "Upcoming"
              ? "Voting opens at " + formatTimestamp(election.startTime)
              : status.label === "Ended"
              ? "This election has concluded."
              : "This election is currently paused."}
          </p>
        )}
      </div>

      {/* Admin controls */}
      {isOwner && (
        <div className="admin-controls">
          <span className="admin-label">🛡️ Admin</span>
          <button
            className={`btn btn-sm ${election.active ? "btn-danger" : "btn-success"}`}
            onClick={() => onToggle(election.id)}
            disabled={txPending}
          >
            {election.active ? "⏸ Pause Election" : "▶ Resume Election"}
          </button>
        </div>
      )}
    </div>
  );
}
