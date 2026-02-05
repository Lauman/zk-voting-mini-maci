// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Interface del verifier generado por circom/snarkjs
interface IVerifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals
    ) external view returns (bool);
}

contract ZKMultiPollVoting {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Poll {
        bytes32 merkleRoot;
        uint256 yesVotes;
        uint256 noVotes;
        bool active;
    }

    struct Proof {
        uint[2] a;
        uint[2][2] b;
        uint[2] c;
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice pollId => Poll
    mapping(uint256 => Poll) public polls;

    /// @notice nullifier => used
    mapping(address => mapping(bytes32 => bool)) public usedNullifiers;

    IVerifier public immutable verifier;
    address public owner;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event PollCreated(uint256 indexed pollId, bytes32 merkleRoot);
    event PollClosed(uint256 indexed pollId);
    event VoteCast(uint256 indexed pollId, uint256 vote, bytes32 nullifier);

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                            POLL MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function createPoll(uint256 pollId, bytes32 merkleRoot) external onlyOwner {
        Poll storage poll = polls[pollId];

        require(!poll.active, "Poll already exists");
        require(merkleRoot != bytes32(0), "Invalid root");

        polls[pollId] = Poll({
            merkleRoot: merkleRoot,
            yesVotes: 0,
            noVotes: 0,
            active: true
        });

        emit PollCreated(pollId, merkleRoot);
    }

    function closePoll(uint256 pollId) external onlyOwner {
        Poll storage poll = polls[pollId];

        require(poll.active, "Poll not active");

        poll.active = false;

        emit PollClosed(pollId);
    }

    /*//////////////////////////////////////////////////////////////
                                VOTING
    //////////////////////////////////////////////////////////////*/

    /**
     * @param pollId       Poll identifier (public signal)
     * @param voteOption         0 = NO, 1 = YES (public signal)
     * @param nullifier    Poseidon(secret, pollId) (public signal)
     * @param proof        ZK proof generated off-chain
     * @param publicSignals Must match the circuit order exactly
     */
    function vote(
        uint256 pollId,
        uint256 voteOption,
        bytes32 nullifier,
        Proof calldata proof,
        uint[4] calldata publicSignals
    ) external {
        Poll storage poll = polls[pollId];

        require(poll.active, "Poll not active");
        require(voteOption == 0 || voteOption == 1, "Invalid vote");
        require(!usedNullifiers[msg.sender][nullifier], "Nullifier already used");

        // Verify ZK proof
        bool valid = verifier.verifyProof(
            proof.a,
            proof.b,
            proof.c,
            publicSignals
        );
        require(valid, "Invalid ZK proof");

        // Mark nullifier as used
        usedNullifiers[msg.sender][nullifier] = true;

        // Count vote
        if (voteOption == 1) {
            poll.yesVotes++;
        } else {
            poll.noVotes++;
        }

        emit VoteCast(pollId, voteOption, nullifier);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW HELPERS
    //////////////////////////////////////////////////////////////*/

    function getResults(
        uint256 pollId
    ) external view returns (uint256 yes, uint256 no, bool active) {
        Poll storage poll = polls[pollId];
        return (poll.yesVotes, poll.noVotes, poll.active);
    }
}
