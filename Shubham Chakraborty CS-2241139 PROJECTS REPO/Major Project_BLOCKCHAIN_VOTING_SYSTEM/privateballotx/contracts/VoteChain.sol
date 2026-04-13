// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VoteChain
 * @author VoteChain Pro v2
 * @notice Decentralized on-chain voting system with one-wallet-one-vote enforcement
 * @dev Uses OpenZeppelin Ownable v5. Elections are created by admin only.
 *      Candidates and vote counts are stored per-election.
 *      Gas is optimized via unchecked loops and tight storage packing.
 */
contract VoteChain is Ownable {
    // ─── Storage Structures ────────────────────────────────────────────────────

    /// @dev Candidate packed to 1 storage slot where possible
    struct Candidate {
        uint128 id;        // 16 bytes
        uint128 voteCount; // 16 bytes — packed into one 32-byte slot
        string name;       // separate slot (dynamic)
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint64 startTime;   // packed: 8 bytes
        uint64 endTime;     // packed: 8 bytes — startTime + endTime share a slot
        bool active;        // 1 byte
        uint32 candidateCount; // 4 bytes — packed with active
        // mappings cannot be packed but are per-election keyed storage
        mapping(uint256 => Candidate) candidates;
        mapping(address => bool) hasVoted;
    }

    // ─── State Variables ───────────────────────────────────────────────────────

    uint256 public electionCount;
    mapping(uint256 => Election) private elections;

    // ─── Events ────────────────────────────────────────────────────────────────

    /// @notice Emitted when a new election is created
    event ElectionCreated(
        uint256 indexed electionId,
        address indexed creator,
        string title,
        uint64 startTime,
        uint64 endTime
    );

    /// @notice Emitted when a vote is cast
    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        uint256 indexed candidateId
    );

    /// @notice Emitted when an election's active status is toggled
    event ElectionToggled(uint256 indexed electionId, bool active);

    // ─── Errors ────────────────────────────────────────────────────────────────

    error InvalidTimeRange();
    error EndTimeInPast();
    error TooFewCandidates();
    error ElectionNotActive();
    error ElectionNotStarted();
    error ElectionEnded();
    error AlreadyVoted();
    error InvalidCandidate();
    error ElectionDoesNotExist();

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── Admin Functions ───────────────────────────────────────────────────────

    /**
     * @notice Create a new election (admin only)
     * @param _title        Short title for the election
     * @param _description  Longer description of what is being voted on
     * @param _candidateNames Array of candidate name strings (min 2)
     * @param _startTime    Unix timestamp when voting opens
     * @param _endTime      Unix timestamp when voting closes
     */
    function createElection(
        string calldata _title,
        string calldata _description,
        string[] calldata _candidateNames,
        uint64 _startTime,
        uint64 _endTime
    ) external onlyOwner {
        if (_candidateNames.length < 2) revert TooFewCandidates();
        if (_startTime >= _endTime)     revert InvalidTimeRange();
        if (_endTime <= block.timestamp) revert EndTimeInPast();

        uint256 electionId = ++electionCount;
        Election storage e = elections[electionId];

        e.id            = electionId;
        e.title         = _title;
        e.description   = _description;
        e.startTime     = _startTime;
        e.endTime       = _endTime;
        e.active        = true;
        e.candidateCount = uint32(_candidateNames.length);

        uint256 len = _candidateNames.length;
        for (uint256 i = 0; i < len; ) {
            uint256 cId = i + 1;
            e.candidates[cId] = Candidate({
                id:        uint128(cId),
                voteCount: 0,
                name:      _candidateNames[i]
            });
            unchecked { ++i; }
        }

        emit ElectionCreated(electionId, msg.sender, _title, _startTime, _endTime);
    }

    /**
     * @notice Toggle an election's active flag (admin only)
     * @param _electionId The election to toggle
     */
    function toggleElection(uint256 _electionId) external onlyOwner {
        if (elections[_electionId].id == 0) revert ElectionDoesNotExist();
        bool newStatus = !elections[_electionId].active;
        elections[_electionId].active = newStatus;
        emit ElectionToggled(_electionId, newStatus);
    }

    // ─── Voter Functions ───────────────────────────────────────────────────────

    /**
     * @notice Cast a vote for a candidate in an election
     * @param _electionId  The election to vote in
     * @param _candidateId The candidate to vote for (1-indexed)
     */
    function vote(uint256 _electionId, uint256 _candidateId) external {
        Election storage e = elections[_electionId];

        if (!e.active)                                   revert ElectionNotActive();
        if (block.timestamp < e.startTime)               revert ElectionNotStarted();
        if (block.timestamp > e.endTime)                 revert ElectionEnded();
        if (e.hasVoted[msg.sender])                      revert AlreadyVoted();
        if (_candidateId == 0 || _candidateId > e.candidateCount) revert InvalidCandidate();

        // Mark voted before state change — prevents reentrancy on future integrations
        e.hasVoted[msg.sender] = true;
        unchecked {
            // voteCount fits in uint128 — overflow requires 3.4 × 10^38 votes
            e.candidates[_candidateId].voteCount++;
        }

        emit VoteCast(_electionId, msg.sender, _candidateId);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    /**
     * @notice Retrieve core metadata for an election
     */
    function getElectionInfo(uint256 _electionId)
        external
        view
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint64  startTime,
            uint64  endTime,
            bool    active,
            uint256 candidateCount
        )
    {
        Election storage e = elections[_electionId];
        if (e.id == 0) revert ElectionDoesNotExist();
        return (
            e.id,
            e.title,
            e.description,
            e.startTime,
            e.endTime,
            e.active,
            e.candidateCount
        );
    }

    /**
     * @notice Retrieve candidate data for a specific candidate within an election
     */
    function getCandidate(uint256 _electionId, uint256 _candidateId)
        external
        view
        returns (
            uint256 id,
            string memory name,
            uint256 voteCount
        )
    {
        Election storage e = elections[_electionId];
        if (e.id == 0) revert ElectionDoesNotExist();
        Candidate storage c = e.candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    /**
     * @notice Check whether a given address has voted in an election
     */
    function hasVotedInElection(uint256 _electionId, address _voter)
        external
        view
        returns (bool)
    {
        return elections[_electionId].hasVoted[_voter];
    }

    /**
     * @notice Retrieve all candidates for an election in a single call (gas-efficient for frontends)
     */
    function getAllCandidates(uint256 _electionId)
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            uint256[] memory voteCounts
        )
    {
        Election storage e = elections[_electionId];
        if (e.id == 0) revert ElectionDoesNotExist();
        uint256 count = e.candidateCount;
        ids        = new uint256[](count);
        names      = new string[](count);
        voteCounts = new uint256[](count);
        for (uint256 i = 0; i < count; ) {
            uint256 cId = i + 1;
            Candidate storage c = e.candidates[cId];
            ids[i]        = c.id;
            names[i]      = c.name;
            voteCounts[i] = c.voteCount;
            unchecked { ++i; }
        }
    }
}
