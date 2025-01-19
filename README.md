# Cross-Chain Messenger

A secure and efficient cross-chain messaging system built on blockchain technology. This project enables communication between different blockchain networks through a trusted relayer system.

## Features

- Secure message passing between different blockchain networks
- Trusted relayer system for message verification
- Message queue management
- Duplicate message prevention
- Comprehensive event logging
- Gas-efficient operations

## Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn
- An Ethereum wallet with some test tokens
- Access to blockchain RPC endpoints

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cross-chain-messenger.git
cd cross-chain-messenger
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PRIVATE_KEY=your_private_key
SOURCE_RPC_URL=your_source_chain_rpc_url
DESTINATION_RPC_URL=your_destination_chain_rpc_url
```

## Usage

1. Compile the contracts:
```bash
npx hardhat compile
```

2. Deploy to source chain:
```bash
npx hardhat run scripts/deploy.js --network sourceChain
```

3. Deploy to destination chain:
```bash
npx hardhat run scripts/deploy.js --network destinationChain
```

4. Run tests:
```bash
npx hardhat test
```

## Contract Architecture

The CrossChainMessenger contract includes:

- Message queue system
- Trusted relayer management
- Message verification using hashes
- Event emission for tracking
- Access control mechanisms

## Security Considerations

- Only trusted relayers can deliver messages
- Messages are verified using cryptographic hashes
- Duplicate message prevention
- Owner-controlled relayer management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Support

For support, please open an issue in the GitHub repository.