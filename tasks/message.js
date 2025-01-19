const { task } = require("hardhat/config");

task("send-message", "Sends a message to the cross-chain messenger")
  .addParam("contract", "The messenger contract address")
  .addParam("message", "The message to send")
  .setAction(async (taskArgs, hre) => {
    const messenger = await hre.ethers.getContractAt("CrossChainMessenger", taskArgs.contract);
    
    console.log(`Sending message: ${taskArgs.message}`);
    const tx = await messenger.sendMessage(taskArgs.message);
    await tx.wait();
    
    console.log(`Message sent! Transaction hash: ${tx.hash}`);
  });

task("receive-message", "Receives a message as a trusted relayer")
  .addParam("contract", "The messenger contract address")
  .addParam("sender", "The original sender's address")
  .addParam("message", "The message to receive")
  .setAction(async (taskArgs, hre) => {
    const messenger = await hre.ethers.getContractAt("CrossChainMessenger", taskArgs.contract);
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create message hash
    const messageHash = hre.ethers.keccak256(
      hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "string", "uint256"],
        [taskArgs.sender, taskArgs.message, timestamp]
      )
    );
    
    console.log(`Receiving message from ${taskArgs.sender}: ${taskArgs.message}`);
    const tx = await messenger.receiveMessage(
      taskArgs.sender,
      taskArgs.message,
      timestamp,
      messageHash
    );
    await tx.wait();
    
    console.log(`Message received! Transaction hash: ${tx.hash}`);
  });

task("list-pending", "Lists all pending messages")
  .addParam("contract", "The messenger contract address")
  .setAction(async (taskArgs, hre) => {
    const messenger = await hre.ethers.getContractAt("CrossChainMessenger", taskArgs.contract);
    
    const pendingMessages = await messenger.getPendingMessages();
    console.log("\nPending Messages:");
    console.log("----------------");
    
    pendingMessages.forEach((msg, index) => {
      console.log(`\nMessage #${index + 1}:`);
      console.log(`Sender: ${msg.sender}`);
      console.log(`Content: ${msg.message}`);
      console.log(`Timestamp: ${new Date(msg.timestamp * 1000).toLocaleString()}`);
    });
    
    console.log(`\nTotal pending messages: ${pendingMessages.length}`);
  });

task("add-relayer", "Adds a trusted relayer")
  .addParam("contract", "The messenger contract address")
  .addParam("relayer", "The relayer address to add")
  .setAction(async (taskArgs, hre) => {
    const messenger = await hre.ethers.getContractAt("CrossChainMessenger", taskArgs.contract);
    
    console.log(`Adding relayer: ${taskArgs.relayer}`);
    const tx = await messenger.setTrustedRelayer(taskArgs.relayer, true);
    await tx.wait();
    
    console.log(`Relayer added! Transaction hash: ${tx.hash}`);
  });

task("remove-relayer", "Removes a trusted relayer")
  .addParam("contract", "The messenger contract address")
  .addParam("relayer", "The relayer address to remove")
  .setAction(async (taskArgs, hre) => {
    const messenger = await hre.ethers.getContractAt("CrossChainMessenger", taskArgs.contract);
    
    console.log(`Removing relayer: ${taskArgs.relayer}`);
    const tx = await messenger.setTrustedRelayer(taskArgs.relayer, false);
    await tx.wait();
    
    console.log(`Relayer removed! Transaction hash: ${tx.hash}`);
  });