const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function () {
  let crossChainMessenger;
  let owner;
  let relayer;
  let user;

  beforeEach(async function () {
    // Get signers
    [owner, relayer, user] = await ethers.getSigners();

    // Deploy contract
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy();
    await crossChainMessenger.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await crossChainMessenger.owner()).to.equal(owner.address);
    });

    it("Should set deployer as trusted relayer", async function () {
      expect(await crossChainMessenger.trustedRelayers(owner.address)).to.be.true;
    });
  });

  describe("Relayer Management", function () {
    it("Should allow owner to add trusted relayer", async function () {
      await crossChainMessenger.setTrustedRelayer(relayer.address, true);
      expect(await crossChainMessenger.trustedRelayers(relayer.address)).to.be.true;
    });

    it("Should allow owner to remove trusted relayer", async function () {
      await crossChainMessenger.setTrustedRelayer(relayer.address, true);
      await crossChainMessenger.setTrustedRelayer(relayer.address, false);
      expect(await crossChainMessenger.trustedRelayers(relayer.address)).to.be.false;
    });

    it("Should prevent non-owner from managing relayers", async function () {
      await expect(
        crossChainMessenger.connect(user).setTrustedRelayer(relayer.address, true)
      ).to.be.revertedWithCustomError(crossChainMessenger, "OwnableUnauthorizedAccount");
    });
  });

  describe("Message Sending", function () {
    const testMessage = "Hello Cross Chain!";

    it("Should allow users to send messages", async function () {
      await expect(crossChainMessenger.connect(user).sendMessage(testMessage))
        .to.emit(crossChainMessenger, "MessageSent")
        .withArgs(user.address, testMessage, await ethers.provider.getBlock('latest').then(b => b.timestamp));
    });

    it("Should increment pending message count", async function () {
      await crossChainMessenger.connect(user).sendMessage(testMessage);
      expect(await crossChainMessenger.getPendingMessageCount()).to.equal(1);
    });
  });

  describe("Message Receiving", function () {
    const testMessage = "Hello Back!";
    let timestamp;
    let messageHash;

    beforeEach(async function () {
      timestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);
      messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "string", "uint256"],
          [user.address, testMessage, timestamp]
        )
      );
      await crossChainMessenger.setTrustedRelayer(relayer.address, true);
    });

    it("Should allow trusted relayer to deliver messages", async function () {
      await expect(
        crossChainMessenger
          .connect(relayer)
          .receiveMessage(user.address, testMessage, timestamp, messageHash)
      )
        .to.emit(crossChainMessenger, "MessageReceived")
        .withArgs(user.address, testMessage, timestamp);
    });

    it("Should prevent message replay", async function () {
      await crossChainMessenger
        .connect(relayer)
        .receiveMessage(user.address, testMessage, timestamp, messageHash);

      await expect(
        crossChainMessenger
          .connect(relayer)
          .receiveMessage(user.address, testMessage, timestamp, messageHash)
      ).to.be.revertedWith("Message already processed");
    });

    it("Should prevent unauthorized relayers from delivering messages", async function () {
      await expect(
        crossChainMessenger
          .connect(user)
          .receiveMessage(user.address, testMessage, timestamp, messageHash)
      ).to.be.revertedWith("Caller is not a trusted relayer");
    });
  });

  describe("Message Querying", function () {
    const testMessages = ["Message 1", "Message 2", "Message 3"];

    beforeEach(async function () {
      for (const message of testMessages) {
        await crossChainMessenger.connect(user).sendMessage(message);
      }
    });

    it("Should return correct pending message count", async function () {
      expect(await crossChainMessenger.getPendingMessageCount()).to.equal(testMessages.length);
    });

    it("Should return all pending messages", async function () {
      const pendingMessages = await crossChainMessenger.getPendingMessages();
      expect(pendingMessages.length).to.equal(testMessages.length);
      
      for (let i = 0; i < testMessages.length; i++) {
        expect(pendingMessages[i].message).to.equal(testMessages[i]);
        expect(pendingMessages[i].sender).to.equal(user.address);
        expect(pendingMessages[i].isProcessed).to.be.false;
      }
    });
  });
});