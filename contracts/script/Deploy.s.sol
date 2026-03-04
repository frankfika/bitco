// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AgentRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        AgentRegistry registry = new AgentRegistry();

        // Mint Agent #1: Crypto Agent
        registry.mintAgent(
            deployer,
            "Crypto Agent",
            "/api/agent/crypto",
            "Cryptocurrency analysis, market trends, DeFi, and blockchain technology"
        );

        // Mint Agent #2: Code Agent
        registry.mintAgent(
            deployer,
            "Code Agent",
            "/api/agent/code",
            "Smart contract development, Solidity, and programming assistance"
        );

        vm.stopBroadcast();

        console.log("AgentRegistry deployed at:", address(registry));
        console.log("Crypto Agent: tokenId 1");
        console.log("Code Agent: tokenId 2");
    }
}
