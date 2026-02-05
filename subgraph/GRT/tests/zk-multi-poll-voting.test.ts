import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { PollClosed } from "../generated/schema"
import { PollClosed as PollClosedEvent } from "../generated/ZKMultiPollVoting/ZKMultiPollVoting"
import { handlePollClosed } from "../src/zk-multi-poll-voting"
import { createPollClosedEvent } from "./zk-multi-poll-voting-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let pollId = BigInt.fromI32(234)
    let newPollClosedEvent = createPollClosedEvent(pollId)
    handlePollClosed(newPollClosedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("PollClosed created and stored", () => {
    assert.entityCount("PollClosed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "PollClosed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "pollId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
