export interface Poll {
  merkleRoot: string;
  yesVotes: number;
  noVotes: number;
  isActive: boolean;
}