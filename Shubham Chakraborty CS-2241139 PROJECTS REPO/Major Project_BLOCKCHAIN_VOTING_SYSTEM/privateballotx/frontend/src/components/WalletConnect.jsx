// frontend/src/components/WalletConnect.jsx
import React from "react";
import { NETWORK_NAME, REQUIRED_CHAIN_ID } from "../utils/contract.js";

export default function WalletConnect({
  account,
  isOwner,
  isCorrectNetwork,
  onConnect,
  onSwitchNetwork,
}) {
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <header className="header">
      <div className="header-brand">
        <span className="brand-icon">⛓️</span>
        <div>
          <h1 className="brand-title">VoteChain Pro</h1>
          <span className="brand-subtitle">Decentralized Voting</span>
        </div>
      </div>

      <div className="header-actions">
        {!account ? (
          <button className="btn btn-primary" onClick={onConnect}>
            Connect MetaMask
          </button>
        ) : !isCorrectNetwork ? (
          <div className="network-warning">
            <span className="warning-icon">⚠️</span>
            <span>Wrong Network</span>
            <button className="btn btn-warning btn-sm" onClick={onSwitchNetwork}>
              Switch to {NETWORK_NAME}
            </button>
          </div>
        ) : (
          <div className="wallet-info">
            <div className="network-badge">
              <span className="network-dot" />
              {NETWORK_NAME}
            </div>
            <div className="account-badge">
              <span className="account-icon">👤</span>
              <span className="account-address">{shortAddress}</span>
              {isOwner && <span className="owner-badge">Admin</span>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
