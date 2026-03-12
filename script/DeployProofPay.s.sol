// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {ProofPayEscrow} from "../src/ProofPayEscrow.sol";
import {ProofPayRegistry} from "../src/ProofPayRegistry.sol";

/**
 * @title DeployProofPay
 * @dev Deployment script for ProofPayEscrow and ProofPayRegistry on Flow EVM Testnet.
 */
contract DeployProofPay is Script {
    function run() external returns (address, address) {
        // Retrieve private key from environment or use a default for simulation
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ProofPayRegistry
        ProofPayRegistry registry = new ProofPayRegistry();
        console2.log("ProofPayRegistry deployed at:", address(registry));

        // Deploy ProofPayEscrow
        ProofPayEscrow escrow = new ProofPayEscrow();
        console2.log("ProofPayEscrow deployed at:", address(escrow));

        vm.stopBroadcast();

        return (address(escrow), address(registry));
    }
}
