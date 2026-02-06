import { expect } from "chai"
import { network } from "hardhat";




const { ethers } = await network.connect();

describe("ZKMultiPollVoting", function () {
  let voting: any
  let verifier: any
  let owner: any
  let user: any

  const POLL_ID = 8
  const MERKLE_ROOT = "0x0839cb5dbcd45fa66fd1bff681d7fdeae2465cbb608c87b3998cea8c5d8f9aac"

  const NULLIFIER = "0x2982be0fe79040b4a0dc30e569a08533623032b8c3ea525f56ca0d8bc60bc597"

  const PROOF: any = {
    a: [
      "17326653313373143479789856744057354394152646986418137732405511839312655379681",
      "13243889983250170070952560734520324267242444378519685301776934481179120874114"
    ],
    b: [
      [
        "21243914648144916397361746026118531600666822352765810443242763693950619848007",
        "7419609576938432461015767914123392411226678151106414330788676694858504070558"
      ],
      [
        "8847116205093594311294351944593894949818396343599516529407694883718037771976",
        "14261443450187269946883059763629583113309395082223933446818107460974500985047"
      ]
    ],
    c: [
      "16674639451837931995511923512538713393683538032832291105784185362809337427243",
      "3506837268072791152246810887118928185133029375650019803350296613216522639676"
    ]
  };

  const PUBLIC_SIGNALS: [any, any, any, any] = [
    "18775828670926683617889025948752726224528045305167044806444528718373737710999",
    "1",
    "3720616653028013822312861221679392249031832781774563366107458835261883914924",
    "2"
  ]

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners()

    const Verifier = await ethers.getContractFactory("Groth16Verifier")
    verifier = await Verifier.deploy()

    const Voting = await ethers.getContractFactory("ZKMultiPollVoting")
    voting = await Voting.deploy(await verifier.getAddress(),owner.address)
  })

  /*//////////////////////////////////////////////////////////////
                          POLL MANAGEMENT
  //////////////////////////////////////////////////////////////*/

  it("creates a poll", async () => {
    await voting.createPoll(POLL_ID, MERKLE_ROOT)

    const poll = await voting.polls(POLL_ID)
    expect(poll.active).to.equal(true)
    expect(poll.merkleRoot).to.equal(MERKLE_ROOT)
  })

  it("prevents non-owner from creating poll", async () => {
    await expect(
      voting.connect(user).createPoll(POLL_ID, MERKLE_ROOT)
    ).to.be.revertedWithCustomError(voting,"OwnableUnauthorizedAccount")
  })

  it("closes a poll", async () => {
    await voting.createPoll(POLL_ID, MERKLE_ROOT)
    await voting.closePoll(POLL_ID)

    const poll = await voting.polls(POLL_ID)
    expect(poll.active).to.equal(false)
  })

  /*//////////////////////////////////////////////////////////////
                              VOTING
  //////////////////////////////////////////////////////////////*/

  it("allows a valid vote", async () => {
    await voting.createPoll(POLL_ID, MERKLE_ROOT)

    await voting.vote(
      POLL_ID,
      1,
      NULLIFIER,
      PROOF,
      PUBLIC_SIGNALS
    )

    const [yes, no] = await voting.getResults(POLL_ID)
    expect(yes).to.equal(1)
    expect(no).to.equal(0)
  })

  it("prevents double voting with same nullifier", async () => {
    await voting.createPoll(POLL_ID, MERKLE_ROOT)

    await voting.vote(
      POLL_ID,
      1,
      NULLIFIER,
      PROOF,
      PUBLIC_SIGNALS
    )

    await expect(
      voting.vote(
        POLL_ID,
        1,
        NULLIFIER,
        PROOF,
        PUBLIC_SIGNALS
      )
    ).to.be.revertedWithCustomError(voting,"NullifierAlreadyUsed")
  })

  it("rejects invalid ZK proof", async () => {
    await voting.createPoll(POLL_ID, MERKLE_ROOT)

    const PROOF: any = {
      a: [
        "0",
        "0"
      ],
      b: [
        [
          "0",
          "0"
        ],
        [
          "0",
          "0"
        ]
      ],
      c: [
        "0",
        "0"
      ]
    };

    await expect(
      voting.vote(
        POLL_ID,
        1,
        NULLIFIER,
        PROOF,
        PUBLIC_SIGNALS
      )
    ).to.be.revertedWithCustomError(voting,"InvalidProof")
  })

  it("rejects vote on inactive poll", async () => {
    await expect(
      voting.vote(
        POLL_ID,
        1,
        NULLIFIER,
        PROOF,
        PUBLIC_SIGNALS
      )
    ).to.be.revertedWithCustomError(voting,"PollNotActive")
  })

  it("rejects invalid vote option", async () => {
    await voting.createPoll(POLL_ID, MERKLE_ROOT)

    await expect(
      voting.vote(
        POLL_ID,
        2,
        NULLIFIER,
        PROOF,
        PUBLIC_SIGNALS
      )
    ).to.be.revertedWithCustomError(voting,"InvalidVoteOption")
  })
})
