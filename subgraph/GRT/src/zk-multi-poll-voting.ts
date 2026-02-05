import {
  PollClosed as PollClosedEvent,
  PollCreated as PollCreatedEvent,
  VoteCast as VoteCastEvent
} from "../generated/ZKMultiPollVoting/ZKMultiPollVoting"
import { PollClosed, PollCreated, VoteCast } from "../generated/schema"

export function handlePollClosed(event: PollClosedEvent): void {
  let entity = new PollClosed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollId = event.params.pollId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePollCreated(event: PollCreatedEvent): void {
  let entity = new PollCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollId = event.params.pollId
  entity.merkleRoot = event.params.merkleRoot

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteCast(event: VoteCastEvent): void {
  let entity = new VoteCast(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollId = event.params.pollId
  entity.vote = event.params.vote
  entity.nullifier = event.params.nullifier

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
