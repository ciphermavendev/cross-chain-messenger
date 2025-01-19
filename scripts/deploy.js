const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    const CrossChainMessenger = await hre.ethers.getContractFactory("CrossChainMessenger");
    console.log("Deploying CrossChainMessenger...");
    
    const messenger = await CrossChainMessenger.deploy();
    await messenger.waitForDeployment();
    
    const address = await messenger.getAddress();
    console.log("CrossChainMessenger deployed to:", address);

    // Verify contract if not on localhost
    const network = hre.network.name;
    if (network !== "hardhat" && network !== "localhost") {
        console.log("Waiting for block confirmations...");
        await messenger.deploymentTransaction().wait(6);
        
        console.log("Verifying contract...");
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });