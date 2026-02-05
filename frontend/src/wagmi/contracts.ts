export const VOTING_ADDRESS = "0xYourContractAddressHere";

export const VotingABI = [
  {
    "type": "function",
    "name": "createPoll",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "pollId", "type": "uint256" },
      { "name": "merkleRoot", "type": "bytes32" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "vote",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "pollId", "type": "uint256" },
      { "name": "vote", "type": "uint256" },
      { "name": "nullifier", "type": "bytes32" },
      {
        "name": "proof",
        "type": "tuple",
        "components": [
          { "name": "a", "type": "uint256[2]" },
          { "name": "b", "type": "uint256[2][2]" },
          { "name": "c", "type": "uint256[2]" }
        ]
      },
      { "name": "publicSignals", "type": "uint256[4]" }
    ],
    "outputs": []
  }
];
