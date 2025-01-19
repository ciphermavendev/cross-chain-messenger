require("@nomicfoundation/hardhat-toolbox");
require("./tasks/message");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
    },
    // Add your network configurations here
    // Example:
    // goerli: {
    //   url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [process.env.PRIVATE_KEY]
    // }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  etherscan: {
    // Your API key for Etherscan
    // apiKey: process.env.ETHERSCAN_API_KEY
  }
};