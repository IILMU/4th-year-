// frontend/src/App.jsx
import React from "react";
import { useContract } from "./hooks/useContract.js";
import WalletConnect  from "./components/WalletConnect.jsx";
import CreateElection from "./components/CreateElection.jsx";
import ElectionList   from "./components/ElectionList.jsx";
import { CONTRACT_ADDRESS } from "./utils/contract.js";

export default function App() {
  const {
    account,
    isOwner,
    isCorrectNetwork,
    elections,
    loading,
    txPending,
    error,
    successMsg,
    connect,
    switchNetwork,
    loadElections,
    createElection,
    toggleElection,
    castVote,
    checkHasVoted,
  } = useContract();

  const isReady = account && isCorrectNetwork;
  const contractConfigured = CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0xYOUR_CONTRACT_ADDRESS_HERE";

  return (
    <div className="app">
      <WalletConnect
        account={account}
        isOwner={isOwner}
        isCorrectNetwork={isCorrectNetwork}
        onConnect={connect}
        onSwitchNetwork={switchNetwork}
      />

      <main className="main-content">
        {/* Toast messages */}
        {error && (
          <div className="toast toast-error" role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}
        {successMsg && (
          <div className="toast toast-success" role="status">
            <span>✅ {successMsg}</span>
          </div>
        )}

        {/* Config warning */}
        {!contractConfigured && (
          <div className="setup-warning">
            <h3>⚙️ Setup Required</h3>
            <p>
              Set <code>VITE_CONTRACT_ADDRESS</code> in <code>frontend/.env</code> to your deployed contract address.
              See the <strong>README</strong> for deployment instructions.
            </p>
          </div>
        )}

        {/* No wallet */}
        {!account && contractConfigured && (
          <div className="welcome-card">
            <div className="welcome-icon">⛓️</div>
            <h2>Welcome to VoteChain Pro</h2>
            <p>
              A decentralized, tamper-proof voting platform powered by Ethereum smart contracts.
              Connect your MetaMask wallet to participate in elections.
            </p>
            <ul className="welcome-features">
              <li>🔐 One wallet, one vote — enforced on-chain</li>
              <li>🌐 Fully transparent and auditable results</li>
              <li>⚡ Gas-optimized contract design</li>
              <li>🛡️ Admin controls with Ownable pattern</li>
            </ul>
            <button className="btn btn-primary btn-large" onClick={connect}>
              Connect MetaMask to Begin
            </button>
          </div>
        )}

        {/* Wrong network */}
        {account && !isCorrectNetwork && (
          <div className="network-card">
            <span className="network-warning-icon">🔗</span>
            <h3>Wrong Network Detected</h3>
            <p>VoteChain Pro requires the Sepolia testnet. Please switch your network in MetaMask.</p>
            <button className="btn btn-warning" onClick={switchNetwork}>
              Switch to Sepolia
            </button>
          </div>
        )}

        {/* Main dApp content */}
        {isReady && contractConfigured && (
          <>
            {/* Admin panel */}
            {isOwner && (
              <CreateElection
                onSubmit={createElection}
                txPending={txPending}
              />
            )}

            {/* Elections list */}
            <ElectionList
              elections={elections}
              account={account}
              isOwner={isOwner}
              txPending={txPending}
              loading={loading}
              onVote={castVote}
              onToggle={toggleElection}
              onRefresh={loadElections}
              checkHasVoted={checkHasVoted}
            />
          </>
        )}
      </main>

      <footer className="footer">
        <p>
          VoteChain Pro v2 &nbsp;·&nbsp; Built on Ethereum &nbsp;·&nbsp;
          {CONTRACT_ADDRESS && contractConfigured && (
            <>
              Contract:{" "}
              <a
                href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
              </a>
            </>
          )}
        </p>
      </footer>
    </div>
  );
}
