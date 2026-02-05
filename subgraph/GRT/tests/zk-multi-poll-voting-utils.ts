import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  PollClosed,
  PollCreated,
  VoteCast
} from "../generated/ZKMultiPollVoting/ZKMultiPollVoting"

export function createPollClosedEvent(pollId: BigInt): PollClosed {
  let pollClosedEvent = changetype<PollClosed>(newMockEvent())

  pollClosedEvent.parameters = new Array()

  pollClosedEvent.parameters.push(
    new ethereum.EventParam("pollId", ethereum.Value.fromUnsignedBigInt(pollId))
  )

  return pollClosedEvent
}

export function createPollCreatedEvent(
  pollId: BigInt,
  merkleRoot: Bytes
): PollCreated {
  let pollCreatedEvent = changetype<PollCreated>(newMockEvent())

  pollCreatedEvent.parameters = new Array()

  pollCreatedEvent.parameters.push(
    new ethereum.EventParam("pollId", ethereum.Value.fromUnsignedBigInt(pollId))
  )
  pollCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "merkleRoot",
      ethereum.Value.fromFixedBytes(merkleRoot)
    )
  )

  return pollCreatedEvent
}

export function createVoteCastEvent(
  pollId: BigInt,
  vote: BigInt,
  nullifier: Bytes
): VoteCast {
  let voteCastEvent = changetype<VoteCast>(newMockEvent())

  voteCastEvent.parameters = new Array()

  voteCastEvent.parameters.push(
    new ethereum.EventParam("pollId", ethereum.Value.fromUnsignedBigInt(pollId))
  )
  voteCastEvent.parameters.push(
    new ethereum.EventParam("vote", ethereum.Value.fromUnsignedBigInt(vote))
  )
  voteCastEvent.parameters.push(
    new ethereum.EventParam(
      "nullifier",
      ethereum.Value.fromFixedBytes(nullifier)
    )
  )

  return voteCastEvent
}
