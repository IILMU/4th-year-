// frontend/src/hooks/useContract.js
import { useState, useEffect, useCallback } from "react";
import {
  connectWallet,
  validateNetwork,
  switchToRequiredNetwork,
  getReadContract,
  getWriteContract,
  REQUIRED_CHAIN_ID,
} from "../utils/contract.js";

export function useContract() {
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Clear messages
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 6000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // MetaMask listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsOwner(false);
      } else {
        setAccount(accounts[0]);
        checkOwner(accounts[0]);
      }
    };

    const onChainChanged = (hexChainId) => {
      const id = parseInt(hexChainId, 16);
      setChainId(id);
      setIsCorrectNetwork(id === REQUIRED_CHAIN_ID);
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        checkOwner(accounts[0]);
        checkChain();
      }
    });

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, []);

  const checkChain = async () => {
    try {
      const contract = getReadContract();
      const network = await contract.runner.provider.getNetwork();
      const id = Number(network.chainId);
      setChainId(id);
      setIsCorrectNetwork(id === REQUIRED_CHAIN_ID);
    } catch {
      setIsCorrectNetwork(false);
    }
  };

  const checkOwner = useCallback(async (address) => {
    try {
      const contract = getReadContract();
      const ownerAddress = await contract.owner();
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
    } catch {
      setIsOwner(false);
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      setError(null);
      const address = await connectWallet();
      setAccount(address);
      await checkChain();
      await checkOwner(address);
    } catch (err) {
      setError(err.message);
    }
  }, [checkOwner]);

  const switchNetwork = useCallback(async () => {
    try {
      await switchToRequiredNetwork();
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Load elections
  const loadElections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const contract = getReadContract();
      const count = await contract.electionCount();
      const total = Number(count);

      if (total === 0) {
        setElections([]);
        return;
      }

      const fetched = await Promise.all(
        Array.from({ length: total }, (_, i) =>
          fetchElection(contract, i + 1) // ✅ FIXED (1-based ID)
        )
      );

      setElections(fetched.filter(Boolean));
    } catch (err) {
      setError("Failed to load elections: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchElection = async (contract, id) => {
    try {
      const info = await contract.getElectionInfo(id);
      const [ids, names, voteCounts] = await contract.getAllCandidates(id);

      const candidates = ids.map((cId, i) => ({
        id: Number(cId),
        name: names[i],
        voteCount: Number(voteCounts[i]),
      }));

      return {
        id: Number(info.id),
        title: info.title,
        description: info.description,
        startTime: Number(info.startTime),
        endTime: Number(info.endTime),
        active: info.active,
        candidateCount: Number(info.candidateCount),
        candidates,
      };
    } catch {
      return null;
    }
  };

  // ✅ Only load when network is correct
  useEffect(() => {
    if (isCorrectNetwork) {
      loadElections();
    }
  }, [isCorrectNetwork, loadElections]);

  const createElection = useCallback(async (title, description, candidateNames, startTime, endTime) => {
    setTxPending(true);
    setError(null);
    try {
      await validateNetwork();
      const contract = await getWriteContract();
      const tx = await contract.createElection(
        title,
        description,
        candidateNames,
        BigInt(startTime),
        BigInt(endTime)
      );
      await tx.wait();
      setSuccessMsg(`Election "${title}" created successfully!`);
      await loadElections();
    } catch (err) {
      setError(parseContractError(err));
    } finally {
      setTxPending(false);
    }
  }, [loadElections]);

  const toggleElection = useCallback(async (electionId) => {
    setTxPending(true);
    setError(null);
    try {
      await validateNetwork();
      const contract = await getWriteContract();
      const tx = await contract.toggleElection(BigInt(electionId));
      await tx.wait();
      setSuccessMsg("Election status updated.");
      await loadElections();
    } catch (err) {
      setError(parseContractError(err));
    } finally {
      setTxPending(false);
    }
  }, [loadElections]);

  const castVote = useCallback(async (electionId, candidateId) => {
    setTxPending(true);
    setError(null);
    try {
      await validateNetwork();
      const contract = await getWriteContract();
      const tx = await contract.vote(BigInt(electionId), BigInt(candidateId));
      await tx.wait();
      setSuccessMsg("Your vote has been recorded on-chain!");
      await loadElections();
    } catch (err) {
      setError(parseContractError(err));
    } finally {
      setTxPending(false);
    }
  }, [loadElections]);

  const checkHasVoted = useCallback(async (electionId) => {
    if (!account) return false;
    try {
      const contract = getReadContract();
      return await contract.hasVotedInElection(BigInt(electionId), account);
    } catch {
      return false;
    }
  }, [account]);

  return {
    account,
    isOwner,
    chainId,
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
  };
}

function parseContractError(err) {
  const msg = err.message || "";
  if (msg.includes("AlreadyVoted")) return "You have already voted.";
  if (msg.includes("ElectionNotActive")) return "Election is paused.";
  if (msg.includes("ElectionNotStarted")) return "Election not started.";
  if (msg.includes("ElectionEnded")) return "Election ended.";
  if (msg.includes("InvalidCandidate")) return "Invalid candidate.";
  if (msg.includes("ElectionDoesNotExist")) return "Election not found.";
  if (msg.includes("TooFewCandidates")) return "At least 2 candidates required.";
  if (msg.includes("InvalidTimeRange")) return "Invalid time range.";
  if (msg.includes("EndTimeInPast")) return "End time must be future.";
  if (msg.includes("OwnableUnauthorizedAccount")) return "Only owner allowed.";
  if (msg.includes("user rejected")) return "Transaction rejected.";
  if (msg.includes("insufficient funds")) return "Insufficient ETH.";
  return err.shortMessage || msg.slice(0, 120);
}