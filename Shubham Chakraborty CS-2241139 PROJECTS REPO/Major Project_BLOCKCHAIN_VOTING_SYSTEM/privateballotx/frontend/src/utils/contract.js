// frontend/src/utils/contract.js
// Ethers v6 helpers — BrowserProvider, getSigner, Contract
import { ethers } from "ethers";
import VoteChainABI from "../abi/VoteChain.json";

// Read from Vite env (must be set in frontend/.env)
export const CONTRACT_ADDRESS  = import.meta.env.VITE_CONTRACT_ADDRESS;
export const REQUIRED_CHAIN_ID = Number(import.meta.env.VITE_NETWORK_CHAIN_ID ?? 11155111);
export const NETWORK_NAME      = import.meta.env.VITE_NETWORK_NAME ?? "Sepolia";

// ── Provider (read-only) ───────────────────────────────────────────────────────
export function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask.");
  }
  // ethers v6: BrowserProvider wraps window.ethereum
  return new ethers.BrowserProvider(window.ethereum);
}

// ── Signer (requires MetaMask approval) ──────────────────────────────────────
export async function getSigner() {
  const provider = getProvider();
  // ethers v6: provider.getSigner() is async
  return provider.getSigner();
}

// ── Read-only contract instance ───────────────────────────────────────────────
export function getReadContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, VoteChainABI, provider);
}

// ── Write contract instance (connected to signer) ─────────────────────────────
export async function getWriteContract() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, VoteChainABI, signer);
}

// ── Request wallet connection + return address ─────────────────────────────────
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask to continue.");
  }
  const provider = getProvider();
  // ethers v6: sends eth_requestAccounts under the hood
  await provider.send("eth_requestAccounts", []);
  const signer  = await provider.getSigner();
  const address = await signer.getAddress();
  return address;
}

// ── Validate the user is on the correct network ──────────────────────────────
export async function validateNetwork() {
  const provider = getProvider();
  const network  = await provider.getNetwork();
  // ethers v6: network.chainId is a BigInt
  const chainId  = Number(network.chainId);
  if (chainId !== REQUIRED_CHAIN_ID) {
    throw new Error(
      `Wrong network. Please switch MetaMask to ${NETWORK_NAME} (Chain ID: ${REQUIRED_CHAIN_ID}). Currently on chain ID: ${chainId}.`
    );
  }
  return true;
}

// ── Switch MetaMask to the required network ───────────────────────────────────
export async function switchToRequiredNetwork() {
  const chainIdHex = "0x" + REQUIRED_CHAIN_ID.toString(16);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (err) {
    // Error 4902 = chain not added to MetaMask
    if (err.code === 4902) {
      throw new Error(
        `${NETWORK_NAME} is not added to your MetaMask. Please add it manually via chainlist.org.`
      );
    }
    throw err;
  }
}

// ── Format a Unix timestamp to a readable date string ─────────────────────────
export function formatTimestamp(unixTs) {
  if (!unixTs) return "—";
  return new Date(Number(unixTs) * 1000).toLocaleString();
}

// ── Return the election status label based on timing + active flag ─────────────
export function getElectionStatus(election) {
  const now = Math.floor(Date.now() / 1000);
  if (!election.active)           return { label: "Paused",   color: "status-paused"   };
  if (now < Number(election.startTime)) return { label: "Upcoming", color: "status-upcoming" };
  if (now > Number(election.endTime))   return { label: "Ended",    color: "status-ended"    };
  return                                       { label: "Live",     color: "status-live"     };
}
