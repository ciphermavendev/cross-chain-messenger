// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CrossChainMessenger is Ownable {
    // Events
    event MessageSent(address indexed sender, string message, uint256 timestamp);
    event MessageReceived(address indexed sender, string message, uint256 timestamp);
    
    // Struct to store message details
    struct Message {
        address sender;
        string message;
        uint256 timestamp;
        bool isProcessed;
    }
    
    // Message queue
    Message[] public messageQueue;
    
    // Mapping to track processed messages
    mapping(bytes32 => bool) public processedMessages;
    
    // Trusted relayer addresses
    mapping(address => bool) public trustedRelayers;
    
    constructor() Ownable(msg.sender) {
        trustedRelayers[msg.sender] = true;
    }
    
    // Modifier to check if caller is a trusted relayer
    modifier onlyTrustedRelayer() {
        require(trustedRelayers[msg.sender], "Caller is not a trusted relayer");
        _;
    }
    
    // Add or remove trusted relayers
    function setTrustedRelayer(address relayer, bool status) external onlyOwner {
        trustedRelayers[relayer] = status;
    }
    
    // Send a message to the other chain
    function sendMessage(string calldata message) external {
        messageQueue.push(Message({
            sender: msg.sender,
            message: message,
            timestamp: block.timestamp,
            isProcessed: false
        }));
        
        emit MessageSent(msg.sender, message, block.timestamp);
    }
    
    // Receive a message from the other chain
    function receiveMessage(
        address originalSender,
        string calldata message,
        uint256 timestamp,
        bytes32 messageHash
    ) external onlyTrustedRelayer {
        require(!processedMessages[messageHash], "Message already processed");
        
        // Create message hash for verification
        bytes32 computedHash = keccak256(
            abi.encodePacked(originalSender, message, timestamp)
        );
        require(computedHash == messageHash, "Invalid message hash");
        
        // Mark message as processed
        processedMessages[messageHash] = true;
        
        emit MessageReceived(originalSender, message, timestamp);
    }
    
    // Get number of pending messages
    function getPendingMessageCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < messageQueue.length; i++) {
            if (!messageQueue[i].isProcessed) {
                count++;
            }
        }
        return count;
    }
    
    // Get pending messages
    function getPendingMessages() external view returns (Message[] memory) {
        uint256 count = this.getPendingMessageCount();
        Message[] memory pendingMessages = new Message[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < messageQueue.length; i++) {
            if (!messageQueue[i].isProcessed) {
                pendingMessages[index] = messageQueue[i];
                index++;
            }
        }
        
        return pendingMessages;
    }
}